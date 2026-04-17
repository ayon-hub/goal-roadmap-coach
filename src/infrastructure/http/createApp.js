const express = require("express");
const path = require("path");
const {
  getGoalExperience,
  getGoalExperienceFromText,
  buildSuggestedProfile,
  evaluateProfile,
  getInitialQuestionnaire
} = require("../../application/progress/progressService");

function sendError(res, error) {
  res.status(error && error.statusCode ? error.statusCode : 500).json({
    error: error && error.message ? error.message : "Unexpected server error",
    userMessage: error && error.userMessage ? error.userMessage : null,
    code: error && error.code ? error.code : "INTERNAL_ERROR",
    details: error && error.details ? error.details : null
  });
}

function createApp() {
  const app = express();
  const publicPath = path.join(__dirname, "../../../public");

  app.use(express.json());
  app.use(express.static(publicPath));

  app.get("/api/progress/config", (req, res) => {
    getInitialQuestionnaire()
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        sendError(res, error);
      });
  });

  app.get("/api/progress/goals/:goalKey", (req, res) => {
    getGoalExperience(req.params.goalKey)
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        sendError(res, error);
      });
  });

  app.post("/api/progress/goal-plan", (req, res) => {
    getGoalExperienceFromText(req.body && req.body.goalText ? req.body.goalText : "")
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        sendError(res, error);
      });
  });

  app.post("/api/progress/suggestions", (req, res) => {
    buildSuggestedProfile(req.body || {})
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        sendError(res, error);
      });
  });

  app.post("/api/progress/evaluations", (req, res) => {
    evaluateProfile(req.body || { positiveFactors: [], constraints: [] })
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        sendError(res, error);
      });
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  return app;
}

module.exports = {
  createApp
};
