const assert = require("assert");

const {
  buildSuggestedProfile,
  evaluateProfile,
  getInitialQuestionnaire
} = require("../src/application/progress/progressService");

module.exports = [
  {
    name: "initial questionnaire exposes five predefined goals with goal-specific shape",
    async run() {
      process.env.RESULT_PROVIDER = "mock";
      const config = await getInitialQuestionnaire();

      assert.strictEqual(typeof config.goalPrompt.label, "string");
      assert.strictEqual(config.goals.length, 5);
      assert.strictEqual(typeof config.defaultGoalKey, "string");
      config.goals.forEach((goal) => {
        assert.strictEqual(typeof goal.label, "string");
        assert.strictEqual(typeof goal.description, "string");
      });
      assert.strictEqual(config.selectedGoal, null);
      assert.strictEqual(config.profile.positiveFactors.length, 0);
      assert.strictEqual(config.profile.constraints.length, 0);
      assert.strictEqual(typeof config.providerStatus.ok, "boolean");
    }
  },
  {
    name: "suggested profile reflects the selected goal and its deterministic answers",
    async run() {
      process.env.RESULT_PROVIDER = "mock";
      const suggestion = await buildSuggestedProfile({
        goal: {
          key: "finish_portfolio",
          label: "Finish my portfolio",
          description: "Organize and complete a portfolio that clearly shows your strongest work.",
          questions: [
            {
              key: "project_selection",
              prompt: "How clear are you on which projects belong in the portfolio?",
              initial: "somewhat",
              options: [
                { value: "clear", label: "Very clear", effects: { resources: { curation_clarity: 3, storytelling: 0, time_blocks: 0, feedback_loop: 0 }, obstacles: { selection_confusion: -2, writing_friction: 0, time_pressure: 0 } } },
                { value: "somewhat", label: "Somewhat clear", effects: { resources: { curation_clarity: 1, storytelling: 0, time_blocks: 0, feedback_loop: 0 }, obstacles: { selection_confusion: 2, writing_friction: 0, time_pressure: 0 } } },
                { value: "unclear", label: "Still unclear", effects: { resources: { curation_clarity: -1, storytelling: 0, time_blocks: 0, feedback_loop: 0 }, obstacles: { selection_confusion: 4, writing_friction: 0, time_pressure: 0 } } }
              ]
            },
            {
              key: "writing_ready",
              prompt: "How ready are you to write case studies or descriptions?",
              initial: "medium",
              options: [
                { value: "ready", label: "Ready to write", effects: { resources: { curation_clarity: 0, storytelling: 3, time_blocks: 0, feedback_loop: 0 }, obstacles: { selection_confusion: 0, writing_friction: -2, time_pressure: 0 } } },
                { value: "medium", label: "I can draft with effort", effects: { resources: { curation_clarity: 0, storytelling: 1, time_blocks: 0, feedback_loop: 0 }, obstacles: { selection_confusion: 0, writing_friction: 2, time_pressure: 0 } } },
                { value: "stuck", label: "I feel stuck", effects: { resources: { curation_clarity: 0, storytelling: -1, time_blocks: 0, feedback_loop: 0 }, obstacles: { selection_confusion: 0, writing_friction: 4, time_pressure: 0 } } }
              ]
            },
            {
              key: "available_time",
              prompt: "How much focused time can you protect each week?",
              initial: "some",
              options: [
                { value: "enough", label: "Enough time", effects: { resources: { curation_clarity: 0, storytelling: 0, time_blocks: 3, feedback_loop: 0 }, obstacles: { selection_confusion: 0, writing_friction: 0, time_pressure: -2 } } },
                { value: "some", label: "Some time", effects: { resources: { curation_clarity: 0, storytelling: 0, time_blocks: 1, feedback_loop: 0 }, obstacles: { selection_confusion: 0, writing_friction: 0, time_pressure: 2 } } },
                { value: "very_little", label: "Very little time", effects: { resources: { curation_clarity: 0, storytelling: 0, time_blocks: -1, feedback_loop: 0 }, obstacles: { selection_confusion: 0, writing_friction: 0, time_pressure: 4 } } }
              ]
            },
            {
              key: "feedback_access",
              prompt: "Can you get feedback from someone whose taste you trust?",
              initial: "limited",
              options: [
                { value: "yes", label: "Yes, easily", effects: { resources: { curation_clarity: 0, storytelling: 0, time_blocks: 0, feedback_loop: 3 }, obstacles: { selection_confusion: 0, writing_friction: 0, time_pressure: 0 } } },
                { value: "limited", label: "Somewhat", effects: { resources: { curation_clarity: 0, storytelling: 0, time_blocks: 0, feedback_loop: 1 }, obstacles: { selection_confusion: 0, writing_friction: 0, time_pressure: 0 } } },
                { value: "no", label: "Not really", effects: { resources: { curation_clarity: 0, storytelling: 0, time_blocks: 0, feedback_loop: -1 }, obstacles: { selection_confusion: 0, writing_friction: 0, time_pressure: 0 } } }
              ]
            }
          ],
          resources: [
            { key: "curation_clarity", label: "Project Curation", description: "Confidence in which pieces belong in the portfolio.", value: 4, note: "" },
            { key: "storytelling", label: "Case Study Writing", description: "Ability to explain context, process, and outcomes clearly.", value: 4, note: "" },
            { key: "time_blocks", label: "Focused Time Blocks", description: "Protected time for editing, writing, and polishing.", value: 4, note: "" },
            { key: "feedback_loop", label: "Feedback Loop", description: "Trusted input that helps you improve faster.", value: 4, note: "" }
          ],
          obstacles: [
            { key: "selection_confusion", label: "Selection Confusion", description: "Too many possible pieces make it hard to choose a final set.", value: 0, active: false, note: "" },
            { key: "writing_friction", label: "Writing Friction", description: "Explaining the work feels harder than doing the work.", value: 0, active: false, note: "" },
            { key: "time_pressure", label: "Time Pressure", description: "Portfolio work keeps losing against more urgent tasks.", value: 0, active: false, note: "" }
          ]
        },
        goalKey: "finish_portfolio",
        goalText: "Finish my portfolio",
        answers: {
          project_selection: "clear",
          writing_ready: "ready",
          available_time: "enough",
          feedback_access: "yes"
        }
      });

      const curation = suggestion.profile.positiveFactors.find((factor) => factor.key === "curation_clarity");
      const writing = suggestion.profile.positiveFactors.find((factor) => factor.key === "storytelling");
      const writingFriction = suggestion.profile.constraints.find((constraint) => constraint.key === "writing_friction");

      assert.strictEqual(suggestion.goal.key, "finish_portfolio");
      assert.strictEqual(suggestion.goal.questions.length, 4);
      assert.ok(curation.value >= 7);
      assert.ok(writing.value >= 7);
      assert.strictEqual(writingFriction.active, false);
    }
  },
  {
    name: "evaluation returns score and roadmap output for goal-specific profile data",
    async run() {
      process.env.RESULT_PROVIDER = "mock";
      const result = await evaluateProfile({
        goalKey: "prepare_new_role",
        goal: "Prepare for a new role",
        profile: {
          positiveFactors: [
            { key: "role_clarity", label: "Role Clarity", value: 8 },
            { key: "learning_plan", label: "Learning Plan", value: 8 },
            { key: "mentorship", label: "Mentorship", value: 7 },
            { key: "practice_time", label: "Practice Time", value: 6 },
            { key: "confidence", label: "Professional Confidence", value: 7 },
            { key: "communication", label: "Communication Strength", value: 7 },
            { key: "feedback_speed", label: "Fast Feedback", value: 6 },
            { key: "consistency", label: "Consistency", value: 7 }
          ],
          constraints: [
            { key: "unclear_target", label: "Unclear Target", value: 0, active: false },
            { key: "skill_gap_pressure", label: "Skill Gap Pressure", value: 4, active: true },
            { key: "isolation", label: "Isolation", value: 0, active: false },
            { key: "time_pressure", label: "Time Pressure", value: 3, active: true },
            { key: "self_doubt", label: "Self-Doubt", value: 0, active: false }
          ]
        }
      });

      assert.ok(result.score >= 0 && result.score <= 100);
      assert.strictEqual(typeof result.outcome.label, "string");
      assert.ok(/prepare for a new role/i.test(result.description.summary));
      assert.strictEqual(result.description.actionItems.length, 3);
      assert.strictEqual(result.description.roadmap.length, 3);
      assert.strictEqual(result.description.provider, "mock");
    }
  },
  {
    name: "suggested profile surfaces ollama failures instead of silently falling back",
    async run() {
      process.env.SUGGESTION_PROVIDER = "ollama";
      process.env.OLLAMA_ENDPOINT = "http://127.0.0.1:1/api/generate";
      process.env.OLLAMA_TIMEOUT_MS = "50";

      let capturedError = null;

      try {
        await buildSuggestedProfile({
          goal: {
            key: "finish_portfolio",
            label: "Finish my portfolio",
            description: "Organize and complete a portfolio that clearly shows your strongest work.",
            questions: [
              {
                key: "project_selection",
                prompt: "How clear are you on which projects belong in the portfolio?",
                initial: "somewhat",
                options: [
                  { value: "clear", label: "Very clear", effects: { resources: { curation_clarity: 3 }, obstacles: { selection_confusion: -2 } } },
                  { value: "somewhat", label: "Somewhat clear", effects: { resources: { curation_clarity: 1 }, obstacles: { selection_confusion: 2 } } },
                  { value: "unclear", label: "Still unclear", effects: { resources: { curation_clarity: -1 }, obstacles: { selection_confusion: 4 } } }
                ]
              }
            ],
            resources: [
              { key: "curation_clarity", label: "Project Curation", description: "Confidence in which pieces belong in the portfolio.", value: 4, note: "" }
            ],
            obstacles: [
              { key: "selection_confusion", label: "Selection Confusion", description: "Too many possible pieces make it hard to choose a final set.", value: 0, active: false, note: "" }
            ]
          },
          goalKey: "finish_portfolio",
          goalText: "Finish my portfolio",
          answers: {
            project_selection: "clear"
          }
        });
      } catch (error) {
        capturedError = error;
      } finally {
        process.env.SUGGESTION_PROVIDER = "mock";
        delete process.env.OLLAMA_ENDPOINT;
        delete process.env.OLLAMA_TIMEOUT_MS;
      }

      assert.ok(capturedError);
      assert.strictEqual(capturedError.code, "PROVIDER_FAILURE");
      assert.strictEqual(capturedError.statusCode, 502);
      assert.ok(/Ollama could not complete the resource suggestion step/i.test(capturedError.message));
    }
  }
];
