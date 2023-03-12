# action-slack

[![Issues](http://img.shields.io/github/issues/titenkov/action-slack.svg?logo=github)](https://github.com/titenkov/action-slack/issues)
![Status](https://img.shields.io/badge/status-active-blue.svg?logo=git)
![License](https://img.shields.io/badge/license-mit-blue.svg?logo=open-source-initiative)
[![Sponsor](https://img.shields.io/badge/sponsor-titenkov-blue.svg?logo=github-sponsors&style=social)](https://github.com/sponsors/titenkov)

GitHub Action to send slack notifications.

![Screenshot](screenshot.png 'Screenshot')

**Usage**:

`- uses: titenkov/action-slack@v1`

**Inputs**:

- **status**: `String`
  The job status: `${{ job.status }}`.

**Environment**:

- **SLACK_WEBHOOK_URL**:
  The URL of the Slack incloming webhook.

**Complete example**:

```
  name: ci
  on: [push]
  jobs:
    ci:
      runs-on: ubuntu-latest
      steps:

        - uses: titenkov/action-slack@v1
          if: ${{ always() }}
          env:
            SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          with:
            status: ${{ job.status }}
```

## License

Project is released under the terms of the MIT License.
