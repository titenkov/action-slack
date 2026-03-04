# Principles

## Simplicity first
Prefer the simplest solution that works. Avoid abstractions, helpers, and patterns until they are clearly needed. Three similar lines beat a premature abstraction.

## Small changes over large refactorings
Make the smallest change that solves the problem. Do not refactor surrounding code unless asked. If a change feels large, stop and ask.

## Ask before acting on uncertainty
When requirements are unclear or the approach has meaningful trade-offs, ask before writing code. A short question is cheaper than undoing significant work.

## Quality gate after every change
After each change, ensure linters and tests pass. Do not move on with a broken baseline.

## No speculative work
Do not add features, error handling, configurability, or polish that was not asked for. Build exactly what is needed, nothing more.

## Delete over commenting out
Remove dead code entirely. Do not leave commented-out blocks or `// TODO: remove` markers behind.

## Read before modifying
Understand existing code before changing it. Read the relevant files first to avoid breaking implicit contracts or introducing inconsistencies.

## Match existing patterns
When conventions already exist in the codebase, follow them. Do not introduce a second style or a competing abstraction pattern.

## Prefer explicit over implicit
Code should make intent obvious without needing comments. Avoid magic, clever shortcuts, or side effects that aren't visible at the call site.

## One concern per unit
Functions and modules should do one thing. If a name needs "and", it is a signal to split.

## Validate at boundaries only
Trust internal code and framework guarantees. Validate at user input and external API edges. Defensive checks in the middle are noise.

## Propose before implementing improvements
If you notice something worth improving beyond the current task, flag it as a suggestion rather than doing it silently. Let the user decide.
