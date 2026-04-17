const {
  goalPrompt,
  goals,
  outcomeStates,
  getDefaultGoalKey
} = require("../../domain/progress/catalogs/defaults");
const { createProgressProfile } = require("../../domain/progress/entities/progressProfile");
const { calculateScore, sanitizeProfile } = require("../../domain/progress/services/progressCalculator");
const { pickOutcome } = require("../../domain/progress/services/progressNarrative");
const { buildProfileFromAnswers } = require("../../domain/progress/services/starterProfileFactory");
const { generateResultDescription } = require("./resultProviderService");
const { checkPlanningProvider, loadGoalPlan, resolveGoalKeyFromText } = require("./planningProviderService");
const { suggestProfile } = require("./suggestionProviderService");

function toClientGoal(goal) {
  return {
    key: goal.key,
    label: goal.label,
    description: goal.description,
    provider: goal.provider || null,
    providerError: goal.providerError || null,
    questions: goal.questions.map((question) => ({
      key: question.key,
      prompt: question.prompt,
      initial: question.initial,
      options: question.options.map((option) => ({
        value: option.value,
        label: option.label
      }))
    })),
    resources: goal.resources.map((resource) => ({
      key: resource.key,
      label: resource.label,
      description: resource.description
    })),
    obstacles: goal.obstacles.map((obstacle) => ({
      key: obstacle.key,
      label: obstacle.label,
      description: obstacle.description
    })),
    providerContext: goal.providerContext || null
  };
}

function toGoalSeed(goal) {
  return {
    key: goal.key,
    label: goal.label,
    description: goal.description,
    provider: goal.provider || null,
    providerError: goal.providerError || null
  };
}

async function getGoalExperience(goalKey) {
  const goalPlan = await loadGoalPlan(goalKey || getDefaultGoalKey(), "", null);

  return {
    goal: toClientGoal(goalPlan),
    profile: createProgressProfile({
      positiveFactors: goalPlan.resources,
      constraints: goalPlan.obstacles
    })
  };
}

async function getGoalExperienceFromText(goalText) {
  const resolvedGoalKey = resolveGoalKeyFromText(goalText);
  const goalPlan = await loadGoalPlan(resolvedGoalKey, goalText, null);

  return {
    goal: {
      ...toClientGoal(goalPlan),
      requestedGoalText: goalText,
      resolvedGoalKey: resolvedGoalKey
    },
    profile: createProgressProfile({
      positiveFactors: goalPlan.resources,
      constraints: goalPlan.obstacles
    })
  };
}

async function getInitialQuestionnaire() {
  const providerStatus = await checkPlanningProvider();

  return {
    goalPrompt,
    defaultGoalKey: getDefaultGoalKey(),
    goals: goals.map(toGoalSeed),
    selectedGoal: null,
    profile: createProgressProfile({
      positiveFactors: [],
      constraints: []
    }),
    providerStatus
  };
}

async function buildSuggestedProfile(input) {
  const goal = input && input.goal
    ? input.goal
    : await loadGoalPlan(
      input && input.goalKey ? input.goalKey : getDefaultGoalKey(),
      input && input.goalText ? input.goalText : "",
      input && input.providerContext ? input.providerContext : null
    );
  const baseProfile = buildProfileFromAnswers(goal, input && input.answers ? input.answers : {});
  const suggestion = await suggestProfile({
    goal,
    goalText: input && input.goalText ? input.goalText : goal.label,
    answers: input && input.answers ? input.answers : {},
    answerNotes: input && input.answerNotes ? input.answerNotes : {},
    providerContext: input && input.providerContext ? input.providerContext : goal.providerContext || null,
    baseProfile
  });

  return {
    goal: toClientGoal(goal),
    profile: suggestion.profile,
    providerContext: suggestion.providerContext
  };
}

function extractEvaluationInput(input) {
  if (input && input.profile) {
    return {
      goal: input.goal || "",
      goalKey: input.goalKey || getDefaultGoalKey(),
      profile: input.profile,
      questionResponses: input.questionResponses || [],
      providerContext: input.providerContext || null
    };
  }

  return {
    goal: input && input.goal ? input.goal : "",
    goalKey: input && input.goalKey ? input.goalKey : getDefaultGoalKey(),
    profile: input,
    questionResponses: [],
    providerContext: null
  };
}

async function evaluateProfile(input) {
  const evaluationInput = extractEvaluationInput(input || { positiveFactors: [], constraints: [] });
  const safeProfile = sanitizeProfile(evaluationInput.profile);
  const score = calculateScore(safeProfile);
  const goal = goals.find((entry) => entry.key === evaluationInput.goalKey) || goals[0];
  const outcome = pickOutcome(score, outcomeStates);
  const description = await generateResultDescription({
    goal: evaluationInput.goal || goal.label,
    goalKey: goal.key,
    score,
    outcome,
    profile: safeProfile,
    questionResponses: evaluationInput.questionResponses,
    providerContext: evaluationInput.providerContext
  });

  return {
    profile: safeProfile,
    score,
    outcome,
    description
  };
}

module.exports = {
  getGoalExperience,
  getGoalExperienceFromText,
  buildSuggestedProfile,
  evaluateProfile,
  getInitialQuestionnaire
};
