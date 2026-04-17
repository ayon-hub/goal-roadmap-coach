// @ts-check

/** @typedef {import("../types/publicAppConfig").PublicAppConfig} PublicAppConfig */

/**
 * @param {string | undefined | null} value
 * @returns {string}
 */
function normalizeApiBaseUrl(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  return normalized.replace(/\/+$/, "");
}

/**
 * @returns {PublicAppConfig}
 */
function getPublicAppConfig() {
  return {
    apiBaseUrl: normalizeApiBaseUrl(
      process.env.PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ""
    )
  };
}

/**
 * @param {PublicAppConfig} config
 * @returns {string}
 */
function toPublicConfigScript(config) {
  return `window.__APP_CONFIG__ = Object.freeze(${JSON.stringify(config)});\n`;
}

module.exports = {
  getPublicAppConfig,
  toPublicConfigScript
};
