# Goal Roadmap Coach

Small Express and vanilla JavaScript app that now starts from a free-text goal, then moves through suggested questions, resources, obstacles, and a structured result. It is being prepared for stronger dynamic AI-backed behavior.

Package name: `goal-roadmap-coach`

Runtime baseline:

- Node.js `20.x`

## Product direction

The app is no longer framed as a generic progress-scoring demo. Its current purpose is to:

- let a user start from a free-text goal
- map that goal to one of five current mock planning paths
- ask up to four purposeful multiple-choice questions for the selected planning path
- show suggested resources with sliders and note fields
- show three suggested obstacles with explanations
- produce a deterministic point-based result that can later be replaced or augmented by AI

Planned future additions:

- dynamic question generation capped around 4 multiple-choice questions
- dynamic resource suggestions around 4 options
- optional future obstacle inference if the lightweight local obstacle flow becomes limiting
- Ollama-backed local AI experiments for dynamic behavior
- OpenAI-compatible provider integration after the mock/Ollama path is stable
- local storage for action items or saved sessions
- export as text
- export as PDF

## Structure

```text
goal-roadmap-coach/
├── package.json
├── server.js
├── src/
│   ├── application/progress/
│   ├── domain/progress/
│   └── infrastructure/http/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
├── test/
│   ├── flowService.test.js
│   ├── http.test.js
│   ├── progressService.test.js
│   └── run-tests.js
└── agent-context/
```

## Current flow

The left side of the UI is a wizard:

1. Enter a free-text goal
2. Answer four suggested questions for the matched planning path
3. Adjust suggested resources and optional text notes
4. Review three suggested obstacles and set their intensity
5. See the result plus an accordion recap of all inputs

The result panel is shown only on the final step and includes:

- point score
- outcome state
- positive summary
- encouragement
- best supports
- main friction
- action items
- high-level roadmap

## Intended future flow

The desired future product flow is more dynamic than the current implementation:

1. User starts from a viable, achievable, ethical, humanity-based goal
2. System generates up to 4 dynamic multiple-choice questions
3. System proposes 4 support/resource options based on responses so far
4. System proposes 3 likely obstacles, potentially with explanations
5. Final result shows encouragement, actions, roadmap, and a recap of all inputs, likely in an accordion

The current app is an intermediate step toward that direction.

## Near-Term AI Plan

The current implementation is intentionally mock-first.

Planned progression:

1. keep deterministic mock catalogs for local development
2. introduce provider abstractions around dynamic generation
3. experiment with Ollama locally for no-cost dynamic generation
4. optionally add an OpenAI-compatible provider after the prompt and output schema are stable

This is meant to reduce cost and iteration risk while the product shape is still changing.

## Current AI Integration

The app now supports separate provider roles:

- `PLANNING_PROVIDER`
- `SUGGESTION_PROVIDER`
- `RESULT_PROVIDER`

The score and outcome band are still deterministic. Providers can affect:

- goal-plan generation for the question set
- resource suggestions
- result narrative generation

Current Ollama prompt sequence:

1. `GET /api/progress/config`
   Runs only a minimal Ollama liveliness check.
2. `POST /api/progress/goal-plan`
   Sends the user's goal text and asks Ollama for up to 4 wise clarification questions.
3. `POST /api/progress/suggestions`
   Uses the goal, question answers, and user-written notes to find resources.
4. `POST /api/progress/evaluations`
   Combines goal, question responses, resources, and obstacles into constructive feedback, smaller action items, and an ideal roadmap.

Environment variables:

```bash
PLANNING_PROVIDER=mock|ollama
SUGGESTION_PROVIDER=mock|ollama
RESULT_PROVIDER=mock|ollama
OLLAMA_MODEL=qwen2.5:1.5b
OLLAMA_PLANNING_MODEL=qwen2.5:1.5b
OLLAMA_SUGGESTION_MODEL=qwen2.5:1.5b
OLLAMA_RESULT_MODEL=qwen2.5:1.5b
OLLAMA_ENDPOINT=http://127.0.0.1:11434/api/generate
OLLAMA_LOG_PROMPTS=true
OLLAMA_TIMEOUT_MS=90000
OLLAMA_PLANNING_TIMEOUT_MS=90000
OLLAMA_SUGGESTION_TIMEOUT_MS=120000
OLLAMA_RESULT_TIMEOUT_MS=75000
```

Example:

```bash
npm run start:ollama
```

Development mode:

```bash
npm run dev
```

If Ollama is unavailable, the request fails with a user-facing retryable error instead of falling back to mock data.
If Ollama returns `404` for a model request, verify that the exact tag exists in `ollama list` or `/api/tags`.

Prompt logging:

- Ollama requests are logged at the transport boundary by default.
- Set `OLLAMA_LOG_PROMPTS=false` to disable prompt logging.
- The logs include the endpoint, model, and full prompt/response body for each Ollama call.
- Suggestion-stage logs also show repaired payload shape and normalized counts.
- Result-stage logs may show partial JSON repair when truncated output is salvaged.

Timeouts:

- All Ollama timeouts are configurable with env vars.
- `OLLAMA_TIMEOUT_MS` sets a shared fallback timeout.
- Per-stage overrides:
  - `OLLAMA_PLANNING_TIMEOUT_MS`
  - `OLLAMA_SUGGESTION_TIMEOUT_MS`
  - `OLLAMA_RESULT_TIMEOUT_MS`
- Default suggestion timeout is now `120000` ms.

## Architecture

- `src/domain/progress`: core rules for factors, constraints, starter inference, score calculation, and roadmap narrative generation
- `src/application/progress`: use-cases and step-flow rules used by the UI and HTTP layer
- `src/infrastructure/http`: Express setup and API endpoints
- `public`: browser UI, wizard behavior, and rendering
- `test`: executable tests for application flow, service behavior, and HTTP contracts
- `agent-context`: reusable project context for future chats and agents

## API

- `GET /api/progress/config`
  Returns goal prompt metadata, the five current mock planning paths, and provider liveliness status.
- `POST /api/progress/goal-plan`
  Accepts `{ goalText }` and returns the generated question set plus initial profile shell.
- `POST /api/progress/suggestions`
  Accepts `{ goal, goalText, goalKey, answers, answerNotes }` and returns the selected goal plus an inferred profile.
- `POST /api/progress/evaluations`
  Accepts `{ goalKey, goal, profile, questionResponses }` and returns score, state, and narrative output.

## Setup

1. Install dependencies:

   ```bash
   nvm use
   npm install
   ```

2. Start the app:

   ```bash
   npm start
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Open:

   ```text
   http://localhost:3000
   ```

## TDD workflow

- add or update a test in `test/`
- change the application or domain code in `src/`
- verify the HTTP contract still passes
- manually verify the browser flow for any UI changes

## Important notes

- The code still uses `progress` in module paths for continuity, but the product intent is now goal planning and roadmap coaching.
- The test runner is custom because the observed local Node runtime is old and does not support `node --test`.
- Browser DOM behavior is not yet covered by automated tests, so UI changes still need manual verification.
- The current result is still deterministic and point-based. That is intentional while mocking the full flow.
- Mock providers remain the local development default, but Ollama request failures no longer fall back silently.
- The question normalizer now tolerates dynamic keys and missing options by synthesizing renderable multiple-choice options.
- The suggestion normalizer now accepts both structured resource arrays and compact key/value resource maps.
- The result UI intentionally hides provider/fallback labels even when repaired or fallback-backed output is used internally.
