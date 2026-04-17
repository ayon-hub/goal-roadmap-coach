// Runtime compatibility shim.
// Keep this file aligned with sendIndexHtml.ts until backend runtime compilation is introduced.

const path = require("path");

function sendIndexHtml(res, publicPath) {
  res.sendFile(path.join(publicPath, "index.html"));
}

module.exports = {
  sendIndexHtml
};
