const assert = require("assert");

const {
  STEP_ORDER,
  createFlowState,
  goToStep,
  moveStep,
  unlockStep
} = require("../src/application/progress/flowService");

module.exports = [
  {
    name: "flow starts on goal and only unlocks the first step",
    run() {
      const flow = createFlowState();

      assert.strictEqual(flow.currentStep, "goal");
      assert.strictEqual(flow.furthestStepIndex, 0);
      assert.strictEqual(STEP_ORDER.length, 5);
    }
  },
  {
    name: "unlocking and moving forward exposes later steps one at a time",
    run() {
      let flow = createFlowState();

      flow = unlockStep(flow, "questions");
      flow = moveStep(flow, 1);
      assert.strictEqual(flow.currentStep, "questions");
      assert.strictEqual(flow.furthestStepIndex, 1);

      flow = moveStep(flow, 1);
      assert.strictEqual(flow.currentStep, "resources");
      assert.strictEqual(flow.furthestStepIndex, 2);
    }
  },
  {
    name: "cannot jump to a locked step but can revisit unlocked breadcrumb steps",
    run() {
      let flow = createFlowState();

      flow = goToStep(flow, "result");
      assert.strictEqual(flow.currentStep, "goal");

      flow = unlockStep(flow, "result");
      flow = goToStep(flow, "obstacles");
      assert.strictEqual(flow.currentStep, "obstacles");

      flow = goToStep(flow, "goal");
      assert.strictEqual(flow.currentStep, "goal");
    }
  }
];
