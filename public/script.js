const STEP_ORDER = ["goal", "questions", "resources", "obstacles", "result"];

const STEP_META = {
  goal: {
    title: "Describe The Goal You Want To Move Forward",
    description:
      "Start with a short, achievable goal. After you continue, the app will suggest a matching question set."
  },
  questions: {
    title: "Answer The Suggested Questions For Your Goal",
    description:
      "These questions are suggested after the app interprets your goal and chooses the closest planning path."
  },
  resources: {
    title: "Review Goal-Specific Resources",
    description:
      "Adjust the suggested resources and add optional notes you may want to send to an AI provider later."
  },
  obstacles: {
    title: "Review Goal-Specific Obstacles",
    description:
      "Confirm which obstacles apply right now and set their intensity. Each obstacle includes a short explanation."
  },
  result: {
    title: "See The Final Result",
    description:
      "The final view combines your goal, answers, resources, and obstacles into a deterministic result that can later be replaced by a stronger AI layer."
  }
};

const EMPTY_PROFILE = {
  positiveFactors: [],
  constraints: []
};

const state = {
  goalPrompt: null,
  goals: [],
  goalText: "",
  plannedGoalText: "",
  selectedGoal: null,
  selectedGoalKey: "",
  providerContext: null,
  starterAnswers: {},
  answerNotes: {},
  profile: {
    positiveFactors: [],
    constraints: []
  },
  currentStep: "goal",
  furthestStepIndex: 0,
  evaluation: null,
  isLoading: false
};

const goalStep = document.getElementById("goalStep");
const questionStep = document.getElementById("questionStep");
const resourceStep = document.getElementById("resourceStep");
const obstacleStep = document.getElementById("obstacleStep");
const resultStep = document.getElementById("resultStep");
const positiveSliders = document.getElementById("positiveSliders");
const constraintOptions = document.getElementById("constraintOptions");
const customObstacleList = document.getElementById("customObstacleList");
const addObstacleButton = document.getElementById("addObstacleButton");
const constraintSliders = document.getElementById("constraintSliders");
const scoreValue = document.getElementById("scoreValue");
const outcomeLabel = document.getElementById("outcomeLabel");
const summaryText = document.getElementById("summaryText");
const goalText = document.getElementById("goalText");
const encouragementText = document.getElementById("encouragementText");
const strengthText = document.getElementById("strengthText");
const dragText = document.getElementById("dragText");
const actionItems = document.getElementById("actionItems");
const roadmapItems = document.getElementById("roadmapItems");
const stateImage = document.getElementById("stateImage");
const stateEmoji = document.getElementById("stateEmoji");
const themeSelect = document.getElementById("themeSelect");
const breadcrumb = document.getElementById("breadcrumb");
const stepTitle = document.getElementById("stepTitle");
const stepDescription = document.getElementById("stepDescription");
const resultsPanel = document.getElementById("resultsPanel");
const appShell = document.querySelector(".app-shell");
const stepLoader = document.getElementById("stepLoader");
const stepLoaderText = document.getElementById("stepLoaderText");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const answerSummary = document.getElementById("answerSummary");
const resourceIntro = document.getElementById("resourceIntro");
const resultCardTitle = document.getElementById("resultCardTitle");
const errorModal = document.getElementById("errorModal");
const errorModalTitle = document.getElementById("errorModalTitle");
const errorModalMessage = document.getElementById("errorModalMessage");
const errorModalDetails = document.getElementById("errorModalDetails");
const errorRetryButton = document.getElementById("errorRetryButton");
const errorCloseButton = document.getElementById("errorCloseButton");

const themeOptions = new Set(["mild-light", "cream", "dark"]);
let retryAction = null;

async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    let payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    const requestError = new Error(
      payload && (payload.userMessage || payload.error)
        ? payload.userMessage || payload.error
        : `Request failed: ${response.status}`
    );
    requestError.statusCode = response.status;
    requestError.code = payload && payload.code ? payload.code : "REQUEST_FAILED";
    requestError.details = payload && payload.details ? payload.details : null;
    throw requestError;
  }

  return response.json();
}

function closeErrorModal() {
  errorModal.hidden = true;
}

