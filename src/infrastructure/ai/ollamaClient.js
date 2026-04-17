const http = require("http");

function shouldLogPrompts() {
  return String(process.env.OLLAMA_LOG_PROMPTS || "true").toLowerCase() !== "false";
}

function shouldReuseContext() {
  return String(process.env.OLLAMA_REUSE_CONTEXT || "false").toLowerCase() === "true";
}

function logPrompt(endpoint, input) {
  if (!shouldLogPrompts()) {
    return;
  }

  console.log("[ollama] request");
  console.log(`endpoint: ${endpoint}`);
  console.log(`model: ${input.model || ""}`);
  console.log("prompt:");
  console.log(input.prompt || "");
  console.log("[ollama] end request");
}

function logResponse(endpoint, model, response) {
  if (!shouldLogPrompts()) {
    return;
  }

  console.log("[ollama] response");
  console.log(`endpoint: ${endpoint}`);
  console.log(`model: ${model || ""}`);
  console.log("text:");
  console.log(response && response.text ? response.text : "");
  console.log("context:");
  console.log(
    response && Array.isArray(response.context) ? `[${response.context.length} tokens]` : "null"
  );
  console.log("[ollama] end response");
}

function requestJson(urlString, payload, timeoutMessage, timeoutMs) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const body = JSON.stringify(payload);
    const request = http.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search || ""}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");

          if (response.statusCode < 200 || response.statusCode >= 300) {
            const error = new Error(
              `Ollama request failed with status ${response.statusCode}: ${raw.slice(0, 500)}`
            );
            error.statusCode = response.statusCode;
            error.rawBody = raw;
            reject(error);
            return;
          }

          try {
            resolve(JSON.parse(raw));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(timeoutMessage));
    });
    request.write(body);
    request.end();
  });
}

function normalizeEndpoint(endpoint) {
  return endpoint || "http://127.0.0.1:11434/api/generate";
}

function buildPayload(endpoint, input) {
  const payload = {
    model: input.model,
    prompt: input.prompt,
    stream: false,
    format: input.format,
    options: input.options,
    keep_alive: process.env.OLLAMA_KEEP_ALIVE || "10m"
  };

  if (shouldReuseContext() && Array.isArray(input.context) && input.context.length > 0) {
    payload.context = input.context;
  }

  return payload;
}

function extractPromptResponse(response) {
  if (response && typeof response.response === "string") {
    return {
      text: response.response,
      context: Array.isArray(response.context) ? response.context : null
    };
  }

  throw new Error("Unexpected Ollama response shape");
}

async function requestPrompt(endpoint, input, timeoutMessage, timeoutMs) {
  const primaryEndpoint = normalizeEndpoint(endpoint);
  logPrompt(primaryEndpoint, input);
  const response = await requestJson(
    primaryEndpoint,
    buildPayload(primaryEndpoint, input),
    timeoutMessage,
    timeoutMs
  );
  const promptResponse = extractPromptResponse(response);
  logResponse(primaryEndpoint, input.model, promptResponse);
  return promptResponse;
}

function extractJsonObject(text) {
  const trimmed = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!trimmed) {
    throw new Error("Empty Ollama response");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const match = trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error(
        `Could not extract JSON object from Ollama response: ${trimmed.slice(0, 500)}`
      );
    }

    return JSON.parse(match[0]);
  }
}

module.exports = {
  extractJsonObject,
  requestPrompt
};
