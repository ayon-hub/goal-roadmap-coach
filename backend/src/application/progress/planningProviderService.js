const { goals, getDefaultGoalKey } = require("../../domain/progress/catalogs/defaults");
const { createOllamaGoalPlanProvider } = require("../../infrastructure/ai/ollamaGoalPlanProvider");
const { createProviderFailure } = require("./providerFailure");

const goalPlanCache = {};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getBaseGoal(goalKey) {
  return goals.find((goal) => goal.key === goalKey) || goals[0];
}

function resolveGoalKeyFromText(goalText) {
  const text = String(goalText || "").toLowerCase();

  if (/(exercise|fitness|workout|gym|health|habit)/.test(text)) {
    return "build_exercise_habit";
  }

  if (/(portfolio|case study|project|design work|show my work)/.test(text)) {
    return "finish_portfolio";
  }

  if (/(role|promotion|career|job|interview|leadership)/.test(text)) {
    return "prepare_new_role";
  }

  if (/(finance|money|budget|save|debt|income|spending)/.test(text)) {
    return "improve_finances";
  }

  if (/(focus|attention|distraction|routine|productivity|deep work)/.test(text)) {
    return "regain_focus";
  }

  return getDefaultGoalKey();
}

function normalizeOptionEffects(option, resourceKeys, obstacleKeys) {
  const resourceEffects = {};
  const obstacleEffects = {};
  const rawEffects = option && option.effects ? option.effects : {};
  const rawResourceEffects = rawEffects.resources || {};
  const rawObstacleEffects = rawEffects.obstacles || {};

  resourceKeys.forEach((key) => {
    const value = Number(rawResourceEffects[key] || 0);
    resourceEffects[key] = Number.isFinite(value) ? value : 0;
  });

  obstacleKeys.forEach((key) => {
    const value = Number(rawObstacleEffects[key] || 0);
    obstacleEffects[key] = Number.isFinite(value) ? value : 0;
  });

  return {
    resources: resourceEffects,
    obstacles: obstacleEffects
  };
}