function openErrorModal(title, message, details, onRetry) {
  retryAction = typeof onRetry === "function" ? onRetry : null;
  errorModalTitle.textContent = title;
  errorModalMessage.textContent = message;
  errorModalDetails.textContent = details || "";
  errorRetryButton.hidden = !retryAction;
  errorModal.hidden = false;
}

function describeStepFailure(step) {
  if (step === "goal") {
    return {
      title: "Could not load a question set",
      message: "The app could not generate the next set of questions for this goal.",
      details: "Check that Ollama is running and that the selected model is available, then retry."
    };
  }

  if (step === "questions") {
    return {
      title: "Could not suggest resources",
      message: "The app could not generate resources and obstacles from your answers.",
      details: "Your current answers are still here. Retry this step after the provider is available."
    };
  }

  if (step === "obstacles") {
    return {
      title: "Could not generate the final result",
      message: "The final result request failed before a response could be shown.",
      details: "Your goal, answers, resources, and obstacles are unchanged. Retry when the provider is ready."
    };
  }

  return {
    title: "Request failed",
    message: "The request did not complete.",
    details: "Stay on this page and retry."
  };
}

function getStepIndex(step) {
  return STEP_ORDER.indexOf(step);
}

function getCurrentStepIndex() {
  return getStepIndex(state.currentStep);
}

function getSelectedGoal() {
  return state.selectedGoal;
}

function cloneProfile(profile) {
  return {
    positiveFactors: (profile.positiveFactors || []).map((resource) => ({ ...resource })),
    constraints: (profile.constraints || []).map((constraint) => ({ ...constraint }))
  };
}

function createAnswersForGoal(goal) {
  return Object.fromEntries(goal.questions.map((question) => [question.key, question.initial]));
}

function createAnswerNotesForGoal(goal) {
  return Object.fromEntries(goal.questions.map((question) => [question.key, ""]));
}

function getActiveConstraints() {
  return state.profile.constraints.filter((constraint) => {
    if (constraint.custom) {
      return Boolean((constraint.label || "").trim()) && Number(constraint.value || 0) > 0;
    }

    return constraint.active;
  });
}

function createCustomObstacle(index) {
  return {
    key: `custom_obstacle_${Date.now()}_${index}`,
    label: "",
    description: "A blocker you want to keep visible in the plan.",
    value: 0,
    active: false,
    note: "",
    custom: true
  };
}

function clearDerivedState() {
  state.selectedGoal = null;
  state.selectedGoalKey = "";
  state.providerContext = null;
  state.starterAnswers = {};
  state.answerNotes = {};
  state.profile = cloneProfile(EMPTY_PROFILE);
  state.evaluation = null;
  state.furthestStepIndex = 0;
}

function resetResultPreview() {
  scoreValue.textContent = "50";
  outcomeLabel.textContent = "Steady Motion";
  goalText.textContent = "Goal: waiting for your final inputs.";
  summaryText.textContent =
    "Your final result will appear after you review the obstacles and continue.";
  encouragementText.textContent = "A useful roadmap starts with a clear goal.";
  strengthText.textContent = "Your strongest supports will appear after the resources step.";
  dragText.textContent = "Potential friction will be reviewed before the final result.";
  actionItems.textContent = "";
  roadmapItems.textContent = "";
  ["Name the goal you want to move forward."].forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    actionItems.appendChild(listItem);
  });
  ["Start with clarity.", "Build a manageable routine.", "Expand once it feels sustainable."].forEach(
    (item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      roadmapItems.appendChild(listItem);
    }
  );
  resultCardTitle.textContent = "Final Result";
}

async function fetchGoalExperience(goalValue) {
  return fetchJson("/api/progress/goal-plan", {
    method: "POST",
    body: JSON.stringify({
      goalText: goalValue
    })
  });
}

async function applyGoalPlan() {
  const experience = await fetchGoalExperience(state.goalText.trim());
  state.plannedGoalText = state.goalText.trim();
  state.selectedGoal = experience.goal;
  state.selectedGoalKey = experience.goal.key;
  state.providerContext = experience.providerContext || experience.goal.providerContext || null;
  state.profile = cloneProfile(experience.profile);
  state.starterAnswers = createAnswersForGoal(experience.goal);
  state.answerNotes = createAnswerNotesForGoal(experience.goal);
}

