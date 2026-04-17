export interface ProviderFailure extends Error {
  code: "PROVIDER_FAILURE";
  statusCode: number;
  userMessage: string;
  details: string;
}

function toErrorMessage(error: unknown): string {
  if (!error) {
    return "Unknown provider error";
  }

  if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return String(error);
}

export function createProviderFailure(
  stage: string | undefined,
  providerName: string,
  error: unknown
): ProviderFailure {
  const providerLabel = providerName === "ollama" ? "Ollama" : "AI provider";
  const details = toErrorMessage(error);
  const failure = new Error(
    `${providerLabel} could not complete the ${
      stage || "request"
    }. Check that the service is running and try again.`
  ) as ProviderFailure;

  failure.name = "ProviderFailure";
  failure.code = "PROVIDER_FAILURE";
  failure.statusCode = 502;
  failure.userMessage = failure.message;
  failure.details = details;

  return failure;
}
