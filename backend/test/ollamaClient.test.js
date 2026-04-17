const assert = require("assert");
const http = require("http");

const { requestPrompt } = require("../src/infrastructure/ai/ollamaClient");

function startServer(handler) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);

    server.listen(0, "127.0.0.1", () => {
      resolve(server);
    });

    server.on("error", reject);
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : null);
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

module.exports = [
  {
    name: "ollama client uses generate payloads with /api/generate endpoints",
    async run() {
      let capturedPath = null;
      let capturedBody = null;
      const server = await startServer(async (request, response) => {
        capturedPath = request.url;
        capturedBody = await readJsonBody(request);

        response.writeHead(200, {
          "Content-Type": "application/json"
        });
        response.end(JSON.stringify({ response: '{"ok":true}' }));
      });

      try {
        const port = server.address().port;
        const result = await requestPrompt(
          `http://127.0.0.1:${port}/api/generate`,
          {
            model: "test-model",
            prompt: "hello",
            format: "json",
            options: { temperature: 0.2 }
          },
          "timeout",
          1000
        );

        assert.strictEqual(result.text, '{"ok":true}');
        assert.strictEqual(result.context, null);
        assert.strictEqual(capturedPath, "/api/generate");
        assert.strictEqual(capturedBody.prompt, "hello");
        assert.strictEqual(capturedBody.model, "test-model");
        assert.strictEqual(capturedBody.messages, undefined);
        assert.strictEqual(capturedBody.keep_alive, "10m");
      } finally {
        await closeServer(server);
      }
    }
  }
];
