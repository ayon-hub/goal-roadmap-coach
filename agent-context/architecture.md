# Architecture

## Intent

The codebase uses a lightweight DDD-style separation so goal-planning rules are not trapped inside the browser script. The structure is intentionally pragmatic rather than heavy.

## Layer breakdown

### 1. Domain

Location: `src/domain/progress`

Responsibilities:

- default catalogs for five predefined goals, their questions, resources, obstacles, and outcomes
- profile creation and cloning
- score calculation
- roadmap and encouragement narrative generation
- goal-specific answer-to-profile inference

Important files:

- [catalogs/defaults.js](/Users/ayon/REPO/Myself/src/domain/progress/catalogs/defaults.js)
- [entities/progressProfile.js](/Users/ayon/REPO/Myself/src/domain/progress/entities/progressProfile.js)
- [services/progressCalculator.js](/Users/ayon/REPO/Myself/src/domain/progress/services/progressCalculator.js)
- [services/progressNarrative.js](/Users/ayon/REPO/Myself/src/domain/progress/services/progressNarrative.js)
- [services/starterProfileFactory.js](/Users/ayon/REPO/Myself/src/domain/progress/services/starterProfileFactory.js)

Notes:

- `progressCalculator.js` contains value sanitization and final score calculation
- `progressNarrative.js` is now goal-aware and returns action items plus a roadmap
- `defaults.js` is currently the mock source of truth for all five predefined goal flows
- module paths still say `progress`, but the business meaning is now roadmap coaching

### 2. Application

Location: `src/application/progress`

Responsibilities:

- compose domain logic into use-cases for the UI and API
- own wizard flow behavior independent of the DOM

Important files:

- [progressService.js](/Users/ayon/REPO/Myself/src/application/progress/progressService.js)
- [flowService.js](/Users/ayon/REPO/Myself/src/application/progress/flowService.js)
- [planningProviderService.js](/Users/ayon/REPO/Myself/src/application/progress/planningProviderService.js)
- [suggestionProviderService.js](/Users/ayon/REPO/Myself/src/application/progress/suggestionProviderService.js)
- [resultProviderService.js](/Users/ayon/REPO/Myself/src/application/progress/resultProviderService.js)

Notes:

- `progressService.js` exposes:
  - `getInitialQuestionnaire()`
  - `getGoalExperience(goalKey)`
  - `buildSuggestedProfile(input)`
  - `evaluateProfile(input)`
- `buildSuggestedProfile(input)` now supports `{ goalKey, answers }`
- `evaluateProfile(input)` now supports `{ goalKey, goal, profile }`
- `resultProviderService.js` selects `mock` or `ollama` for the result narrative
- `planningProviderService.js` selects `mock` or `ollama` for goal-plan generation
- `planningProviderService.js` now accepts dynamic question keys and can synthesize multiple-choice options when Ollama omits them
- `suggestionProviderService.js` now accepts resource arrays, wrapped arrays, and compact key/value maps
- `resultProviderService.js` can merge repaired partial result payloads with deterministic fallback narrative fields
- `flowService.js` exposes:
  - `STEP_ORDER`
  - `createFlowState()`
  - `unlockStep()`
  - `goToStep()`
  - `moveStep()`
  - `canVisitStep()`

### 3. Infrastructure

Location: `src/infrastructure/http`

Responsibilities:

- Express app creation
- static file serving
- JSON API endpoints

Important file:

- [createApp.js](/Users/ayon/REPO/Myself/src/infrastructure/http/createApp.js)
- [ollamaResultProvider.js](/Users/ayon/REPO/Myself/src/infrastructure/ai/ollamaResultProvider.js)
- [ollamaGoalPlanProvider.js](/Users/ayon/REPO/Myself/src/infrastructure/ai/ollamaGoalPlanProvider.js)

Current endpoints:

- `GET /api/progress/config`
- `POST /api/progress/goal-plan`
- `POST /api/progress/suggestions`
- `POST /api/progress/evaluations`
- `GET /`

### 4. Presentation

Location: `public`

Responsibilities:

- render the goal-first wizard UI and persistent roadmap results panel
- fetch API data
- hold browser-only state
- apply theme switching

Important files:

- [index.html](/Users/ayon/REPO/Myself/public/index.html)
- [script.js](/Users/ayon/REPO/Myself/public/script.js)
- [style.css](/Users/ayon/REPO/Myself/public/style.css)

## SOLID interpretation in this repo

- Single Responsibility: score rules, roadmap narrative, flow rules, HTTP wiring, and DOM rendering are split
- Open/Closed: new narrative rules or flow rules should be added in domain/application layers without rewriting transport
- Liskov: not especially object-oriented here; functions and data structures are used instead of inheritance
- Interface Segregation: the UI depends on small application services rather than raw domain internals
- Dependency Inversion: browser and HTTP entry points depend on application/domain modules, not the other way around

## Practical extension points

- add or change predefined mock goals in `defaults.js`, then update inference logic in `starterProfileFactory.js`
- change output tone, action items, or roadmap logic in `progressNarrative.js`
- add new supports or friction items in `defaults.js`
- change flow sequence or locking rules in `flowService.js`
- add local storage or export features in the presentation layer, while keeping roadmap generation in the domain/application layers
- introduce provider abstractions for dynamic generation and add an Ollama-backed implementation before hosted providers
- keep obstacle handling lightweight/local unless product needs justify moving it back into AI generation
