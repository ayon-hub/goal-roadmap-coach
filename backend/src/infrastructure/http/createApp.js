// @ts-check

const express = require("express");
const path = require("path");
const {
  getGoalKeyInput,
  getGoalTextInput,
  getSuggestionInput,
  getEvaluationInput
} = require("./getProgressRequestInput");
const { sendIndexHtml } = require("./sendIndexHtml");
const { sendPublicAppConfig } = require("./sendPublicAppConfig");
const { sendJsonResult } = require("./sendJsonResult");
const {
  getGoalExperience,
  getGoalExperienceFromText,
  buildSuggestedProfile,
  evaluateProfile,
  getInitialQuestionnaire
} = require("../../application/progress/progressService");

/** @typedef {import("express").Application} Application */
/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */

/**
 * @returns {Application}
 */
function createApp() {
  const app = express();
  const publicPath = path.join(__dirname, "../../../../frontend/public");

  app.use(express.json());
  /** @param {Request} req @param {Response} res */
  app.get("/app-config.js", (req, res) => {
    sendPublicAppConfig(res);
  });
  app.use(express.static(publicPath));

  /** @param {Request} req @param {Response} res */
  app.get("/api/progress/config", (req, res) => {
    sendJsonResult(res, getInitialQuestionnaire());
  });

  /** @param {Request} req @param {Response} res */
  app.get("/api/progress/goals/:goalKey", (req, res) => {
    sendJsonResult(res, getGoalExperience(getGoalKeyInput(req.params)));
  });

  /** @param {Request} req @param {Response} res */
  app.post("/api/progress/goal-plan", (req, res) => {
    sendJsonResult(res, getGoalExperienceFromText(getGoalTextInput(req.body)));
  });

  /** @param {Request} req @param {Response} res */
  app.post("/api/progress/suggestions", (req, res) => {
    sendJsonResult(res, buildSuggestedProfile(getSuggestionInput(req.body)));
  });

  /** @param {Request} req @param {Response} res */
  app.post("/api/progress/evaluations", (req, res) => {
    sendJsonResult(res, evaluateProfile(getEvaluationInput(req.body)));
  });

  /** @param {Request} req @param {Response} res */
  app.get("/", (req, res) => {
    sendIndexHtml(res, publicPath);
  });

  return app;
}

module.exports = {
  createApp
};
