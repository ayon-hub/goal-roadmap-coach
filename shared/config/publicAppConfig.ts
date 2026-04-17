import type { PublicAppConfig } from "../types/publicAppConfig";

export function normalizeApiBaseUrl(value: string | undefined | null): string {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  return normalized.replace(/\/+$/, "");
}

export function getPublicAppConfig(): PublicAppConfig {
  return {
    apiBaseUrl: normalizeApiBaseUrl(
      process.env.PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ""
    )
  };
}

export function toPublicConfigScript(config: PublicAppConfig): string {
  return `window.__APP_CONFIG__ = Object.freeze(${JSON.stringify(config)});\n`;
}
