# Production Readiness Tracker

This file is the working source of truth for making this project production ready.

Update rules:

- Change status only when the acceptance criteria for that item are met.
- Keep `Current focus` pointing to exactly one active milestone.
- Add links to PRs, commits, or docs once GitHub is set up.
- Do not start a later milestone until blockers in the current one are resolved.

Status legend:

- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`

## Current State Summary

Project type:

- Small Express backend with vanilla JavaScript frontend
- Mixed runtime in one app process
- Custom test runner exists
- Root `.gitignore` now exists
- No GitHub workflow defined
- No linting, formatting, or code coverage setup
- No pre-commit or commit message hooks
- No frontend/backend separation at repo layout or build level
- No TypeScript
- No deployment, observability, or security baseline yet

Current focus:

- `M1 - Repository and source-control baseline`

Next immediate step:

1. Configure Git identity and create the first baseline commit.
2. Create the GitHub repository and add `origin`.
3. Protect the `main` branch and require pull requests.
4. Move to M2 and formalize the repo hygiene files already added locally.

## Milestone Tracker

| ID | Milestone | Status | Why it matters |
| --- | --- | --- | --- |
| M1 | Repository and source-control baseline | IN_PROGRESS | Without real version control, nothing else is safely manageable |
| M2 | Project hygiene baseline | NOT_STARTED | Ignore generated files, standardize Node/tooling, reduce repo noise |
| M3 | Linting, formatting, tests, coverage, hooks | NOT_STARTED | Enforce basic quality before every commit |
| M4 | CI on GitHub | NOT_STARTED | Quality checks must run in a clean environment |
| M5 | Frontend/backend separation | NOT_STARTED | Needed before production-grade scaling and TypeScript migration |
| M6 | TypeScript migration | NOT_STARTED | Improves maintainability, contracts, and refactoring safety |
| M7 | Configuration and secrets management | NOT_STARTED | Production apps need predictable environment handling |
| M8 | API contracts and validation | NOT_STARTED | Prevent invalid input and undefined runtime behavior |
| M9 | Error handling, logging, and observability | NOT_STARTED | Production failures need traceability |
| M10 | Security baseline | NOT_STARTED | Minimum hardening before deployment |
| M11 | Build and deployment model | NOT_STARTED | Reproducible releases and hosting strategy |
| M12 | Documentation, conventions, and team workflow | NOT_STARTED | Process must be explicit, not tribal knowledge |

## Detailed Plan

### M1 - Repository and source-control baseline

Status: `IN_PROGRESS`

Scope:

- Initialize Git if not already initialized
- Create GitHub repository
- Set default branch, ideally `main`
- Define branch protection
- Decide PR-only workflow

Acceptance criteria:

- Local repo is a valid Git repository
- Remote GitHub origin is configured
- `main` is protected
- Direct pushes to `main` are disabled
- Pull requests are required
- At least one initial baseline commit exists

Deliverables:

- GitHub repository
- Protected branch rules
- `CONTRIBUTING.md` stub or workflow section in docs

Progress:

- DONE: local Git repository initialized
- DONE: local default branch set to `main`
- DONE: contribution and branch/commit conventions documented
- DONE: baseline repo hygiene files added for a clean initial commit
- DONE: package and product naming normalized to `goal-roadmap-coach`
- BLOCKED: create first baseline commit until Git `user.name` and `user.email` are configured
- BLOCKED: create GitHub repository and configure `origin`
- BLOCKED: enable branch protection rules on GitHub

Suggested conventions:

- Branch naming:
  - `feat/<short-name>`
  - `fix/<short-name>`
  - `chore/<short-name>`
  - `docs/<short-name>`
  - `refactor/<short-name>`
- No force-push to shared branches
- Squash merge by default

### M2 - Project hygiene baseline

Status: `NOT_STARTED`

Scope:

- Add root `.gitignore`
- Pin Node version
- Normalize package scripts
- Remove editor-specific and generated artifacts from tracking

Acceptance criteria:

- Root `.gitignore` exists and covers:
  - `node_modules/`
  - `.env`
  - build output
  - coverage output
  - editor folders like `.idea/`, `.vscode/`
  - OS files like `.DS_Store`
  - logs and temp files
- `.nvmrc` or `.node-version` exists
- README uses the chosen Node version
- Repo no longer depends on ignored generated files being committed

Deliverables:

- `.gitignore`
- `.nvmrc`
- script cleanup in `package.json`

Recommended additions:

- `.editorconfig`
- `.gitattributes`

### M3 - Linting, formatting, tests, coverage, hooks

Status: `NOT_STARTED`

Scope:

- Add linting
- Add formatting
- Keep unit tests runnable with one command
- Add coverage
- Add pre-commit automation
- Add commit message validation

Acceptance criteria:

- `npm run lint` exists
- `npm run format:check` exists
- `npm test` runs unit tests
- `npm run coverage` produces a coverage report
- Pre-commit hook runs lint + tests on staged or affected code
- Commit message hook enforces convention

Recommended stack:

- ESLint
- Prettier
- Husky
- lint-staged
- c8 or nyc for coverage
- commitlint

Minimum hook policy:

- `pre-commit`
  - lint staged files
  - run tests or targeted tests
- `commit-msg`
  - conventional commit validation

Suggested scripts:

- `lint`
- `lint:fix`
- `format`
- `format:check`
- `test`
- `coverage`
- `typecheck` once TypeScript exists

Coverage target:

- Initial gate: `70%`
- Raise later to `80%+`

### M4 - CI on GitHub

Status: `NOT_STARTED`

Scope:

- Add GitHub Actions
- Run checks on push and PR
- Block merges on failing checks

Acceptance criteria:

- Workflow exists in `.github/workflows/ci.yml`
- CI runs:
  - install
  - lint
  - test
  - coverage
- Required status checks are configured in GitHub

Nice to have:

- dependency caching
- matrix for supported Node versions

### M5 - Frontend/backend separation

Status: `NOT_STARTED`

Scope:

- Split FE and BE into explicit application boundaries
- Stop serving complex frontend logic from the same loose structure

Recommended target structure:

```text
apps/
  web/
  api/
