// Runtime compatibility shim.
// Keep this file aligned with getProgressRequestInput.ts until backend runtime compilation is introduced.

const DEFAULT_EVALUATION_INPUT = {
  positiveFactors: [],
  constraints: []
};

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getGoalKeyInput(params) {
  return typeof (params && params.goalKey) === "string" ? params.goalKey : undefined;
}

function getGoalTextInput(body) {
  return typeof (body && body.goalText) === "string" ? body.goalText : "";
}

function getSuggestionInput(body) {
  return isRecord(body) ? body : {};
}

function getEvaluationInput(body) {
  return isRecord(body) ? body : DEFAULT_EVALUATION_INPUT;
}

module.exports = {
  getGoalKeyInput,
  getGoalTextInput,
  getSuggestionInput,
  getEvaluationInput
};