function renderGoalStep() {
  goalStep.textContent = "";

  const goalCard = document.createElement("div");
  goalCard.className = "question-card";

  const prompt = document.createElement("label");
  prompt.className = "question-prompt";
  prompt.setAttribute("for", "goalInput");
  prompt.textContent = state.goalPrompt && state.goalPrompt.label
    ? state.goalPrompt.label
    : "Write the goal you want help with";

  const input = document.createElement("textarea");
  input.id = "goalInput";
  input.className = "goal-input";
  input.rows = 4;
  input.placeholder = state.goalPrompt && state.goalPrompt.placeholder
    ? state.goalPrompt.placeholder
    : "Example: Build a steady exercise habit, finish my portfolio, improve my finances, or regain daily focus.";
  input.value = state.goalText;
  input.addEventListener("input", (event) => {
    state.goalText = event.target.value;

    if (state.plannedGoalText && state.goalText.trim() !== state.plannedGoalText) {
      clearDerivedState();
    }

    renderNavigation();
  });

  const helper = document.createElement("p");
  helper.className = "item-description";
  helper.textContent =
    "After you continue, the app will suggest a question set first, then suggest resources and obstacles in the next steps.";

  goalCard.append(prompt, input, helper);

  if (state.goals.length > 0) {
    const examples = document.createElement("p");
    examples.className = "item-description";
    examples.textContent = `Closest mock planning paths available right now: ${state.goals
      .map((goal) => goal.label)
      .join(", ")}.`;
    goalCard.appendChild(examples);
  }

  goalStep.appendChild(goalCard);
}

function renderQuestionnaire() {
  const selectedGoal = getSelectedGoal();
  questionStep.textContent = "";

  if (!selectedGoal) {
    questionStep.innerHTML =
      '<p class="empty-state">Add a goal first, then continue to load the suggested questions.</p>';
    return;
  }

  const introCard = document.createElement("div");
  introCard.className = "question-card";

  const introPrompt = document.createElement("p");
  introPrompt.className = "question-prompt";
  introPrompt.textContent = `Suggested planning path: ${selectedGoal.label}`;

  const introDescription = document.createElement("p");
  introDescription.className = "item-description";
  introDescription.textContent = selectedGoal.description;

  introCard.append(introPrompt, introDescription);

  if (selectedGoal.provider) {
    const providerLine = document.createElement("p");
    providerLine.className = "item-description";
    providerLine.textContent =
      selectedGoal.provider === "ollama"
        ? "Planning provider: Ollama"
        : "Planning provider: Mock";
    introCard.appendChild(providerLine);
  }

  questionStep.appendChild(introCard);

  selectedGoal.questions.forEach((question, index) => {
    const block = document.createElement("div");
    block.className = "question-card";

    const prompt = document.createElement("p");
    prompt.className = "question-prompt";
    prompt.textContent = `${index + 1}. ${question.prompt}`;

    const options = document.createElement("div");
    options.className = "question-options";

    question.options.forEach((option) => {
      const label = document.createElement("label");
      label.className = "choice-pill";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = question.key;
      input.value = option.value;
      input.checked = state.starterAnswers[question.key] === option.value;
      input.addEventListener("change", () => {
        state.starterAnswers[question.key] = option.value;
      });

      const text = document.createElement("span");
      text.textContent = option.label;

      label.append(input, text);
      options.appendChild(label);
    });

    const note = document.createElement("textarea");
    note.className = "resource-note";
    note.rows = 2;
    note.placeholder = "Optional detail: add your own context or preferred answer";
    note.value = state.answerNotes[question.key] || "";
    note.addEventListener("input", (event) => {
      state.answerNotes[question.key] = event.target.value;
    });

    block.append(prompt, options, note);
    questionStep.appendChild(block);
  });
}

