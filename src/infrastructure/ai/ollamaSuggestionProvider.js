const { extractJsonObject, requestPrompt } = require("./ollamaClient");

function getTimeoutMs() {
  const value = Number(
    process.env.OLLAMA_SUGGESTION_TIMEOUT_MS || process.env.OLLAMA_TIMEOUT_MS || 120000
  );
  return Number.isFinite(value) && value > 0 ? value : 120000;
}

function buildPrompt(input) {
  const resourceCount = input.baseProfile.positiveFactors.length;
  const questionContext = input.goal.questions.map((question) => {
    return {
      prompt: question.prompt,
      answer: input.answers[question.key] || question.initial,
      note:
        input.answerNotes && input.answerNotes[question.key] ? input.answerNotes[question.key] : ""
    };
  });
  const resourceBlueprint = input.baseProfile.positiveFactors.filter(Boolean).map((resource) => ({
    key: resource.key,
    value: resource.value
  }));

  return [
    "Return only JSON.",
    `Preserve exactly ${resourceCount} resources.`,
    "Focus on the user's goal first, then the user's answers and written details.",
    "Preserve all keys exactly as provided.",
    "You may rewrite labels, descriptions, and values.",
    "For resources, each item must have: key, label, description, value.",
    "Values must be between 0 and 10.",
    "Find 4 resources based on the goal and answered questions.",
    `Goal: ${input.goalText || input.goal.label}`,
    `Question context: ${JSON.stringify(questionContext)}`,
    `Resource blueprint: ${JSON.stringify(resourceBlueprint)}`
  ].join("\n");
}

function extractBalancedArrayAt(text, startIndex) {
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (character === "\\") {
        escaping = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === "[") {
      depth += 1;
      continue;
    }

    if (character === "]") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function repairSuggestionResponse(text) {
  const parsed = extractJsonObject(text);

  if (Array.isArray(parsed)) {
    return {
      positiveFactors: parsed
    };
  }

  if (parsed && (Array.isArray(parsed.positiveFactors) || Array.isArray(parsed.resources))) {
    return parsed;
  }

  if (
    parsed &&
    parsed.profile &&
    (Array.isArray(parsed.profile.positiveFactors) || Array.isArray(parsed.profile.resources))
  ) {
    return parsed.profile;
  }

  if (
    parsed &&
    parsed.data &&
    (Array.isArray(parsed.data.positiveFactors) || Array.isArray(parsed.data.resources))
  ) {
    return parsed.data;
  }

  if (parsed && Array.isArray(parsed.items)) {
    return {
      positiveFactors: parsed.items
    };
  }

  if (parsed && typeof parsed === "object") {
    return parsed;
  }

  const source = String(text || "");
  const repaired = {};
  const fieldMap = [
    { pattern: /"(positiveFactors|resources)"\s*:\s*\[/g, target: "positiveFactors" }
  ];

  fieldMap.forEach((field) => {
    const merged = [];
    let match = field.pattern.exec(source);

    while (match) {
      const arrayStart = source.indexOf("[", match.index);
      const arrayText = arrayStart >= 0 ? extractBalancedArrayAt(source, arrayStart) : null;

      if (arrayText) {
        try {
          const parsedArray = JSON.parse(arrayText);

          if (Array.isArray(parsedArray)) {
            merged.push.apply(merged, parsedArray);
          }
        } catch (error) {
          // Ignore malformed sub-blocks and keep scanning.
        }
      }

      match = field.pattern.exec(source);
    }

    if (merged.length > 0) {
      repaired[field.target] = merged;
    }
  });

  if (!repaired.positiveFactors) {
    const firstArrayStart = source.indexOf("[");
    const arrayText = firstArrayStart >= 0 ? extractBalancedArrayAt(source, firstArrayStart) : null;

    if (arrayText) {
      try {
        const parsedArray = JSON.parse(arrayText);

        if (Array.isArray(parsedArray)) {
          repaired.positiveFactors = parsedArray;
        }
      } catch (error) {
        // Ignore malformed root arrays.
      }
    }
  }

  if (parsed && Array.isArray(parsed.items) && !repaired.positiveFactors) {
    repaired.positiveFactors = parsed.items;
  }

  return repaired;
}

function summarizeSuggestionProfile(profile) {
  if (Array.isArray(profile)) {
    return `array(${profile.length})`;
  }

  if (!profile || typeof profile !== "object") {
    return String(profile);
  }

  const keys = Object.keys(profile);
  return `object keys=[${keys.join(", ")}]`;
}

function createOllamaSuggestionProvider() {
  const endpoint = process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434/api/generate";
  const model = process.env.OLLAMA_SUGGESTION_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

  return {
    name: "ollama",
    async suggest(input) {
      const timeoutMs = getTimeoutMs();
      const response = await requestPrompt(
        endpoint,
        {
          model,
          prompt: buildPrompt(input),
          context: input.providerContext,
          format: "json",
          options: {
            temperature: 0.2,
            num_predict: 280
          }
        },
        `Ollama suggestion request timed out after ${Math.round(timeoutMs / 1000)}s`,
        timeoutMs
      );

      const repairedProfile = repairSuggestionResponse(response.text);
      console.log(
        `[suggestion-provider] repaired response shape: ${summarizeSuggestionProfile(
          repairedProfile
        )}`
      );

      return {
        profile: repairedProfile,
        providerContext: response.context
      };
    }
  };
}

module.exports = {
  createOllamaSuggestionProvider
};
