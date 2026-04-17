function pickOutcome(score, outcomeStates) {
  return [...outcomeStates].reverse().find((state) => score >= state.min);
}

function formatGoal(goal) {
  return goal && goal.trim() ? goal.trim() : "your current goal";
}

function buildActionItems(goalText, topStrengths, activeConstraints) {
  const items = [];
  const primaryStrength = topStrengths[0];
  const secondaryStrength = topStrengths[1];
  const primaryConstraint = activeConstraints[0];

  items.push(
    `Define one visible win for ${goalText} that you could complete within the next 7 days.`
  );
  items.push(
    primaryStrength
      ? `Use ${primaryStrength.label.toLowerCase()} as the anchor for your next move by scheduling one repeatable session for it.`
      : `Choose one reliable support you can use immediately and make it part of your next move.`
  );

  if (primaryConstraint) {
    items.push(
      `Lower ${primaryConstraint.label.toLowerCase()} by one step with a small protective rule before you try to increase effort.`
    );
  } else {
    items.push("Protect your current momentum by keeping your schedule simple and realistic.");
  }

  if (secondaryStrength) {
    items.push(
      `Pair ${secondaryStrength.label.toLowerCase()} with the first action so your plan feels easier to sustain.`
    );
  }

  return items.slice(0, 3);
}

function buildRoadmap(goalText, score, topStrengths, activeConstraints) {
  const primaryConstraint = activeConstraints[0];
  const foundation = primaryConstraint
    ? `Stabilize ${primaryConstraint.label.toLowerCase()} so it stops disrupting progress toward ${goalText}.`
    : `Protect the conditions already helping you move toward ${goalText}.`;
  const buildPhase = topStrengths[0]
    ? `Build consistency by leaning on ${topStrengths[0].label.toLowerCase()} as your most dependable advantage.`
    : `Build consistency by choosing one simple routine that supports the goal every week.`;
  const stretchPhase =
    score >= 65
      ? `Expand carefully once the current rhythm feels repeatable, and raise the difficulty only one notch at a time.`
      : `Once the basics feel stable, add a slightly more ambitious milestone without changing everything at once.`;

  return [`Start: ${foundation}`, `Build: ${buildPhase}`, `Finish: ${stretchPhase}`];
}

function describeState(profile, score, goal) {
  const topStrengths = [...profile.positiveFactors].sort((a, b) => b.value - a.value).slice(0, 2);
  const activeConstraints = [...profile.constraints]
    .filter((constraint) => constraint.active)
    .sort((a, b) => b.value - a.value);
  const biggestConstraint = activeConstraints[0];
  const goalText = formatGoal(goal);

  let summary = `You can make progress on ${goalText}, and the best path is to stay practical instead of trying to fix everything at once.`;
  let encouragement = `You already have enough to begin moving ${goalText} forward. The goal now is steady movement, not perfection.`;

  if (score < 25) {
    summary = `The path to ${goalText} is still realistic, but you will get farther by stabilizing the environment first and then taking a smaller first win.`;
    encouragement = `This is not a sign to stop. It is a sign to make the first version of the plan lighter and more forgiving.`;
  } else if (score < 45) {
    summary = `You have a workable base for ${goalText}. The next gains will come from reducing one recurring source of friction and making your next action unmissable.`;
    encouragement = `Momentum is close. A narrower plan will feel more convincing than a bigger one right now.`;
  } else if (score < 65) {
    summary = `The setup for ${goalText} is balanced enough to support real progress. The main job now is consistency and one clear next milestone.`;
    encouragement = `You do not need a dramatic reset. You need a plan that is simple enough to keep repeating.`;
  } else if (score < 82) {
    summary = `You are in a strong position to move ${goalText} forward. The highest return now comes from protecting your rhythm and tightening one weak spot.`;
    encouragement = `This is already convincing. Your next improvement should make the plan more durable, not more intense.`;
  } else {
    summary = `The conditions around ${goalText} are strong. The opportunity now is to convert that strength into a clear roadmap from start to finish.`;
    encouragement = `You have real momentum. Preserve it by staying deliberate and avoiding unnecessary complexity.`;
  }

  return {
    summary,
    encouragement,
    strengths: `${topStrengths
      .map((factor) => factor.label)
      .join(" and ")} are the strongest resources you can build this plan around.`,
    friction:
      activeConstraints.length > 0
        ? `${activeConstraints
            .slice(0, 2)
            .map((constraint) => constraint.label)
            .join(" and ")} need attention so they do not slow the goal down.`
        : "Very little friction is active right now, so your roadmap can stay simple and forward-looking.",
    actionItems: buildActionItems(goalText, topStrengths, activeConstraints),
    roadmap: buildRoadmap(goalText, score, topStrengths, activeConstraints),
    goal: goalText,
    biggestConstraint: biggestConstraint ? biggestConstraint.label : null
  };
}

module.exports = {
  describeState,
  pickOutcome
};