function createSliderCard(item, options) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-item";

  const header = document.createElement("div");
  header.className = "slider-header";

  const label = document.createElement("label");
  label.setAttribute("for", item.key);
  label.textContent = item.label;

  const valueTag = document.createElement("span");
  valueTag.className = "slider-value";
  valueTag.textContent = item.value;

  const description = document.createElement("p");
  description.className = "item-description";
  description.textContent = item.description || "";

  const input = document.createElement("input");
  input.type = "range";
  input.id = item.key;
  input.min = "0";
  input.max = "10";
  input.step = "1";
  input.value = item.value;
  input.addEventListener("input", (event) => {
    item.value = Number(event.target.value);
    valueTag.textContent = item.value;
  });

  header.append(label, valueTag);
  wrapper.append(header, description, input);

  if (options && options.includeNote) {
    const note = document.createElement("textarea");
    note.className = "resource-note";
    note.rows = 2;
    note.placeholder = options.notePlaceholder || "Optional note";
    note.value = item.note || "";
    note.addEventListener("input", (event) => {
      item.note = event.target.value;
    });
    wrapper.appendChild(note);
  }

  return wrapper;
}

function renderResources() {
  const selectedGoal = getSelectedGoal();

  positiveSliders.textContent = "";

  if (!selectedGoal) {
    positiveSliders.innerHTML =
      '<p class="empty-state">The suggested resources will appear after you finish the question step.</p>';
    return;
  }

  resourceIntro.textContent =
    "These resources are suggested after the question step. Adjust each slider and use the text boxes to add your own desired details.";

  state.profile.positiveFactors.forEach((resource) => {
    positiveSliders.appendChild(
      createSliderCard(resource, {
        includeNote: true,
        notePlaceholder: "Optional detail: describe the support you want here"
      })
    );
  });
}

function renderObstacleOptions() {
  constraintOptions.textContent = "";

  state.profile.constraints.filter((constraint) => !constraint.custom).forEach((constraint) => {
    const label = document.createElement("label");
    label.className = "constraint-card";

    const header = document.createElement("div");
    header.className = "constraint-card-header";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = constraint.active;
    input.addEventListener("change", (event) => {
      constraint.active = event.target.checked;

      if (constraint.active && constraint.value === 0) {
        constraint.value = 4;
      }

      if (!constraint.active) {
        constraint.value = 0;
      }

      renderObstacleSliders();
    });

    const title = document.createElement("strong");
    title.textContent = constraint.label;

    header.append(input, title);

    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = constraint.description || "";

    const note = document.createElement("textarea");
    note.className = "resource-note";
    note.rows = 2;
    note.placeholder = "Optional detail: describe how this obstacle affects you";
    note.value = constraint.note || "";
    note.addEventListener("input", (event) => {
      constraint.note = event.target.value;
    });

    label.append(header, description, note);
    constraintOptions.appendChild(label);
  });
}

function renderCustomObstacleInputs() {
  customObstacleList.textContent = "";

  const customConstraints = state.profile.constraints.filter((constraint) => constraint.custom);

  if (customConstraints.length === 0) {
    customObstacleList.innerHTML =
      '<p class="empty-state">No personal obstacles added yet. Use "Add Obstacle" to list one.</p>';
    return;
  }

  customConstraints.forEach((constraint) => {
    const wrapper = document.createElement("div");
    wrapper.className = "slider-item";

    const header = document.createElement("div");
    header.className = "slider-header";

    const label = document.createElement("label");
    label.textContent = "Obstacle";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "action-button action-button-secondary";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      state.profile.constraints = state.profile.constraints.filter((entry) => entry.key !== constraint.key);
      renderCustomObstacleInputs();
      renderObstacleSliders();
    });

    header.append(label, removeButton);

    const input = document.createElement("input");
    input.type = "text";
    input.className = "question-textbox";
    input.placeholder = "Describe a blocker in your own words";
    input.value = constraint.label || "";
    input.addEventListener("input", (event) => {
      constraint.label = event.target.value;
      constraint.active = Boolean(constraint.label.trim()) && constraint.value > 0;
      renderObstacleSliders();
    });

    const note = document.createElement("textarea");
    note.className = "resource-note";
    note.rows = 2;
    note.placeholder = "Optional detail: how this obstacle shows up for you";
    note.value = constraint.note || "";
    note.addEventListener("input", (event) => {
      constraint.note = event.target.value;
    });

    const valueTag = document.createElement("span");
    valueTag.className = "slider-value";
    valueTag.textContent = constraint.value;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "10";
    slider.step = "1";
    slider.value = constraint.value;
    slider.addEventListener("input", (event) => {
      constraint.value = Number(event.target.value);
      constraint.active = Boolean((constraint.label || "").trim()) && constraint.value > 0;
      valueTag.textContent = String(constraint.value);
      renderObstacleSliders();
    });

    wrapper.append(header, input, note, valueTag, slider);
    customObstacleList.appendChild(wrapper);
  });
}

