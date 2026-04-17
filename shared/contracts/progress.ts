export interface ChoiceOption {
  value: string;
  label: string;
}

export interface GoalQuestion {
  key: string;
  prompt: string;
  initial: string;
  options: ChoiceOption[];
}

export interface GoalResource {
  key: string;
  label: string;
  description: string;
}

export interface GoalObstacle {
  key: string;
  label: string;
  description: string;
}

export interface GoalPlan {
  key: string;
  label: string;
  description: string;
  provider: string | null;
  providerError: string | null;
  questions: GoalQuestion[];
  resources: GoalResource[];
  obstacles: GoalObstacle[];
  providerContext: unknown | null;
}

export interface ProfileFactor {
  key: string;
  label: string;
  description?: string;
  value: number;
  note?: string;
}

export interface ProfileConstraint {
  key: string;
  label: string;
  description?: string;
  active: boolean;
  value: number;
  note?: string;
  custom?: boolean;
}

export interface ProgressProfile {
  positiveFactors: ProfileFactor[];
  constraints: ProfileConstraint[];
  provider?: string;
  providerError?: string | null;
}

export interface ProviderStatus {
  provider: string;
  ok: boolean;
  message: string;
}

export interface GoalPrompt {
  label: string;
  placeholder?: string;
}

export interface GoalSeed {
  key: string;
  label: string;
  description: string;
  provider: string | null;
  providerError: string | null;
}

export interface QuestionnaireConfig {
  goalPrompt: GoalPrompt;
  defaultGoalKey: string;
  goals: GoalSeed[];
  selectedGoal: GoalPlan | null;
  profile: ProgressProfile;
  providerStatus: ProviderStatus;
}

export interface GoalExperience {
  goal: GoalPlan & {
    requestedGoalText?: string;
    resolvedGoalKey?: string;
  };
  profile: ProgressProfile;
  providerContext?: unknown | null;
}

export interface SuggestionRequest {
  goal?: GoalPlan;
  goalText?: string;
  goalKey?: string;
  providerContext?: unknown | null;
  answers?: Record<string, string>;
  answerNotes?: Record<string, string>;
}

export interface SuggestionResponse {
  goal: GoalPlan;
  profile: ProgressProfile;
  providerContext: unknown | null;
}

export interface QuestionResponse {
  key: string;
  prompt: string;
  answer: string;
  note: string;
}

export interface EvaluationRequest {
  goalKey: string;
  goal: string;
  profile: ProgressProfile;
  providerContext?: unknown | null;
  questionResponses?: QuestionResponse[];
}

export interface EvaluationDescription {
  summary: string;
  encouragement: string;
  strengths: string;
  friction: string;
  actionItems: string[];
  roadmap: string[];
  goal: string;
  biggestConstraint: string | null;
  provider: string;
  providerError: string | null;
}

export interface EvaluationOutcome {
  key: string;
  label: string;
  emoji: string;
  image: string;
  alt: string;
}

export interface EvaluationResponse {
  profile: ProgressProfile;
  score: number;
  outcome: EvaluationOutcome;
  description: EvaluationDescription;
}
