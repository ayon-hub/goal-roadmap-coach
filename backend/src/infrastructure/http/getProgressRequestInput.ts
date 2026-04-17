export interface GoalKeyParams {
  goalKey?: unknown;
}

export interface GoalPlanRequestBody {
  goalText?: unknown;
}

export interface ProgressRequestBody {
  [key: string]: unknown;
}

const DEFAULT_EVALUATION_INPUT: ProgressRequestBody = {
  positiveFactors: [],
  constraints: []
};

function isRecord(value: unknown): value is ProgressRequestBody {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getGoalKeyInput(params: GoalKeyParams | null | undefined): string | undefined {
  return typeof params?.goalKey === "string" ? params.goalKey : undefined;
}

export function getGoalTextInput(body: GoalPlanRequestBody | null | undefined): string {
  return typeof body?.goalText === "string" ? body.goalText : "";
}

export function getSuggestionInput(body: unknown): ProgressRequestBody {
  return isRecord(body) ? body : {};
}

export function getEvaluationInput(body: unknown): ProgressRequestBody {
  return isRecord(body) ? body : DEFAULT_EVALUATION_INPUT;
}
