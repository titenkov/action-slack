/** *****************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Pavel Titenkov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ***************************************************************************** */

const core = require('@actions/core')
const github = require('@actions/github')
const { IncomingWebhook } = require('@slack/webhook')

function getStatusColor(status) {
  if (status.toLowerCase() === 'success') return '#2cbe4e'
  if (status.toLowerCase() === 'failure') return '#cb2431'
  if (status.toLowerCase() === 'cancelled') return '#ffc107'

  return 'warning'
}

function getStatusIcon(status) {
  if (status.toLowerCase() === 'success') return '✅'
  if (status.toLowerCase() === 'failure') return '❌'
  if (status.toLowerCase() === 'cancelled') return '⚠️'

  return '🟡'
}

function getStatusText(status) {
  if (status.toLowerCase() === 'success') return 'completed'
  if (status.toLowerCase() === 'failure') return 'failed'
  if (status.toLowerCase() === 'cancelled') return 'cancelled'

  return 'Unknown'
}

function getEnv() {
  const server = process.env.GITHUB_SERVER_URL
  const repository = process.env.GITHUB_REPOSITORY
  const runId = process.env.GITHUB_RUN_ID
  const env = {
    os: process.env.RUNNER_OS,
    event: process.env.GITHUB_EVENT_NAME,
    job: process.env.GITHUB_JOB,
    workflow: process.env.GITHUB_WORKFLOW,
    workflowUrl: `${server}/${repository}/actions/runs/${runId}`,
    runId: process.env.GITHUB_RUN_ID,
    runNumber: process.env.GITHUB_RUN_NUMBER,
    repository: process.env.GITHUB_REPOSITORY,
    repositoryURL: `${server}/${repository}`,
    commit: process.env.GITHUB_SHA.slice(0, 8),
    branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF.replace('refs/heads/', ''),
    actor: process.env.GITHUB_ACTOR,
    eventPath: process.env.GITHUB_EVENT_PATH,
  }

  return env
}

function getSender() {
  const sender = {
    name: process.env.GITHUB_ACTOR,
    link: `https://github.com/${process.env.GITHUB_ACTOR}`,
    icon: '',
  }

  switch (process.env.GITHUB_EVENT_NAME) {
    case 'issues':
    case 'issue_comment':
    case 'pull_request':
    case 'push':
      sender.name = github.context.payload.sender?.login
      sender.link = github.context.payload.sender?.html_url
      sender.icon = github.context.payload.sender?.avatar_url
      break

    default:
      break
  }

  return sender
}

function getLinks() {
  const env = getEnv()
  const sender = getSender()

  // Truncate branch name to 40 characters
  const branchName = env.branch.length > 40 ? env.branch.substring(0, 40) + '...' : env.branch;

  const links = {
    job: `<${env.workflowUrl}|${env.workflow} #${env.runNumber} / ${env.job}>`,
    workflow: `<${env.workflowUrl}|${env.workflow} #${env.runNumber}>`,
    repository: `<${env.repositoryURL}|${env.repository}>`,
    branch: `<${env.repositoryURL}/tree/${env.branch}|${branchName}>`,
    commit: `<${env.repositoryURL}/commit/${env.commit}|${env.commit}>`,
  }

  if (sender.name && sender.link) {
    links.author = `<${sender.link}|${sender.name}>`
    links.author_icon = `${sender.link}.png?size=32`
  }

  return links
}

try {
  const status = core.getInput('status')

  const env = getEnv()
  const links = getLinks()

  const originalCommitMessage = github.context.payload.head_commit
    ? github.context.payload.head_commit.message
    : github.context.payload.pull_request && github.context.payload.pull_request.title
    ? github.context.payload.pull_request.title
    : ''

  // Truncate commit message to first line and then to 50 characters
  const commitMessage = originalCommitMessage.split('\n')[0].substring(0, 50) + (originalCommitMessage.length > 50 ? '...' : '');

  const pretext = links.author && commitMessage ? `Workflow ${links.workflow} ${getStatusText(status)}` : '';
  const text = links.author && commitMessage
    ? `\`${links.commit}\` - ${commitMessage}\n🧑‍💻 ${links.author} on ${links.branch}`
    : `Workflow ${links.workflow} ${getStatusText(status)}`;

  if (!process.env.SLACK_WEBHOOK_URL) {
    core.setFailed('Missing SLACK_WEBHOOK_URL environment variable')
    return
  }

  const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
  const message = {
    attachments: [
      {
        "color": getStatusColor(status),
        "pretext": pretext,
        "text": text,
        "footer": `${links.repository} | powered by <https://github.com/titenkov/action-slack|action-slack>`,
        "footer_icon": "https://slack.github.com/static/img/favicon-neutral.png",
      }
    ]
  }
  ;(async () => {
    await webhook.send(message)
  })()
} catch (error) {
  core.setFailed(error.message)
}
