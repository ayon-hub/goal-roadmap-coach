const { describeState } = require("../../domain/progress/services/progressNarrative");
const { createOllamaResultProvider } = require("../../infrastructure/ai/ollamaResultProvider");
const { createProviderFailure } = require("./providerFailure");

function normalizeList(items, fallback) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeNullableString(value, fallback) {
  if (value === null || value === undefined) {
    return fallback || null;
  }

  const normalized = String(value).trim();

  if (!normalized || normalized.toLowerCase() === "null" || normalized.toLowerCase() === "none") {
    return fallback || null;
  }

  return normalized;
}

function normalizeDescription(raw, fallback, provider, providerError) {
  return {
    summary: String(raw.summary || fallback.summary),
    encouragement: String(raw.encouragement || fallback.encouragement),
    strengths: String(raw.strengths || fallback.strengths),
    friction: String(raw.friction || fallback.friction),
    actionItems: normalizeList(raw.actionItems, fallback.actionItems).slice(0, 3),
    roadmap: normalizeList(raw.roadmap, fallback.roadmap).slice(0, 3),
    goal: String(raw.goal || fallback.goal),
    biggestConstraint: normalizeNullableString(raw.biggestConstraint, fallback.biggestConstraint),
    provider: provider,
    providerError: providerError || null
  };
}

function createMockResultProvider() {
  return {
    name: "mock",
    async generate(input) {
      return {
        description: describeState(input.profile, input.score, input.goal),
        providerContext: input.providerContext || null
      };
    }
  };
}

function createResultProvider() {
  const providerName = String(process.env.RESULT_PROVIDER || "mock").toLowerCase();

  if (providerName === "ollama") {
    return createOllamaResultProvider();
  }

  return createMockResultProvider();
}

async function generateResultDescription(input) {
  const fallback = describeState(input.profile, input.score, input.goal);
  const provider = createResultProvider();

  try {
    const result = await provider.generate(input);
    const description = result && result.description ? result.description : result || {};
    return normalizeDescription(description, fallback, provider.name, null);
  } catch (error) {
    console.error(
      "[result-provider] request failed:",
      error && error.message ? error.message : error
    );
    if (error && error.stack) {
      console.error(error.stack);
    }
    throw createProviderFailure("final result step", provider.name, error);
  }
}

module.exports = {
  generateResultDescription
};
