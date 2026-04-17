// Runtime compatibility shim.
// Keep this file aligned with sendError.ts until backend runtime compilation is introduced.

function sendError(res, error) {
  res.status(error && error.statusCode ? error.statusCode : 500).json({
    error: error && error.message ? error.message : "Unexpected server error",
    userMessage: error && error.userMessage ? error.userMessage : null,
    code: error && error.code ? error.code : "INTERNAL_ERROR",
    details: error && error.details ? error.details : null
  });
}

module.exports = {
  sendError
};
