// Runtime compatibility shim.
// Keep this file aligned with sendPublicAppConfig.ts until backend runtime compilation is introduced.

const {
  getPublicAppConfig,
  toPublicConfigScript
} = require("../../../../shared/config/publicAppConfig");

function sendPublicAppConfig(res) {
  res.type("application/javascript");
  res.send(toPublicConfigScript(getPublicAppConfig()));
}

module.exports = {
  sendPublicAppConfig
};
