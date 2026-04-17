const STEP_ORDER = ["goal", "questions", "resources", "obstacles", "result"];

function getStepIndex(step) {
  return STEP_ORDER.indexOf(step);
}

function createFlowState() {
  return {
    currentStep: "goal",
    furthestStepIndex: 0
  };
}

function unlockStep(state, step) {
  const index = getStepIndex(step);

  if (index < 0) {
    return { currentStep: state.currentStep, furthestStepIndex: state.furthestStepIndex };
  }

  return {
    currentStep: state.currentStep,
    furthestStepIndex: Math.max(state.furthestStepIndex, index)
  };
}

function canVisitStep(state, step) {
  const index = getStepIndex(step);
  return index >= 0 && index <= state.furthestStepIndex;
}

function goToStep(state, step) {
  if (!canVisitStep(state, step)) {
    return { currentStep: state.currentStep, furthestStepIndex: state.furthestStepIndex };
  }

  return {
    currentStep: step,
    furthestStepIndex: state.furthestStepIndex
  };
}

function moveStep(state, direction) {
  const currentIndex = getStepIndex(state.currentStep);

  if (currentIndex < 0) {
    return createFlowState();
  }

  if (currentIndex === STEP_ORDER.length - 1 && direction > 0) {
    return {
      currentStep: "goal",
      furthestStepIndex: state.furthestStepIndex
    };
  }

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= STEP_ORDER.length) {
    return { currentStep: state.currentStep, furthestStepIndex: state.furthestStepIndex };
  }

  return {
    currentStep: STEP_ORDER[nextIndex],
    furthestStepIndex: Math.max(state.furthestStepIndex, nextIndex)
  };
}

module.exports = {
  STEP_ORDER,
  canVisitStep,
  createFlowState,
  getStepIndex,
  goToStep,
  moveStep,
  unlockStep
};
