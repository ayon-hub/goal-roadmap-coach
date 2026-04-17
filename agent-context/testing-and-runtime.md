# Testing And Runtime

## Runtime constraints

The local environment observed during work used:

- Node `v10.15.1`

This matters because:

- `node --test` is not available
- built-in `fetch` is not available in Node tests
- test tooling must stay compatible with older Node

## Test strategy

The repo uses a custom test runner:

- [test/run-tests.js](/Users/ayon/REPO/Myself/test/run-tests.js)

It executes simple exported test-case arrays from:

- [test/flowService.test.js](/Users/ayon/REPO/Myself/test/flowService.test.js)
- [test/progressService.test.js](/Users/ayon/REPO/Myself/test/progressService.test.js)
- [test/http.test.js](/Users/ayon/REPO/Myself/test/http.test.js)

## What is covered

### Flow tests

- initial flow state
- step unlocking
- moving between steps
- blocked navigation to locked steps
- revisiting unlocked steps

### Progress service tests

- initial config shape, including the five predefined goals
- starter-answer inference behavior for selected goals
- goal-aware evaluation behavior
- action item and roadmap output shape

### HTTP tests

- config endpoint
- goal-plan endpoint
- suggestions endpoint
- evaluation endpoint
- goal-aware evaluation payload contract
- mock provider contract through the evaluation endpoint

## How to run tests

```bash
npm test
```

## Useful runtime scripts

```bash
npm run start:mock
npm run dev
npm run start:ollama
```

- `dev` and `start:mock` run the full app on mock providers only
- `start:ollama` enables Ollama for planning, suggestions, and results
- `start:ollama` uses the dedicated `scripts/run-ollama.sh` launcher

## Ollama runtime notes

- `GET /api/progress/config` should only perform a minimal provider liveliness check, not the full planning prompt
- The live Ollama prompt flow is:
  1. health check
  2. question generation from goal text
  3. resource suggestion from answers and notes
  4. final result generation from the full user-authored context
- Prompt logging is enabled by default at the Ollama transport boundary
- Set `OLLAMA_LOG_PROMPTS=false` to disable prompt logging
- Logged fields include endpoint, model, prompt text, response text, and provider-stage shape diagnostics
- Result generation may log partial JSON repair when truncated Ollama output is salvaged
- Provider failures should surface as API errors so the UI can keep the user on the same step and offer retry

## Important note about sandboxed environments

Some execution sandboxes block local port binding. The HTTP integration test may require elevated permissions in such environments because it starts the Express app on an ephemeral local port.

## Testing gaps

- no browser DOM tests
- no visual regression tests
- no persistence tests because the app currently does not persist goal sessions or action items
- no export tests because export is not implemented yet
- no live Ollama integration tests in the automated suite
- no automated assertions on prompt log output beyond transport smoke coverage
- no automated DOM coverage for dynamic-question option synthesis or flexible resource rendering

## Guidance for future work

- add tests for new application services first
- prefer testing pure functions over DOM behavior when possible
- keep the custom runner unless the Node version is upgraded
- if local storage is added, test the persistence boundary separately from the roadmap logic
- if export is added, test serialization/output independently from the UI
- if Ollama is added, keep prompt/schema handling testable without requiring the model to run in every unit test
- keep `mock` as the default test provider so automated tests do not depend on a local model
