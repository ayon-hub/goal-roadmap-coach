// Runtime compatibility shim.
// Keep this file aligned with sendJsonResult.ts until backend runtime compilation is introduced.

const { sendError } = require("./sendError");

function sendJsonResult(res, operation, onError) {
  operation
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      if (onError) {
        onError(error);
      }

      sendError(res, error);
    });
}

module.exports = {
  sendJsonResult
};
