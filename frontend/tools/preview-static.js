const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT) || 4173;
const publicPath = path.join(__dirname, "../public");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    response.setHeader("Content-Type", contentType);
    response.end(buffer);
  });
}

http
  .createServer((request, response) => {
    const requestPath = request.url === "/" ? "/index.html" : request.url;
    const resolvedPath = path.join(publicPath, decodeURIComponent(requestPath.split("?")[0]));

    if (!resolvedPath.startsWith(publicPath)) {
      response.statusCode = 400;
      response.end("Invalid path");
      return;
    }

    sendFile(response, resolvedPath);
  })
  .listen(port, () => {
    console.log(`Frontend preview running at http://localhost:${port}`);
  });
