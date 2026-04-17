const assert = require("assert");
const http = require("http");

const { createApp } = require("../src/infrastructure/http/createApp");

function request(port, path, method, payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : null;
    const requestInstance = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: body
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(body)
            }
          : undefined
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );

    requestInstance.on("error", reject);

    if (body) {
      requestInstance.write(body);
    }

    requestInstance.end();
  });
}

function requestJson(port, path, method, payload) {
  return request(port, path, method, payload).then((response) => {
    return {
      statusCode: response.statusCode,
      body: response.body ? JSON.parse(response.body) : null
    };
  });
}

module.exports = [
  {
    name: "progress API returns goal config, suggestions, and evaluations",
    async run() {
      process.env.RESULT_PROVIDER = "mock";
      process.env.PLANNING_PROVIDER = "mock";
      process.env.SUGGESTION_PROVIDER = "mock";
      const app = createApp();
      const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, "127.0.0.1", () => {
          resolve(instance);
        });

        instance.on("error", reject);
      });
      const port = server.address().port;

      try {
        const configResponse = await requestJson(port, "/api/progress/config", "GET");
        assert.strictEqual(configResponse.statusCode, 200);
        assert.strictEqual(configResponse.body.goals.length, 5);
        assert.strictEqual(configResponse.body.selectedGoal, null);
        assert.strictEqual(typeof configResponse.body.providerStatus.ok, "boolean");

        const goalResponse = await requestJson(port, "/api/progress/goals/improve_finances", "GET");
        assert.strictEqual(goalResponse.statusCode, 200);
        assert.strictEqual(goalResponse.body.goal.key, "improve_finances");
        assert.strictEqual(goalResponse.body.goal.resources.length, 4);

        const suggestionResponse = await requestJson(port, "/api/progress/suggestions", "POST", {
          goal: goalResponse.body.goal,
          goalText: "Improve my finances",
          goalKey: "improve_finances",
          answers: {
            money_visibility: "clear",
            expense_control: "good",
            income_stability: "stable",
            support_system: "yes"
          }
        });

        assert.strictEqual(suggestionResponse.statusCode, 200);
        assert.strictEqual(suggestionResponse.body.goal.key, "improve_finances");
        assert.strictEqual(suggestionResponse.body.profile.positiveFactors.length, 4);

        const evaluationResponse = await requestJson(port, "/api/progress/evaluations", "POST", {
          goalKey: "improve_finances",
          goal: "Improve my finances",
          profile: suggestionResponse.body.profile
        });

        assert.strictEqual(evaluationResponse.statusCode, 200);
        assert.strictEqual(typeof evaluationResponse.body.score, "number");
        assert.strictEqual(Array.isArray(evaluationResponse.body.description.actionItems), true);
        assert.strictEqual(Array.isArray(evaluationResponse.body.description.roadmap), true);
        assert.strictEqual(evaluationResponse.body.description.provider, "mock");
      } finally {
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    }
  },
  {
    name: "progress API returns provider errors instead of mock fallback data",
    async run() {
      process.env.PLANNING_PROVIDER = "ollama";
      process.env.SUGGESTION_PROVIDER = "mock";
      process.env.RESULT_PROVIDER = "mock";
      process.env.OLLAMA_ENDPOINT = "http://127.0.0.1:1/api/generate";
      process.env.OLLAMA_TIMEOUT_MS = "50";

      const app = createApp();
      const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, "127.0.0.1", () => {
          resolve(instance);
        });

        instance.on("error", reject);
      });
      const port = server.address().port;

      try {
        const goalPlanResponse = await requestJson(port, "/api/progress/goal-plan", "POST", {
          goalText: "Finish my portfolio"
        });

        assert.strictEqual(goalPlanResponse.statusCode, 502);
        assert.strictEqual(goalPlanResponse.body.code, "PROVIDER_FAILURE");
        assert.ok(
          /Ollama could not complete the planning step/i.test(goalPlanResponse.body.userMessage)
        );
        assert.ok(typeof goalPlanResponse.body.details === "string");
      } finally {
        process.env.PLANNING_PROVIDER = "mock";
        delete process.env.OLLAMA_ENDPOINT;
        delete process.env.OLLAMA_TIMEOUT_MS;
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    }
  },
  {
    name: "progress API normalizes malformed route and body input at the HTTP boundary",
    async run() {
      process.env.RESULT_PROVIDER = "mock";
      process.env.PLANNING_PROVIDER = "mock";
      process.env.SUGGESTION_PROVIDER = "mock";

      const app = createApp();
      const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, "127.0.0.1", () => {
          resolve(instance);
        });

        instance.on("error", reject);
      });
      const port = server.address().port;

      try {
        const goalPlanResponse = await requestJson(port, "/api/progress/goal-plan", "POST", {
          goalText: 123
        });
        assert.strictEqual(goalPlanResponse.statusCode, 200);
        assert.strictEqual(goalPlanResponse.body.goal.requestedGoalText, "");

        const suggestionResponse = await requestJson(port, "/api/progress/suggestions", "POST", []);
        assert.strictEqual(suggestionResponse.statusCode, 200);
        assert.strictEqual(Array.isArray(suggestionResponse.body.profile.positiveFactors), true);

        const evaluationResponse = await requestJson(
          port,
          "/api/progress/evaluations",
          "POST",
          null
        );
        assert.strictEqual(evaluationResponse.statusCode, 200);
        assert.strictEqual(typeof evaluationResponse.body.score, "number");
      } finally {
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    }
  },
  {
    name: "app config endpoint exposes a configurable API base url for the separated frontend",
    async run() {
      process.env.PUBLIC_API_BASE_URL = "https://api.example.com";

      const app = createApp();
      const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, "127.0.0.1", () => {
          resolve(instance);
        });

        instance.on("error", reject);
      });
      const port = server.address().port;

      try {
        const response = await request(port, "/app-config.js", "GET");

        assert.strictEqual(response.statusCode, 200);
        assert.ok(/window\.__APP_CONFIG__/.test(response.body));
        assert.ok(/https:\/\/api\.example\.com/.test(response.body));
      } finally {
        delete process.env.PUBLIC_API_BASE_URL;
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    }
  }
];
