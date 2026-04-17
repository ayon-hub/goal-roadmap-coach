function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function normalizeValue(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? clamp(numericValue) : fallback;
}

function getItemValue(items, key) {
  const item = items.find((entry) => entry.key === key);
  return item ? item.value : 0;
}

function getActiveConstraints(constraints) {
  return constraints.filter((constraint) => constraint.active);
}

function sanitizeProfile(profile) {
  return {
    positiveFactors: profile.positiveFactors.map((factor) => ({
      ...factor,
      value: normalizeValue(factor.value, 0)
    })),
    constraints: profile.constraints.map((constraint) => ({
      ...constraint,
      active: Boolean(constraint.active),
      value: normalizeValue(constraint.value, 0)
    }))
  };
}

function calculateScore(profile) {
  const safeProfile = sanitizeProfile(profile);
  const positiveCount = safeProfile.positiveFactors.length || 1;
  const activeConstraints = getActiveConstraints(safeProfile.constraints);
  const resourceAverage =
    safeProfile.positiveFactors.reduce((total, factor) => total + factor.value, 0) / positiveCount;
  const resourceStrengthBonus =
    safeProfile.positiveFactors.filter((factor) => factor.value >= 7).length * 2;
  const obstacleAverage =
    activeConstraints.length > 0
      ? activeConstraints.reduce((total, constraint) => total + constraint.value, 0) / activeConstraints.length
      : 0;
  const obstacleLoadPenalty = activeConstraints.length * 3;
  const score = resourceAverage * 8 + resourceStrengthBonus - obstacleAverage * 5 - obstacleLoadPenalty + 18;

  return clampScore(score);
}

module.exports = {
  calculateScore,
  clamp,
  clampScore,
  getActiveConstraints,
  getItemValue,
  sanitizeProfile
};
