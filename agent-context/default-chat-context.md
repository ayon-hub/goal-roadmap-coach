# Default Chat Context

Use this file first in a new chat when you need a quick, current snapshot of the repository.

## Product state

- Small Express + vanilla JavaScript goal-planning coach
- Default theme is dark
- Main flow is `goal -> questions -> resources -> obstacles -> result`
- Results panel appears only on the final step
- Mock and Ollama now use separate startup flows; Ollama failures do not silently fall back

## Current Ollama flow

1. `GET /api/progress/config`
   - only performs a lightweight liveliness check
2. `POST /api/progress/goal-plan`
   - generates up to 4 questions from the user goal
   - planning normalization is tolerant:
     - accepts dynamic keys like `intent`, `readiness`, `willingness`, `origin`
     - accepts missing options
     - auto-generates 3 options if Ollama omits them
3. `POST /api/progress/suggestions`
   - suggests resources only
   - accepts structured resource arrays, wrapped resource arrays, and compact key/value maps
   - resource counts are flexible; 3 or 4 should not fail
4. `POST /api/progress/evaluations`
   - generates the final narrative
   - partial or truncated JSON is repaired when possible, but provider failures now surface as API errors

## UI behavior

- Goal step only calls planning when the user presses `Continue`
- Questions step renders normalized planning questions
- Resources step uses Ollama suggestions when available and preserves notes
- Obstacles are local/predefined plus optional custom user-added obstacles
- Provider failures open a human-readable retry modal and keep the user on the same step
- Result UI no longer shows provider fallback labels or fallback reasons

## Logging and debugging

- Ollama request/response logging is enabled by default
- `OLLAMA_LOG_PROMPTS=false` disables that logging
- Suggestion-stage logs show repaired payload shape and provider payload shape
- Result-stage logs may show partial JSON repair when truncated output is salvaged

## Known constraints

- Local Node runtime may be old enough that `node --test` is unavailable
- Tests use the custom runner in `test/run-tests.js`
- Some sandboxes block local port binding, which affects HTTP integration tests

## Important files

- [src/application/progress/progressService.js](/Users/ayon/REPO/Myself/src/application/progress/progressService.js)
- [src/application/progress/planningProviderService.js](/Users/ayon/REPO/Myself/src/application/progress/planningProviderService.js)
- [src/application/progress/suggestionProviderService.js](/Users/ayon/REPO/Myself/src/application/progress/suggestionProviderService.js)
- [src/application/progress/resultProviderService.js](/Users/ayon/REPO/Myself/src/application/progress/resultProviderService.js)
- [src/infrastructure/ai/ollamaGoalPlanProvider.js](/Users/ayon/REPO/Myself/src/infrastructure/ai/ollamaGoalPlanProvider.js)
- [src/infrastructure/ai/ollamaSuggestionProvider.js](/Users/ayon/REPO/Myself/src/infrastructure/ai/ollamaSuggestionProvider.js)
- [src/infrastructure/ai/ollamaResultProvider.js](/Users/ayon/REPO/Myself/src/infrastructure/ai/ollamaResultProvider.js)
- [public/script.js](/Users/ayon/REPO/Myself/public/script.js)
- [scripts/run-ollama.sh](/Users/ayon/REPO/Myself/scripts/run-ollama.sh)

## Current cautions

- Small local models still drift on strict JSON, so normalization/repair logic matters
- The app still expects renderable multiple-choice questions and structured resources after normalization
- Result repair helps with truncation, but provider outages now block the step instead of falling back silently
