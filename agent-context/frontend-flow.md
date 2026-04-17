# Frontend Flow

## Current UX model

The left panel is a step-by-step wizard. The result panel appears only on the final step.

### Left-side flow

1. Goal
2. Questions
3. Resources
4. Obstacles
5. Result

### Final result panel

Visible only on the `result` step. Shows:

- outcome label
- point score
- selected goal
- summary
- encouragement
- best supports
- main friction
- action items
- roadmap

## How step progression works

- Initial state starts on `goal`
- Only `goal` is unlocked at first
- The first step includes a free-text goal textarea
- After goal processing, `questions` becomes reachable
- After answers are processed, `resources` becomes reachable
- Navigation uses breadcrumb buttons and back/continue buttons
- Locked steps should not be directly accessible
- Revisiting an earlier unlocked step is allowed
- Continue-driven API calls should block navigation until the response comes back

## How recalculation works

### Goal step

- User types a free-text goal
- Client does not call the backend on each keystroke
- Initial page load calls `GET /api/progress/config`, which should only perform a provider liveliness check and load static metadata
- Pressing `Continue` calls `POST /api/progress/goal-plan`
- Returned question set replaces the current questions and base profile shell
- Planning normalization accepts dynamic question keys and can synthesize 3 options if Ollama omits them

### Questions step

- User changes goal-specific answers
- Each question also has an optional free-text field for user context
- Client does not call the backend on each answer change
- Pressing `Continue` calls `POST /api/progress/suggestions`
- Returned profile replaces the current resources only; predefined obstacles stay local
- Suggestions accept both structured resource arrays and compact key/value maps

### Resources step

- Suggested resources are shown as sliders
- Each resource includes an optional free-text note box
- Adjusting a resource updates the current profile
- No backend call is made while editing this step

### Obstacles step

- User reviews the three suggested obstacles with explanations
- User toggles obstacles on or off
- Each obstacle includes an optional free-text note box
- User can add custom obstacles incrementally using text fields
- Active obstacles get sliders
- Adjusting an obstacle updates the current profile
- Pressing `Continue` calls `POST /api/progress/evaluations`

### Result step

- Shows an accordion-style recap of goal, answers, resources, and obstacles on the left panel
- Final result panel shows the outcome display
- Provider/fallback labels are intentionally hidden in the result UI
- Partial Ollama result JSON may be repaired behind the scenes before rendering

## Important implementation notes

- Step visibility is controlled with the `hidden` attribute in [public/script.js](/Users/ayon/REPO/Myself/public/script.js)
- CSS explicitly enforces `[hidden] { display: none !important; }` in [public/style.css](/Users/ayon/REPO/Myself/public/style.css)
- The renderer should only populate content for the active step to avoid accidentally exposing multiple steps at once
- Question notes are sent to the suggestion provider
- Resource and obstacle notes are included in the final result request context

## Common pitfalls for future agents

- do not reintroduce all-step rendering in `renderCurrentStep()`
- do not drift back to the old predefined goal selector as the first step
- do not mix flow rules directly into multiple DOM handlers if they can live in `flowService.js`
- if changing goal catalogs, update both the UI contract and the test fixtures
- if changing the number of steps, update both the UI metadata and `flowService.js`
- if adding local storage later, keep persistence separate from narrative generation
- if adding AI providers later, keep dynamic generation behind a provider boundary instead of inside the DOM code

## Recommended manual check after UI edits

1. Load the app
2. Confirm only the goal step is visible on the left
3. Confirm page load does not generate the full question set before pressing `Continue`
4. Enter a goal and continue
5. Confirm the suggested question set appears
6. If Ollama planning is enabled, confirm dynamically generated questions still render even when the model omitted explicit options
7. Answer the questions and continue
8. Confirm suggested resources appear with note boxes
9. Move to obstacles and confirm the three obstacle cards show explanations and note boxes
10. Move to result and confirm the accordion recap is shown plus the final result panel
11. Use breadcrumb to go back to goal
12. Change the goal and confirm the question flow changes with it
