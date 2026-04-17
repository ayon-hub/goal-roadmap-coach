const { createOllamaSuggestionProvider } = require("../../infrastructure/ai/ollamaSuggestionProvider");
const { createProviderFailure } = require("./providerFailure");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isUsableEntry(entry) {
  return Boolean(entry && typeof entry === "object");
}

function humanizeKey(key) {
  return String(key || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeNumericValue(value, fallback) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, Math.min(10, numericValue)) : fallback;
}

function normalizeResource(raw, fallback) {
  const normalizedKey = raw && raw.key
    ? String(raw.key)
    : fallback && fallback.key
      ? String(fallback.key)
      : "";
  return {
    key: normalizedKey,
    label: raw && raw.label
      ? String(raw.label)
      : fallback && fallback.label
        ? fallback.label
        : humanizeKey(normalizedKey),
    description: raw && raw.description
      ? String(raw.description)
      : fallback && fallback.description
        ? fallback.description
        : "",
    value: raw && raw.value !== undefined && raw.value !== null
      ? normalizeNumericValue(raw.value, fallback && fallback.value !== undefined && fallback.value !== null ? normalizeNumericValue(fallback.value, 4) : 4)
      : fallback && fallback.value !== undefined && fallback.value !== null
        ? normalizeNumericValue(fallback.value, 4)
        : 4,
    note: fallback && fallback.note ? fallback.note : ""
  };
}

function normalizeObstacle(raw, fallback) {
  return {
    key: fallback && fallback.key ? fallback.key : raw && raw.key ? String(raw.key) : "",
    label: raw && raw.label
      ? String(raw.label)
      : fallback && fallback.label
        ? fallback.label
        : humanizeKey(fallback && fallback.key ? fallback.key : raw && raw.key ? raw.key : ""),
    description: raw && raw.description
      ? String(raw.description)
      : fallback && fallback.description
        ? fallback.description
        : "",
    active: Boolean(raw && raw.active),
    value: raw && raw.value !== undefined && raw.value !== null
      ? normalizeNumericValue(raw.value, fallback && fallback.value !== undefined && fallback.value !== null ? normalizeNumericValue(fallback.value, 0) : 0)
      : fallback && fallback.value !== undefined && fallback.value !== null
        ? normalizeNumericValue(fallback.value, 0)
        : 0,
    note: fallback && fallback.note ? fallback.note : ""
  };
}

function extractResourceMap(rawProfile, fallbackProfile) {
  if (!rawProfile || Array.isArray(rawProfile) || typeof rawProfile !== "object") {
    return null;
  }

  const fallbackKeys = fallbackProfile.positiveFactors.filter(isUsableEntry).map((resource) => resource.key);
  const matchedKeys = fallbackKeys.filter((key) => Object.prototype.hasOwnProperty.call(rawProfile, key));

  if (matchedKeys.length === 0) {
    return null;
  }

  return matchedKeys.map((key) => ({
    key,
    value: rawProfile[key]
  }));
}

function extractRawResources(rawProfile, fallbackProfile) {
  if (!rawProfile) {
    return null;
  }

  if (Array.isArray(rawProfile)) {
    return rawProfile;
  }

  if (Array.isArray(rawProfile.positiveFactors)) {
    return rawProfile.positiveFactors;
  }

  if (Array.isArray(rawProfile.resources)) {
    return rawProfile.resources;
  }

  const mappedResources = extractResourceMap(rawProfile, fallbackProfile);

  if (mappedResources) {
    return mappedResources;
  }

  if (rawProfile.profile) {
    return extractRawResources(rawProfile.profile, fallbackProfile);
  }

  if (rawProfile.data) {
    return extractRawResources(rawProfile.data, fallbackProfile);
  }

  return null;
}

function explainProfileFailure(rawProfile, fallbackProfile) {
  if (!rawProfile) {
    return "provider returned no profile payload";
  }

  if (Array.isArray(rawProfile)) {
    return rawProfile.length === 0
      ? "provider returned an empty resource array"
      : "provider returned a resource array, but none of the entries were usable objects";
  }

  if (typeof rawProfile !== "object") {
    return `provider returned ${typeof rawProfile} instead of an object or resource array`;
  }

  const fallbackKeys = fallbackProfile.positiveFactors.filter(isUsableEntry).map((resource) => resource.key);
  const availableKeys = Object.keys(rawProfile);
  const matchingKeys = fallbackKeys.filter((key) => Object.prototype.hasOwnProperty.call(rawProfile, key));

  if (matchingKeys.length > 0) {
    return `provider returned a compact resource value map with keys ${matchingKeys.join(", ")}, but it could not be normalized`;
  }

  if (rawProfile.profile || rawProfile.data) {
    return "provider returned a wrapped payload, but no usable resource array or value map was found inside it";
  }

  if (Array.isArray(rawProfile.positiveFactors) || Array.isArray(rawProfile.resources)) {
    return "provider returned a resource array, but none of the entries were usable objects";
  }

  return `provider returned object keys [${availableKeys.join(", ")}], but expected resources/positiveFactors or resource value keys [${fallbackKeys.join(", ")}]`;
}

