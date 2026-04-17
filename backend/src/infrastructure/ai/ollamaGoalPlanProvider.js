const { extractJsonObject, requestPrompt } = require("./ollamaClient");

function getTimeoutMs() {
  const value = Number(
    process.env.OLLAMA_PLANNING_TIMEOUT_MS || process.env.OLLAMA_TIMEOUT_MS || 90000
  );
  return Number.isFinite(value) && value > 0 ? value : 90000;
}

function buildHealthPrompt() {
  return "Reply with exactly OK if you are available.";
}

function buildPrompt(goalText, baseGoal) {
  const questionCount = baseGoal.questions.length;
  const questionBlueprint = baseGoal.questions.map((question) => ({
    key: question.key,
    initial: question.initial,
    optionValues: question.options.map((option) => option.value)
  }));
  const resourceKeys = baseGoal.resources.map((resource) => resource.key);
  const obstacleKeys = baseGoal.obstacles.map((obstacle) => obstacle.key);

  return [
    "Return only JSON.",
    `Create ${questionCount} wise questions for this goal.`,
    "Focus on: intent, readiness, willingness, and origin of the goal.",
    'Return exactly this shape: {"questions":[{"key":"string","prompt":"string","initial":"string","options":[{"value":"string","label":"string"}]}]}',
    "Keep question keys and option values exactly as provided.",
    `Goal: ${goalText}`,
    `Question blueprint: ${JSON.stringify(questionBlueprint)}`,
    `Resource keys for later local mapping: ${JSON.stringify(resourceKeys)}`,
    `Obstacle keys for later local mapping: ${JSON.stringify(obstacleKeys)}`
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

function repairPlanningResponse(text) {
  const parsed = extractJsonObject(text);

  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 1) {
    return parsed;
  }

  const source = String(text || "");
  const mergedQuestions = [];
  const questionsPattern = /"questions"\s*:\s*\[/g;
  let match = questionsPattern.exec(source);

  while (match) {
    const arrayStart = source.indexOf("[", match.index);
    const arrayText = arrayStart >= 0 ? extractBalancedArrayAt(source, arrayStart) : null;

    if (arrayText) {
      try {
        const questionBlock = JSON.parse(arrayText);

        if (Array.isArray(questionBlock)) {
          mergedQuestions.push.apply(mergedQuestions, questionBlock);
        }
      } catch (error) {
        // Ignore malformed sub-blocks and keep scanning for usable ones.
      }
    }

    match = questionsPattern.exec(source);
  }

  if (mergedQuestions.length > 0) {
    return {
      questions: mergedQuestions
    };
  }

  return parsed;
}

function createOllamaGoalPlanProvider() {
  const endpoint = process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434/api/generate";
  const model = process.env.OLLAMA_PLANNING_MODEL || process.env.OLLAMA_MODEL;

  return {
    name: "ollama",
    async check() {
      const timeoutMs = Number(process.env.OLLAMA_HEALTH_TIMEOUT_MS || 10000);
      const response = await requestPrompt(
        endpoint,
        {
          model,
          prompt: buildHealthPrompt(),
          options: {
            temperature: 0
          }
        },
        `Ollama liveliness check timed out after ${Math.round(timeoutMs / 1000)}s`,
        timeoutMs
      );
      return response.text;
    },
    async generate(goalText, baseGoal, providerContext) {
      const timeoutMs = getTimeoutMs();
      const response = await requestPrompt(
        endpoint,
        {
          model,
          prompt: buildPrompt(goalText, baseGoal),
          context: providerContext,
          format: "json",
          options: {
            temperature: 0.2,
            num_predict: 320
          }
        },
        `Ollama goal-plan request timed out after ${Math.round(timeoutMs / 1000)}s`,
        timeoutMs
      );

      return {
        plan: repairPlanningResponse(response.text),
        providerContext: response.context
      };
    }
  };
}

module.exports = {
  createOllamaGoalPlanProvider
};
