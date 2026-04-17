const assert = require("assert");

const {
  getGoalKeyInput,
  getGoalTextInput,
  getSuggestionInput,
  getEvaluationInput
} = require("../src/infrastructure/http/getProgressRequestInput");

module.exports = [
  {
    name: "request input helper normalizes params and bodies for progress routes",
    async run() {
      assert.strictEqual(getGoalKeyInput({ goalKey: "improve_finances" }), "improve_finances");
      assert.strictEqual(getGoalKeyInput({ goalKey: 123 }), undefined);
      assert.strictEqual(
        getGoalTextInput({ goalText: "Finish my portfolio" }),
        "Finish my portfolio"
      );
      assert.strictEqual(getGoalTextInput({ goalText: 123 }), "");
      assert.deepStrictEqual(getSuggestionInput({ goalKey: "career_growth" }), {
        goalKey: "career_growth"
      });
      assert.deepStrictEqual(getSuggestionInput([]), {});
      assert.deepStrictEqual(getEvaluationInput(null), {
        positiveFactors: [],
        constraints: []
      });
    }
  }
];
