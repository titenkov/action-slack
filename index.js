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
  if (status.toLowerCase() === 'success') return '🟢'
  if (status.toLowerCase() === 'failure') return '🔴'
  if (status.toLowerCase() === 'cancelled') return '🟡'

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

  const links = {
    job: `<${env.workflowUrl}|${env.job}#${env.runNumber}>`,
    workflowFull: `<${env.workflowUrl}|#${env.runNumber} ${env.workflow} / ${env.job}>`,
    workflowShort: `<${env.workflowUrl}|${env.workflow} #${env.runNumber}>`,
    repository: `<${env.repositoryURL}|${env.repository}>`,
    branch: `<${env.repositoryURL}/tree/${env.branch}|${env.branch}>`,
    commit: `<${env.repositoryURL}/commit/${env.commit}|${env.commit} (${env.branch})>`,
  }

  if (sender.name && sender.link) {
    links.author = `<${sender.link}|${sender.name}>`
  }

  return links
}

try {
  const status = core.getInput('status')

  const env = getEnv()
  const sender = getSender()
  const links = getLinks()

  const originalCommitMessage = github.context.payload.head_commit
    ? github.context.payload.head_commit.message
    : github.context.payload.pull_request && github.context.payload.pull_request.title
    ? github.context.payload.pull_request.title
    : ''

  const newlineIndex = originalCommitMessage.indexOf('\n');

  // Truncate commit message to first line
  let commitMessage = newlineIndex > -1 ? originalCommitMessage.substring(0, newlineIndex) : originalCommitMessage;
  // Truncate commit message to 50 characters
  commitMessage = commitMessage.length >= 50 ? commitMessage.substring(0, 50) + '...' : commitMessage
  // Truncate branch name to 40 characters
  branchName = env.branch.length >= 40 ? env.branch.substring(0, 40) + '...' : env.branch

  const pretext = links.author ? `Workflow ${links.workflowShort} ${getStatusText(status)} by ${links.author}` : `Workflow ${links.workflowShort} ${getStatusText(status)}`

  const text = commitMessage ? `\`${commitMessage}\`` : ''

  const fields = commitMessage && links.author
    ? [
        {
          title: "Workflow",
          value: links.workflowFull,
        },
        {
          title: "Commit",
          value: links.commit,
          short: true,
        },
        {
          title: "Author",
          value: links.author,
          short: true,
        },
      ]
    : [
        {
          title: "Workflow",
          value: links.workflowFull,
        },
      ];

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
        "mrkdwn_in": ["text"],
        "fields": fields,
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
