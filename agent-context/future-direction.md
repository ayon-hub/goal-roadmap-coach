# Future Direction

## Product intent to preserve

The long-term purpose of this app is not just to score a situation. It is to help a user take a viable, achievable, ethical, humanity-based goal and turn it into a motivating, believable, high-level roadmap.

This file exists so future chats and agents do not drift back toward a static demo mindset.

## Target experience

The desired flow is fully dynamic:

1. User starts with a goal or need to track
2. System validates or reshapes that into a viable, achievable, ethical, humanity-based goal
3. System generates dynamic multiple-choice questions
4. Based on answers so far, system proposes support/resource options
5. Based on all responses so far, system proposes likely obstacles
6. Final result shows encouragement, action items, roadmap, and a recap of all inputs

## Intended step model

### 1. Goal step

- user enters the goal or need
- goal should be concrete enough to act on
- goal should be viable and ethical
- future result generation should be tailored to this goal

### 2. Dynamic questions step

- no more than 5 questions
- questions should be multiple choice
- questions should be generated dynamically from the goal and prior answers
- questions should stay focused and not feel generic
- if a local model returns prompts without choices, the system should continue repairing them into usable multiple-choice UI state

### 3. Resources step

- show a small set of resource options, usually around 4
- resources should be chosen dynamically from the goal and answers so far
- each resource should be understandable and actionable
- user should be able to select or tune them

### 4. Obstacles step

- keep a lightweight set of likely obstacles available
- predefined obstacles plus custom user-entered obstacles are acceptable
- each obstacle may include an explanation
- user should be able to confirm, reject, or tune them

### 5. Result step

- preserve positivity and motivation
- show realistic, achievable action items
- show a high-level but convincing roadmap from start to finish
- show all collected inputs in an accordion or similar expandable recap

## Output style goals

- positive without sounding fake
- practical without becoming generic
- motivating without overpromising
- simple enough for immediate action
- convincing enough that the user feels understood

## Mock-first delivery strategy

The intended near-term implementation path is:

1. keep the whole flow mockable for local development
2. use deterministic goal catalogs first
3. introduce provider boundaries for dynamic generation
4. experiment locally with Ollama for no-cost dynamic generation
5. later replace or augment providers with hosted OpenAI-compatible calls
6. eventually support local storage and export

## Important future features

- local storage for saved action items or session state
- export as text
- export as PDF
- dynamic generation of questions, resources, obstacles, and result content

## Architectural implication

Future agents should prefer a provider-based design:

- `goal analysis provider`
- `dynamic question provider`
- `resource suggestion provider`
- `obstacle suggestion provider`
- `result roadmap provider`

Each provider should support:

- a mock implementation for local no-cost testing
- an Ollama-backed implementation for local no-cost AI experiments
- a hosted implementation later, potentially backed by an LLM

## Near-term execution order

The likely next steps are:

1. keep the deterministic result path as a fallback
2. refine the current Ollama provider-style interfaces
3. improve prompt quality and schema validation for dynamic questions/resources/obstacles/results
4. validate prompt format and output schema locally
5. add local persistence/export after the dynamic layer feels stable
6. only after that, add a hosted provider if quality or speed requires it

## Do not regress to

- a fixed list of starter questions forever
- a fixed static set of resources
- a fixed static set of obstacles
- purely numeric output without meaningful narrative
- exposing every control at once instead of preserving the step flow