function renderObstacleSliders() {
  const activeConstraints = getActiveConstraints();
  constraintSliders.textContent = "";

  if (activeConstraints.length === 0) {
    constraintSliders.innerHTML =
      '<p class="empty-state">No obstacles are active right now. Activate the ones that truly matter for this goal.</p>';
    return;
  }

  activeConstraints.forEach((constraint) => {
    constraintSliders.appendChild(createSliderCard(constraint));
  });
}

function appendAccordionSection(titleText, lines) {
  const details = document.createElement("details");
  details.className = "summary-accordion";

  const summary = document.createElement("summary");
  summary.textContent = titleText;

  const body = document.createElement("div");
  body.className = "summary-accordion-body";

  lines.forEach((line) => {
    const item = document.createElement("p");
    item.textContent = line;
    body.appendChild(item);
  });

  details.append(summary, body);
  answerSummary.appendChild(details);
}

function renderAnswerSummary() {
  const selectedGoal = getSelectedGoal();
  answerSummary.textContent = "";

  if (!selectedGoal) {
    return;
  }

  appendAccordionSection("Requested Goal", [state.goalText.trim()]);
  appendAccordionSection("Suggested Planning Path", [selectedGoal.label, selectedGoal.description]);
  appendAccordionSection(
    "Answers",
    selectedGoal.questions.map((question) => {
      const option = question.options.find((entry) => entry.value === state.starterAnswers[question.key]);
      const note = state.answerNotes[question.key] && state.answerNotes[question.key].trim()
        ? ` | Detail: ${state.answerNotes[question.key].trim()}`
        : "";
      return `${question.prompt}: ${option ? option.label : ""}${note}`;
    })
  );
  appendAccordionSection(
    "Resources",
    state.profile.positiveFactors.map((resource) => {
      return resource.note && resource.note.trim()
        ? `${resource.label}: ${resource.value}/10 | Note: ${resource.note.trim()}`
        : `${resource.label}: ${resource.value}/10`;
    })
  );
  appendAccordionSection(
    "Obstacles",
    state.profile.constraints.map((constraint) => {
      return constraint.active
        ? `${constraint.label}: active at ${constraint.value}/10${constraint.note && constraint.note.trim() ? ` | Note: ${constraint.note.trim()}` : ""}`
        : `${constraint.label}: not active`;
    })
  );
}

function renderBreadcrumb() {
  breadcrumb.textContent = "";

  STEP_ORDER.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "breadcrumb-item";
    button.textContent = `${index + 1}. ${STEP_META[step].title}`;

    if (step === state.currentStep) {
      button.classList.add("is-active");
    }

    if (index <= state.furthestStepIndex && !state.isLoading) {
      button.classList.add("is-available");
      button.addEventListener("click", () => {
        goToStep(step);
      });
    } else if (index > state.furthestStepIndex || state.isLoading) {
      button.disabled = true;
    }

    breadcrumb.appendChild(button);
  });
}

function renderStepPaneVisibility() {
  goalStep.hidden = state.currentStep !== "goal";
  questionStep.hidden = state.currentStep !== "questions";
  resourceStep.hidden = state.currentStep !== "resources";
  obstacleStep.hidden = state.currentStep !== "obstacles";
  resultStep.hidden = state.currentStep !== "result";
}

function renderNavigation() {
  const currentIndex = getCurrentStepIndex();
  backButton.disabled = currentIndex === 0 || state.isLoading;
  nextButton.disabled = state.isLoading || (state.currentStep === "goal" && !state.goalText.trim());
  nextButton.textContent = state.isLoading
    ? "Please wait..."
    : currentIndex === STEP_ORDER.length - 1
      ? "Review Again"
      : "Continue";
}

function getLoadingMessage() {
  if (state.currentStep === "goal") {
    return "Finding the best question set for your goal...";
  }

  if (state.currentStep === "questions") {
    return "Suggesting your resources and obstacles...";
  }

  if (state.currentStep === "obstacles") {
    return "Generating your result...";
  }

  return "Working on your next step...";
}

