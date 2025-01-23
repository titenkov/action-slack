# action-slack

![Status](https://img.shields.io/badge/status-active-blue.svg?logo=git)
![License](https://img.shields.io/badge/license-mit-blue.svg?logo=open-source-initiative)
[![Sponsor](https://img.shields.io/badge/sponsor-titenkov-blue.svg?logo=github-sponsors&style=social)](https://github.com/sponsors/titenkov)

Workflow status notifications in slack.

![Screenshot](screenshot-v6.png 'Screenshot')

**Usage**:

`- uses: titenkov/action-slack@v6`

**Inputs**:

- **status**: `String`
  The job status: `${{ job.status }}`.

**Environment**:

- **SLACK_WEBHOOK_URL**:
  The URL of Slack incoming webhook.

**Complete example**:

```yaml
  name: ci
  on: [push]
  jobs:
    ci:
      runs-on: ubuntu-latest
      steps:

        - uses: titenkov/action-slack@v6
          if: ${{ always() }}
          env:
            SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          with:
            status: ${{ job.status }}
```

## License
The project is released under the terms of the MIT License.
