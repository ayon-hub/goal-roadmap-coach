#!/usr/bin/env bash

set -euo pipefail

export PLANNING_PROVIDER="${PLANNING_PROVIDER:-ollama}"
export SUGGESTION_PROVIDER="${SUGGESTION_PROVIDER:-ollama}"
export RESULT_PROVIDER="${RESULT_PROVIDER:-ollama}"
export OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:1.5b}"

node server.js