function renderLoadingState() {
  stepLoader.hidden = !state.isLoading;

  if (state.isLoading) {
    stepLoaderText.textContent = getLoadingMessage();
  }
}

function renderResultsVisibility() {
  const showResults = state.currentStep === "result";

  resultsPanel.hidden = !showResults;
  appShell.classList.toggle("app-shell-final", showResults);
}

function renderStepMeta() {
  const meta = STEP_META[state.currentStep];
  stepTitle.textContent = meta.title;
  stepDescription.textContent = meta.description;
  resultCardTitle.textContent = state.currentStep === "result" ? resultCardTitle.textContent : "Final Result";
}

function renderCurrentStep() {
  renderStepMeta();
  renderStepPaneVisibility();
  renderResultsVisibility();
  renderLoadingState();
  renderBreadcrumb();
  renderNavigation();

  if (state.currentStep === "goal") {
    renderGoalStep();
  }

  if (state.currentStep === "questions") {
    renderQuestionnaire();
  }

  if (state.currentStep === "resources") {
    renderResources();
  }

  if (state.currentStep === "obstacles") {
    renderObstacleOptions();
    renderCustomObstacleInputs();
    renderObstacleSliders();
  }

  if (state.currentStep === "result") {
    renderAnswerSummary();
  }
}

function applyEvaluation(evaluation) {
  const selectedGoal = getSelectedGoal();

  state.evaluation = evaluation;
  scoreValue.textContent = evaluation.score;
  outcomeLabel.textContent = evaluation.outcome.label;
  goalText.textContent = `Goal: ${state.goalText.trim() || (selectedGoal ? selectedGoal.label : evaluation.description.goal)}`;
  summaryText.textContent = evaluation.description.summary;
  encouragementText.textContent = evaluation.description.encouragement;
  strengthText.textContent = evaluation.description.strengths;
  dragText.textContent = evaluation.description.friction;
  actionItems.textContent = "";
  roadmapItems.textContent = "";

  evaluation.description.actionItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    actionItems.appendChild(listItem);
  });

  evaluation.description.roadmap.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    roadmapItems.appendChild(listItem);
  });

  resultCardTitle.textContent = "Final Result";

  stateImage.src = evaluation.outcome.image;
  stateImage.alt = evaluation.outcome.alt;
  stateEmoji.textContent = evaluation.outcome.emoji;
}

async function updateResult() {
  const selectedGoal = getSelectedGoal();

  if (!selectedGoal) {
    return;
  }

  const evaluation = await fetchJson("/api/progress/evaluations", {
    method: "POST",
    body: JSON.stringify({
      goalKey: selectedGoal.key,
      goal: state.goalText.trim() || selectedGoal.label,
      profile: state.profile,
      providerContext: state.providerContext,
      questionResponses: selectedGoal.questions.map((question) => {
        const option = question.options.find((entry) => entry.value === state.starterAnswers[question.key]);
        return {
          key: question.key,
          prompt: question.prompt,
          answer: option ? option.label : state.starterAnswers[question.key] || "",
          note: state.answerNotes[question.key] || ""
        };
      })
    })
  });

  applyEvaluation(evaluation);
}

function mergeResourceNotes(nextProfile) {
  const existingNotes = Object.fromEntries(
    state.profile.positiveFactors.map((resource) => [resource.key, resource.note || ""])
  );

  nextProfile.positiveFactors.forEach((resource) => {
    resource.note = existingNotes[resource.key] || "";
  });

  return nextProfile;
}

function mergeConstraintNotes(nextProfile) {
  const existingNotes = Object.fromEntries(
    state.profile.constraints.map((constraint) => [constraint.key, constraint.note || ""])
  );
  const customConstraints = state.profile.constraints
    .filter((constraint) => constraint.custom)
    .map((constraint) => ({ ...constraint }));

  nextProfile.constraints.forEach((constraint) => {
    constraint.note = existingNotes[constraint.key] || "";
  });

  nextProfile.constraints.push(...customConstraints);
  return nextProfile;
}

