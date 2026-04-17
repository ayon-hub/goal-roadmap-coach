function toErrorMessage(error) {
  if (!error) {
    return "Unknown provider error";
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return String(error);
}

function createProviderFailure(stage, providerName, error) {
  const providerLabel = providerName === "ollama" ? "Ollama" : "AI provider";
  const details = toErrorMessage(error);
  const failure = new Error(
    `${providerLabel} could not complete the ${
      stage || "request"
    }. Check that the service is running and try again.`
  );

  failure.name = "ProviderFailure";
  failure.code = "PROVIDER_FAILURE";
  failure.statusCode = 502;
  failure.userMessage = failure.message;
  failure.details = details;

  return failure;
}

module.exports = {
  createProviderFailure
};