packages/
  shared/
```

Alternative lower-risk structure:

```text
frontend/
backend/
shared/
```

Acceptance criteria:

- Backend code is isolated from frontend code
- Frontend has its own package and scripts
- Backend has its own package and scripts
- Shared contracts live in one explicit location
- API base URL is configurable

Notes:

- This milestone should happen before broad TypeScript migration
- If you keep vanilla frontend initially, still separate it physically from the backend

### M6 - TypeScript migration

Status: `NOT_STARTED`

Scope:

- Introduce TypeScript incrementally
- Start with backend contracts and shared types
- Migrate frontend next

Migration order:

1. Shared DTOs and API contracts
2. Backend services and routes
3. Frontend state and API client
4. Tests and scripts

Acceptance criteria:

- `tsconfig.json` exists
- `npm run typecheck` exists
- New code is TypeScript by default
- Shared request/response types are defined
- JavaScript is either migrated or clearly isolated

Guidelines:

- Avoid a big-bang rewrite
- Use strict mode
- Prefer explicit types at boundaries

### M7 - Configuration and secrets management

Status: `NOT_STARTED`

Scope:

- Formalize environment variables
- Separate development, test, and production config
- Avoid hidden configuration drift

Acceptance criteria:

- `.env.example` exists
- Required env vars are documented
- Startup validates required configuration
- Secrets are never committed
- Production config is separated from local defaults

Recommended additions:

- `zod` or equivalent env validation
- config module instead of raw `process.env` spread everywhere

### M8 - API contracts and validation

Status: `NOT_STARTED`

Scope:

- Validate request bodies
- Validate response contracts where reasonable
- Make provider failures and client errors distinct

Acceptance criteria:

- Every mutable endpoint validates input
- 4xx vs 5xx behavior is consistent
- Error response shape is documented
- Shared types or schemas define API payloads

Recommended additions:

- `zod`, `valibot`, or `joi`
- OpenAPI spec after contracts stabilize

### M9 - Error handling, logging, and observability

Status: `NOT_STARTED`

Scope:

- Replace ad hoc logging with structured logging
- Add request IDs
- Centralize error handling

Acceptance criteria:

- Structured logger is used
- Request correlation ID exists
- Errors are classified consistently
- Health endpoint exists
- Readiness behavior is defined

Recommended additions:

- `pino`
- request logging middleware
- health checks:
  - `/health`
  - `/ready`

Later additions:

- error tracking
- metrics
- tracing

### M10 - Security baseline

Status: `NOT_STARTED`

Scope:

- Harden HTTP layer
- Limit abuse
- reduce accidental exposure

Acceptance criteria:

- Security headers are configured
- CORS policy is explicit
- Rate limiting is present
- Request body size limits are defined
- Dependency auditing is part of workflow

Recommended additions:

- `helmet`
- `cors`
- `express-rate-limit`
- `npm audit` in CI as advisory or gate

### M11 - Build and deployment model

Status: `NOT_STARTED`

Scope:

- Make deployment reproducible
- Decide hosting model
- Add environment-specific release process

Acceptance criteria:

- Production start command is explicit
- Build pipeline is documented
- Deployment target is chosen
- Rollback path is documented

Recommended additions:

- Dockerfile
- `.dockerignore`
- release workflow
- staging environment before production

Options:

- Single container with FE + BE
- Static FE + API service split

Preferred long-term direction:

- Separate web app deploy from API deploy

### M12 - Documentation, conventions, and team workflow

Status: `NOT_STARTED`

Scope:

- Document contribution rules
- Document architecture and releases
- Define commit and PR conventions

Acceptance criteria:

- `CONTRIBUTING.md` exists
- `ARCHITECTURE.md` exists
- PR template exists
- issue templates exist
- commit convention is documented
- release/versioning strategy is documented

Recommended conventions:

- Conventional Commits
- SemVer for releases
- PR title aligned with commit convention

Suggested commit types:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`
- `ci:`
- `build:`

