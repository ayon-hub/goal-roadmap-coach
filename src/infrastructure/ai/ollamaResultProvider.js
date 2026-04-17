const { extractJsonObject, requestPrompt } = require("./ollamaClient");

function getTimeoutMs() {
  const value = Number(process.env.OLLAMA_RESULT_TIMEOUT_MS || process.env.OLLAMA_TIMEOUT_MS || 75000);
  return Number.isFinite(value) && value > 0 ? value : 75000;
}

function buildPrompt(input) {
  const questionResponses = (input.questionResponses || []).map((entry) => ({
    prompt: entry.prompt,
    answer: entry.answer,
    note: entry.note || ""
  }));
  const topResources = input.profile.positiveFactors
    .map((resource) => {
      return {
        label: resource.label,
        value: resource.value,
        note: resource.note || ""
      };
    });
  const obstacles = input.profile.constraints
    .map((constraint) => ({
      label: constraint.label,
      active: Boolean(constraint.active),
      value: constraint.value,
      description: constraint.description || "",
      note: constraint.note || ""
    }));

  return [
    "Return only JSON with this exact shape:",
    '{"summary":"string","encouragement":"string","strengths":"string","friction":"string","actionItems":["string","string","string"],"roadmap":["string","string","string"],"goal":"string","biggestConstraint":"string|null"}',
    "Combine the goal, question answers, resources, and obstacles.",
    "Keep the writing constructive, practical, and precise.",
    "Give smaller action items that feel realistic.",
    "The roadmap should show an ideal way to reach the goal.",
    `Goal: ${input.goal}`,
    `Question responses: ${JSON.stringify(questionResponses)}`,
    `Resources: ${JSON.stringify(topResources)}`,
    `Obstacles: ${JSON.stringify(obstacles)}`,
    `Score hint: ${input.score}/100`,
    `Outcome hint: ${input.outcome.label}`
  ].join("\n");
}

function extractStringField(text, fieldName) {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i");
  const match = String(text || "").match(pattern);

  if (!match) {
    return undefined;
  }

  try {
    return JSON.parse(`"${match[1]}"`);
  } catch (error) {
    return match[1];
  }
}

function extractNullableStringField(text, fieldName) {
  const nullPattern = new RegExp(`"${fieldName}"\\s*:\\s*null`, "i");

  if (nullPattern.test(String(text || ""))) {
    return null;
  }

  return extractStringField(text, fieldName);
}

function extractStringArrayField(text, fieldName) {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, "i");
  const match = String(text || "").match(pattern);

  if (!match) {
    return undefined;
  }

  const itemPattern = /"((?:\\.|[^"\\])*)"/g;
  const items = [];
  let itemMatch = itemPattern.exec(match[1]);

  while (itemMatch) {
    try {
      items.push(JSON.parse(`"${itemMatch[1]}"`));
    } catch (error) {
      items.push(itemMatch[1]);
    }

    itemMatch = itemPattern.exec(match[1]);
  }

  return items.length > 0 ? items : undefined;
}

function repairResultResponse(text) {
  try {
    return extractJsonObject(text);
  } catch (error) {
    const repaired = {};
    const summary = extractStringField(text, "summary");
    const encouragement = extractStringField(text, "encouragement");
    const strengths = extractStringField(text, "strengths");
    const friction = extractStringField(text, "friction");
    const goal = extractStringField(text, "goal");
    const biggestConstraint = extractNullableStringField(text, "biggestConstraint");
    const actionItems = extractStringArrayField(text, "actionItems");
    const roadmap = extractStringArrayField(text, "roadmap");

    if (summary !== undefined) {
      repaired.summary = summary;
    }
    if (encouragement !== undefined) {
      repaired.encouragement = encouragement;
    }
    if (strengths !== undefined) {
      repaired.strengths = strengths;
    }
    if (friction !== undefined) {
      repaired.friction = friction;
    }
    if (actionItems !== undefined) {
      repaired.actionItems = actionItems;
    }
    if (roadmap !== undefined) {
      repaired.roadmap = roadmap;
    }
    if (goal !== undefined) {
      repaired.goal = goal;
    }
    if (biggestConstraint !== undefined) {
      repaired.biggestConstraint = biggestConstraint;
    }

    if (Object.keys(repaired).length === 0) {
      throw error;
    }

    console.warn(
      `[result-provider] Repaired partial Ollama JSON with fields: ${Object.keys(repaired).join(", ")}`
    );

    return repaired;
  }
}

function createOllamaResultProvider() {
  const endpoint = process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434/api/generate";
  const model = process.env.OLLAMA_RESULT_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

  return {
    name: "ollama",
    async generate(input) {
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
            num_predict: 240
          }
        },
        `Ollama request timed out after ${Math.round(timeoutMs / 1000)}s`,
        timeoutMs
      );

      return {
        description: repairResultResponse(response.text),
        providerContext: response.context
      };
    }
  };
}

module.exports = {
  createOllamaResultProvider
};