function normalizeProfile(rawProfile, fallbackProfile) {
  const rawPositiveFactors = extractRawResources(rawProfile, fallbackProfile);
  const usableResources = Array.isArray(rawPositiveFactors)
    ? rawPositiveFactors.filter(isUsableEntry)
    : null;
  const fallbackResources = Array.isArray(fallbackProfile.positiveFactors)
    ? fallbackProfile.positiveFactors.filter(isUsableEntry)
    : [];
  const fallbackConstraints = Array.isArray(fallbackProfile.constraints)
    ? fallbackProfile.constraints.filter(isUsableEntry)
    : [];

  if (!usableResources || usableResources.length === 0) {
    return null;
  }

  const dynamicResources = usableResources.map((resource, index) => {
    const fallbackResource = fallbackResources.find((entry) => entry.key === resource.key) || fallbackResources[index] || null;
    return normalizeResource(resource, fallbackResource);
  });

  return {
    positiveFactors: dynamicResources,
    constraints: fallbackConstraints.map((constraint) => {
      return normalizeObstacle(null, constraint);
    })
  };
}

function createMockSuggestionProvider() {
  return {
    name: "mock",
    async suggest(input) {
      return {
        profile: clone(input.baseProfile),
        providerContext: input.providerContext || null
      };
    }
  };
}

function createSuggestionProvider() {
  const providerName = String(process.env.SUGGESTION_PROVIDER || "mock").toLowerCase();

  if (providerName === "ollama") {
    return createOllamaSuggestionProvider();
  }

  return createMockSuggestionProvider();
}

async function suggestProfile(input) {
  const provider = createSuggestionProvider();
  const fallback = clone(input.baseProfile);

  try {
    console.log(`[suggestion-provider] invoking provider: ${provider.name}`);
    const result = await provider.suggest(input);
    const rawProfile = result && result.profile ? result.profile : result;
    const rawSummary = Array.isArray(rawProfile)
      ? `array(${rawProfile.length})`
      : rawProfile && typeof rawProfile === "object"
        ? `object keys=[${Object.keys(rawProfile).join(", ")}]`
        : String(rawProfile);
    console.log(`[suggestion-provider] provider payload shape: ${rawSummary}`);
    const droppedFallbackResources = Array.isArray(fallback.positiveFactors)
      ? fallback.positiveFactors.length - fallback.positiveFactors.filter(isUsableEntry).length
      : 0;
    const droppedFallbackConstraints = Array.isArray(fallback.constraints)
      ? fallback.constraints.length - fallback.constraints.filter(isUsableEntry).length
      : 0;

    if (droppedFallbackResources > 0 || droppedFallbackConstraints > 0) {
      console.warn(
        `[suggestion-provider] Ignoring invalid fallback entries: resources=${droppedFallbackResources}, constraints=${droppedFallbackConstraints}`
      );
    }

    const normalized = normalizeProfile(rawProfile, fallback);
    console.log(
      `[suggestion-provider] normalized resources=${normalized && normalized.positiveFactors ? normalized.positiveFactors.length : 0}, constraints=${normalized && normalized.constraints ? normalized.constraints.length : 0}`
    );

    if (!normalized) {
      throw new Error(`Suggested profile did not match the required schema: ${explainProfileFailure(rawProfile, fallback)}`);
    }

    normalized.provider = provider.name;
    normalized.providerError = null;
    return {
      profile: normalized,
      providerContext: result && Object.prototype.hasOwnProperty.call(result, "providerContext")
        ? result.providerContext
        : null
    };
  } catch (error) {
    console.error("[suggestion-provider] request failed:", error && error.message ? error.message : error);
    if (error && error.stack) {
      console.error("[suggestion-provider] stack:");
      console.error(error.stack);
    }
    throw createProviderFailure("resource suggestion step", provider.name, error);
  }
}

module.exports = {
  suggestProfile
};
