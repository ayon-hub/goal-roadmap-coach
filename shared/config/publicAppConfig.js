function normalizeApiBaseUrl(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  return normalized.replace(/\/+$/, "");
}

function getPublicAppConfig() {
  return {
    apiBaseUrl: normalizeApiBaseUrl(
      process.env.PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ""
    )
  };
}

function toPublicConfigScript(config) {
  return `window.__APP_CONFIG__ = Object.freeze(${JSON.stringify(config)});\n`;
}

module.exports = {
  getPublicAppConfig,
  toPublicConfigScript
};
