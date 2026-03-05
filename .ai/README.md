# .ai

AI session logs for this project.

## Structure

```
.ai/
└── archive/          # Session logs, one file per AI working session
    └── README.md     # Archive conventions and naming
```

## Log format

Files live in `archive/` and follow the naming: `YYYY-MM-DD-<type>-<short-name>.md`

Types: `feature`, `fix`, `refactor`, `setup`

Each log captures:
- **What changed** – files and scope
- **Why** – decision rationale and tradeoffs
- **Context** – anything a future agent needs to continue the work

## When to write a log

After any non-trivial AI session: new feature, meaningful fix, architectural decision, or configuration change. Skip for typo fixes and one-liners.
