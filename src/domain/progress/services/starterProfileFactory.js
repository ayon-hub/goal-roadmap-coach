const { createProgressProfile } = require("../entities/progressProfile");
const { clamp } = require("./progressCalculator");

function adjustItemValue(items, key, delta) {
  const item = items.find((entry) => entry.key === key);

  if (!item) {
    return;
  }

  item.value = clamp((item.value || 0) + delta);
}

function adjustObstacle(items, key, delta) {
  const obstacle = items.find((entry) => entry.key === key);

  if (!obstacle) {
    return;
  }

  obstacle.value = clamp((obstacle.value || 0) + delta);
  obstacle.active = obstacle.value > 0;
}

function applyOptionEffects(profile, option) {
  const effects = option && option.effects ? option.effects : {};
  const resourceEffects = effects.resources || {};
  const obstacleEffects = effects.obstacles || {};

  Object.keys(resourceEffects).forEach((key) => {
    adjustItemValue(profile.positiveFactors, key, resourceEffects[key]);
  });

  Object.keys(obstacleEffects).forEach((key) => {
    adjustObstacle(profile.constraints, key, obstacleEffects[key]);
  });
}

function buildProfileFromAnswers(goalPlan, answers) {
  const goal = goalPlan;
  const profile = createProgressProfile({
    positiveFactors: goal.resources.map((resource) => ({
      ...resource,
      value: typeof resource.value === "number" ? resource.value : 4,
      note: resource.note || ""
    })),
    constraints: goal.obstacles.map((obstacle) => ({
      ...obstacle,
      active: false,
      value: 0
    }))
  });

  goal.questions.forEach((question) => {
    const selectedValue = answers && answers[question.key] ? answers[question.key] : question.initial;
    const option = question.options.find((entry) => entry.value === selectedValue) || question.options[0];

    if (!option) {
      return;
    }

    applyOptionEffects(profile, option);
  });

  return profile;
}

module.exports = {
  buildProfileFromAnswers
};
