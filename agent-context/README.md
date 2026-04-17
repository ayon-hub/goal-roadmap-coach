# Project Context Pack

This folder is intended for reuse in future chats or by other agents working on this repository.

## Suggested read order

1. [default-chat-context.md](/Users/ayon/REPO/Myself/agent-context/default-chat-context.md)
2. [project-overview.md](/Users/ayon/REPO/Myself/agent-context/project-overview.md)
3. [future-direction.md](/Users/ayon/REPO/Myself/agent-context/future-direction.md)
4. [architecture.md](/Users/ayon/REPO/Myself/agent-context/architecture.md)
5. [frontend-flow.md](/Users/ayon/REPO/Myself/agent-context/frontend-flow.md)
6. [testing-and-runtime.md](/Users/ayon/REPO/Myself/agent-context/testing-and-runtime.md)

## Purpose

- capture the current product behavior and direction
- record architectural and testing decisions already made
- preserve runtime constraints
- reduce repeated rediscovery for future chats and agents

## Current snapshot

- App type: small Express + vanilla JS coaching app
- Product focus: start from a free-text goal, use Ollama-backed dynamic generation when available, and keep deterministic local fallback behavior
- Architecture style: lightweight DDD separation with application, domain, infrastructure, and presentation layers
- Interaction model: goal-first multi-step wizard, with the results panel shown only on the final step
- Test style: in-repo custom Node test runner compatible with older Node versions
- Default theme: dark

## Current planned direction

- keep the app focused on positivity, motivation, and achievable action items
- preserve a high-level but convincing roadmap from start to finish
- evolve the wizard into a fully dynamic flow driven by the user goal and prior answers
- keep mocking as the fallback local development strategy for dynamic generation
- use Ollama for local no-cost experiments across planning, suggestions, and result generation
- keep obstacle handling lightweight and mostly local unless there is a strong reason to move it back into AI generation
- later add local storage for action items or saved progress
- later support export as text or PDF
