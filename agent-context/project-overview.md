# Project Overview

## What the app does

This project is now a goal-first roadmap coach with a mixed mock/AI-capable flow. A user:

1. Starts with a free-text goal
2. Receives up to four suggested multiple-choice questions generated from that goal
3. Reviews suggested resources
4. Reviews three suggested obstacles
5. Receives a positive summary, encouragement, action items, and a high-level roadmap

The left-side panel behaves like a wizard. The results panel is shown only on the final step.

## Main product requirements already implemented

- The app starts from a free-text goal
- The current implementation maps that goal to one of five planning paths
- Planning tolerates dynamic Ollama question keys and question-only payloads
- The question step still aims for up to four purposeful questions
- The resources step can render a flexible number of suggested resources
- Each resource includes an optional free-text detail box
- Each path has three related obstacles with explanations
- Each question and each obstacle also includes an optional free-text detail box
- The app should not present all inputs at once
- Breadcrumbs allow revisiting earlier steps
- Revisiting earlier steps should automatically affect later steps
- Results should appear only on the final step
- The output should be positive, motivating, and practical

## Important current behavior

- The flow steps are `goal -> questions -> resources -> obstacles -> result`
- The first step is a free-text goal field
- Only the active left-side step should be visible
- The results panel is hidden until the final step
- `GET /api/progress/config` performs only a lightweight Ollama liveliness check when Ollama planning is enabled
- Pressing `Continue` from `goal` calls the planning endpoint and loads the question set
- Pressing `Continue` from `questions` calls the suggestion endpoint and rebuilds resources only
- Resource sliders and notes affect the client-side state; slider values affect evaluation directly
- Obstacles are local/predefined plus optional custom user-added obstacles
- Obstacle selection, sliders, and notes affect evaluation directly
- The result step includes an accordion-style recap of inputs
- Planning, resource suggestions, and result narrative can each now come from `mock` or `ollama`
- The point score remains deterministic even when Ollama is used
- Ollama prompt logging is enabled by default and can be disabled with `OLLAMA_LOG_PROMPTS=false`
- Result UI no longer exposes provider/fallback labels or fallback reasons

## Current output contract

The narrative output currently includes:

- `summary`
- `encouragement`
- `strengths`
- `friction`
- `actionItems`
- `roadmap`
- `goal`
- `biggestConstraint`

## Key directories

- `src/application/progress`: use-case and flow orchestration logic
- `src/domain/progress`: pure business rules and default catalogs
- `src/infrastructure/http`: Express wiring
- `public`: browser UI
- `test`: automated tests
- `agent-context`: reusable project context for future chats

## Files that matter most

- [server.js](/Users/ayon/REPO/Myself/server.js)
- [src/application/progress/progressService.js](/Users/ayon/REPO/Myself/src/application/progress/progressService.js)
- [src/application/progress/flowService.js](/Users/ayon/REPO/Myself/src/application/progress/flowService.js)
- [src/domain/progress/services/progressCalculator.js](/Users/ayon/REPO/Myself/src/domain/progress/services/progressCalculator.js)
- [src/domain/progress/services/progressNarrative.js](/Users/ayon/REPO/Myself/src/domain/progress/services/progressNarrative.js)
- [src/infrastructure/http/createApp.js](/Users/ayon/REPO/Myself/src/infrastructure/http/createApp.js)
- [public/script.js](/Users/ayon/REPO/Myself/public/script.js)
- [public/index.html](/Users/ayon/REPO/Myself/public/index.html)
- [public/style.css](/Users/ayon/REPO/Myself/public/style.css)

## Current open cautions

- The automated tests cover flow rules, application behavior, and HTTP endpoints, but not browser DOM rendering directly.
- Module names still use `progress` even though the product focus has shifted to goal planning and roadmap coaching.
- Local storage and export features are not implemented yet; they are future direction only.
- The current implementation still normalizes AI output into renderable UI state rather than trusting raw model output.
- Local Ollama now supports planning generation, suggestion generation, and result narrative generation.
- The planning provider now uses a staged prompt flow: liveliness check, question generation, resource suggestions, then final result generation.
- Suggestion normalization now accepts both structured resource arrays and compact key/value resource maps.
- Result generation now repairs partial JSON when possible instead of always falling back immediately.
- The deterministic mock providers remain the safety fallback when Ollama fails or returns invalid schema.