function slugifyValue(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function humanizeValue(value, fallback) {
  const source = String(value || "").trim();

  if (!source) {
    return fallback;
  }

  return source
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createGeneratedOptions(question, base) {
  const initialLabel =
    question && question.initial
      ? humanizeValue(question.initial, "Current Fit")
      : humanizeValue(base.initial, "Current Fit");
  const initialValue = slugifyValue(
    question && question.initial ? question.initial : base.initial,
    "current_fit"
  );

  return [
    {
      value: `less_${initialValue}`,
      label: `Less than ${initialLabel.toLowerCase()}`
    },
    {
      value: initialValue,
      label: initialLabel
    },
    {
      value: `more_${initialValue}`,
      label: `More than ${initialLabel.toLowerCase()}`
    }
  ];
}

function normalizePlan(rawPlan, baseGoal) {
  const fallback = clone(baseGoal);
  const rawResources =
    rawPlan && Array.isArray(rawPlan.resources)
      ? rawPlan.resources.slice(0, fallback.resources.length)
      : null;
  const rawObstacles =
    rawPlan && Array.isArray(rawPlan.obstacles)
      ? rawPlan.obstacles.slice(0, fallback.obstacles.length)
      : null;
  const rawQuestions =
    rawPlan && Array.isArray(rawPlan.questions)
      ? rawPlan.questions.slice(0, fallback.questions.length)
      : Array.isArray(rawPlan)
      ? rawPlan.slice(0, fallback.questions.length)
      : [];

  if (rawQuestions.length === 0) {
    return null;
  }

  const resources = fallback.resources.map((base, index) => {
    const resource = rawResources ? rawResources[index] : null;
    return {
      key: base.key,
      label: resource && resource.label ? String(resource.label) : base.label,
      description:
        resource && resource.description ? String(resource.description) : base.description,
      value: typeof base.value === "number" ? base.value : 4,
      note: ""
    };
  });

  const obstacles = fallback.obstacles.map((base, index) => {
    const obstacle = rawObstacles ? rawObstacles[index] : null;
    return {
      key: base.key,
      label: obstacle && obstacle.label ? String(obstacle.label) : base.label,
      description:
        obstacle && obstacle.description ? String(obstacle.description) : base.description,
      value: 0,
      active: false,
      note: ""
    };
  });

  const resourceKeys = resources.map((resource) => resource.key);
  const obstacleKeys = obstacles.map((obstacle) => obstacle.key);

  const questions = rawQuestions.map((question, index) => {
    const base = fallback.questions[index] || fallback.questions[fallback.questions.length - 1];
    const rawOptions =
      question && Array.isArray(question.options)
        ? question.options.slice(0, 3)
        : question && Array.isArray(question.optionValues)
        ? question.optionValues.slice(0, 3).map((value, optionIndex) => ({
            value: String(value),
            label: base.options[optionIndex] ? base.options[optionIndex].label : String(value)
          }))
        : createGeneratedOptions(question || {}, base);
    const normalizedOptions =
      rawOptions.length === 3 ? rawOptions : createGeneratedOptions(question || {}, base);
    const normalizedInitialValue =
      question && question.initial ? slugifyValue(question.initial, base.initial) : base.initial;

    return {
      key: question && question.key ? String(question.key) : base.key,
      prompt: question && question.prompt ? String(question.prompt) : base.prompt,
      initial: normalizedOptions.some((option) => option.value === normalizedInitialValue)
        ? normalizedInitialValue
        : normalizedOptions[1]
        ? normalizedOptions[1].value
        : normalizedOptions[0].value,
      options: normalizedOptions.map((option, optionIndex) => {
        const baseOption = base.options[optionIndex];
        return {
          value:
            option && option.value
              ? slugifyValue(
                  option.value,
                  baseOption ? baseOption.value : `option_${optionIndex + 1}`
                )
              : baseOption.value,
          label: option && option.label ? String(option.label) : baseOption.label,
          effects: normalizeOptionEffects(option, resourceKeys, obstacleKeys)
        };
      })
    };
  });

  return {
    key: fallback.key,
    label: fallback.label,
    description:
      rawPlan && rawPlan.description ? String(rawPlan.description) : fallback.description,
    provider: rawPlan && rawPlan.provider ? String(rawPlan.provider) : null,
    providerError: rawPlan && rawPlan.providerError ? String(rawPlan.providerError) : null,
    questions,
    resources,
    obstacles
  };
}

function createMockGoalPlanProvider() {
  return {
    name: "mock",
    async check() {
      return "OK";
    },
    async generate(goalText, baseGoal, goalKey) {
      return {
        plan: clone(getBaseGoal(goalKey)),
        providerContext: null
      };
    }
  };
}

function createPlanningProvider() {
  const providerName = String(process.env.PLANNING_PROVIDER || "mock").toLowerCase();

  if (providerName === "ollama") {
    return createOllamaGoalPlanProvider();
  }

  return createMockGoalPlanProvider();
}

async function checkPlanningProvider() {
  const provider = createPlanningProvider();

  if (!provider.check) {
    return {
      provider: provider.name,
      ok: true,
      message: "no explicit provider check"
    };
  }

  try {
    const response = await provider.check();
    return {
      provider: provider.name,
      ok: true,
      message: String(response || "").trim()
    };
  } catch (error) {
    return {
      provider: provider.name,
      ok: false,
      message: error && error.message ? error.message : "Unknown provider check error"
    };
  }
}

async function loadGoalPlan(goalKey, goalText, providerContext) {
  const resolvedGoalKey = goalKey || getDefaultGoalKey();
  const provider = createPlanningProvider();
  const cacheGoalText = String(goalText || "")
    .trim()
    .toLowerCase();
  const cacheKey = `${provider.name}:${resolvedGoalKey}:${cacheGoalText}`;

  if (goalPlanCache[cacheKey]) {
    return clone(goalPlanCache[cacheKey]);
  }

  const baseGoal = getBaseGoal(resolvedGoalKey);

  try {
    const generated = await provider.generate(
      goalText || baseGoal.label,
      clone(baseGoal),
      resolvedGoalKey,
      providerContext
    );
    const generatedPlan = generated && generated.plan ? generated.plan : generated;
    const normalized = normalizePlan(generatedPlan, baseGoal);

    if (!normalized) {
      throw new Error("Generated goal plan did not match the required schema");
    }

    normalized.provider = provider.name;
    normalized.providerError = null;
    normalized.providerContext =
      generated && Object.prototype.hasOwnProperty.call(generated, "providerContext")
        ? generated.providerContext
        : null;
    goalPlanCache[cacheKey] = normalized;
    return clone(normalized);
  } catch (error) {
    const details = error && error.message ? error.message : error;
    console.error("[planning-provider] request failed:", details);
    if (error && error.stack) {
      console.error(error.stack);
    }
    throw createProviderFailure("planning step", provider.name, error);
  }
}

module.exports = {
  checkPlanningProvider,
  loadGoalPlan,
  resolveGoalKeyFromText
};