async function applyStarterAnswers() {
  const selectedGoal = getSelectedGoal();

  if (!selectedGoal) {
    return;
  }

  const suggestion = await fetchJson("/api/progress/suggestions", {
    method: "POST",
    body: JSON.stringify({
      goal: selectedGoal,
      goalText: state.goalText.trim() || selectedGoal.label,
      goalKey: selectedGoal.key,
      providerContext: state.providerContext,
      answers: state.starterAnswers,
      answerNotes: state.answerNotes
    })
  });

  state.selectedGoal = suggestion.goal;
  state.selectedGoalKey = suggestion.goal.key;
  state.providerContext = suggestion.providerContext || state.providerContext;
  state.profile = mergeConstraintNotes(mergeResourceNotes(cloneProfile(suggestion.profile)));
}

function goToStep(step) {
  state.currentStep = step;
  renderCurrentStep();
}

async function moveStep(direction) {
  if (state.isLoading) {
    return;
  }

  const currentIndex = getCurrentStepIndex();
  const targetIndex = currentIndex + direction;

  if (targetIndex < 0) {
    return;
  }

  if (targetIndex >= STEP_ORDER.length) {
    goToStep("goal");
    return;
  }

  if (direction < 0) {
    goToStep(STEP_ORDER[targetIndex]);
    return;
  }

  try {
    state.isLoading = true;
    renderCurrentStep();

    if (state.currentStep === "goal") {
      await applyGoalPlan();
    }

    if (state.currentStep === "questions") {
      await applyStarterAnswers();
    }

    if (state.currentStep === "obstacles") {
      await updateResult();
    }

    state.currentStep = STEP_ORDER[targetIndex];
    state.furthestStepIndex = Math.max(state.furthestStepIndex, targetIndex);
  } catch (error) {
    const failure = describeStepFailure(state.currentStep);
    openErrorModal(
      failure.title,
      error && error.message ? error.message : failure.message,
      error && error.details ? error.details : failure.details,
      () => {
        closeErrorModal();
        moveStep(direction);
      }
    );
  } finally {
    state.isLoading = false;
    renderCurrentStep();
  }
}

function applyTheme(theme) {
  const resolvedTheme = themeOptions.has(theme) ? theme : "dark";
  document.documentElement.dataset.theme = resolvedTheme;
  themeSelect.value = resolvedTheme;
}

async function initializePage() {
  const config = await fetchJson("/api/progress/config");

  state.goalPrompt = config.goalPrompt || null;
  state.goals = config.goals || [];
  state.goalText = "";
  state.plannedGoalText = "";
  state.selectedGoal = null;
  state.selectedGoalKey = "";
  state.providerContext = null;
  state.starterAnswers = {};
  state.answerNotes = {};
  state.profile = cloneProfile(EMPTY_PROFILE);
  state.currentStep = "goal";
  state.furthestStepIndex = 0;
  state.evaluation = null;

  applyTheme(themeSelect.value);
  resetResultPreview();
  renderCurrentStep();
}

themeSelect.addEventListener("change", (event) => {
  applyTheme(event.target.value);
});

addObstacleButton.addEventListener("click", () => {
  const customIndex = state.profile.constraints.filter((constraint) => constraint.custom).length;
  state.profile.constraints.push(createCustomObstacle(customIndex));
  renderCustomObstacleInputs();
  renderObstacleSliders();
});

backButton.addEventListener("click", () => {
  moveStep(-1);
});

nextButton.addEventListener("click", () => {
  moveStep(1);
});

errorRetryButton.addEventListener("click", () => {
  if (retryAction) {
    retryAction();
    return;
  }

  closeErrorModal();
});

errorCloseButton.addEventListener("click", () => {
  closeErrorModal();
});

initializePage().catch((error) => {
  openErrorModal(
    "Could not load the app",
    error && error.message ? error.message : "The page could not load its initial configuration.",
    error && error.details ? error.details : "Check the server or provider configuration, then retry.",
    () => {
      closeErrorModal();
      initializePage().catch((nextError) => {
        openErrorModal(
          "Could not load the app",
          nextError && nextError.message ? nextError.message : "The page could not load its initial configuration.",
          nextError && nextError.details ? nextError.details : "Check the server or provider configuration, then retry.",
          retryAction
        );
      });
    }
  );
});