## Recommended Execution Order

Follow this order:

1. M1 Repository and source-control baseline
2. M2 Project hygiene baseline
3. M3 Linting, formatting, tests, coverage, hooks
4. M4 CI on GitHub
5. M5 Frontend/backend separation
6. M6 TypeScript migration
7. M7 Configuration and secrets management
8. M8 API contracts and validation
9. M9 Error handling, logging, and observability
10. M10 Security baseline
11. M11 Build and deployment model
12. M12 Documentation, conventions, and team workflow

## Immediate Next Tasks

These are the concrete next tasks to execute first:

1. Create a proper GitHub repository and connect this project to it.
2. Add a root `.gitignore`.
3. Add `.nvmrc`.
4. Add `.editorconfig`.
5. Add basic contribution rules.

After M1 and M2 are done, proceed to:

1. ESLint
2. Prettier
3. coverage command
4. Husky
5. lint-staged
6. commitlint
7. GitHub Actions CI

## Progress Log

Use this section to record actual movement.

| Date | Milestone | Change | Status |
| --- | --- | --- | --- |
| 2026-04-17 | Tracker | Created initial production-readiness plan and milestone tracker | DONE |
| 2026-04-17 | M1 | Initialized local Git repository | DONE |
| 2026-04-17 | M1 | Set local default branch to `main` | DONE |
| 2026-04-17 | M1 | Added contribution rules for branching, PRs, and commit conventions | DONE |
| 2026-04-17 | M1 | Added baseline `.gitignore`, `.nvmrc`, and `.editorconfig` for a clean repository start | DONE |
| 2026-04-17 | M1 | Renamed package baseline to `goal-roadmap-coach` | DONE |

## Notes and Risks

- Do not migrate to TypeScript before separating FE and BE, unless the migration is intentionally small and boundary-first.
- Do not add pre-commit hooks before lint/test commands are fast enough for daily use.
- Do not deploy to production before:
  - configuration validation
  - request validation
  - structured logging
  - security headers
  - CI required checks
- If this becomes a multi-person project, branch protection and PR checks move from nice-to-have to mandatory.

## Definition of Production Ready for This Project

This project should be considered production ready only when all of the following are true:

- Source control and GitHub workflow are in place
- Ignore rules and toolchain versions are defined
- Linting, tests, coverage, and hooks are enforced
- CI blocks broken changes
- Frontend and backend are separated
- TypeScript covers application boundaries
- Config and secrets are validated
- APIs validate inputs and document error shapes
- Logging and health checks exist
- Security middleware is enabled
- Deployment is reproducible
- Team conventions are documented
