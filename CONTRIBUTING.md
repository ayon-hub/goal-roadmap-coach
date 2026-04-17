# Contributing

This project is being prepared for production readiness in staged milestones. Until the workflow is fully automated, follow these rules manually.

## Branching

Use short-lived branches from `main`.

Branch naming:

- `feat/<short-name>`
- `fix/<short-name>`
- `chore/<short-name>`
- `docs/<short-name>`
- `refactor/<short-name>`
- `test/<short-name>`

Examples:

- `feat/github-baseline`
- `chore/add-gitignore`
- `refactor/separate-web-api`

## Pull Requests

Rules:

- Do not push directly to `main`
- Open a pull request for every change
- Keep PRs small and scoped to one concern
- Squash merge by default

Each PR should include:

- what changed
- why it changed
- how it was tested
- any follow-up work intentionally left out

## Commits

Use Conventional Commits.

Allowed commit prefixes:

- `feat:`
- `fix:`
- `chore:`
- `docs:`
- `refactor:`
- `test:`
- `ci:`
- `build:`

Examples:

- `chore: initialize git repository baseline`
- `docs: add production readiness tracker`
- `feat: add ollama retry modal`

## Quality Gate

Before opening a PR:

1. Run tests
2. Verify the app still starts locally
3. Keep documentation aligned with behavior

Future milestones will enforce this automatically with:

- linting
- pre-commit hooks
- coverage
- CI

## Protected Branch Policy

Once GitHub is connected, configure `main` with:

- pull request required
- status checks required
- direct pushes disabled
- force pushes disabled
- branch deletion disabled
