const outcomeStates = [
  {
    min: 0,
    label: "Early Setup",
    emoji: "🧭",
    image: "images/very-low-progress.svg",
    alt: "Early setup illustration"
  },
  {
    min: 25,
    label: "Building Direction",
    emoji: "🌱",
    image: "images/slow-but-possible.svg",
    alt: "Building direction illustration"
  },
  {
    min: 45,
    label: "Steady Motion",
    emoji: "⚖️",
    image: "images/balanced-progress.svg",
    alt: "Steady motion illustration"
  },
  {
    min: 65,
    label: "Strong Traction",
    emoji: "🚀",
    image: "images/strong-progress.svg",
    alt: "Strong traction illustration"
  },
  {
    min: 82,
    label: "Ready To Scale",
    emoji: "🌟",
    image: "images/excellent-momentum.svg",
    alt: "Ready to scale illustration"
  }
];

const goalPrompt = {
  label: "What goal are you working toward?",
  placeholder: "Example: Build a steady exercise habit, finish my portfolio, prepare for a new role, improve my finances, or regain daily focus."
};

const goalCatalog = [
  {
    key: "build_exercise_habit",
    label: "Build a steady exercise habit",
    description: "Create a repeatable weekly fitness routine that feels achievable and sustainable.",
    questions: [
      {
        key: "schedule_stability",
        prompt: "How predictable is your weekly schedule?",
        initial: "mixed",
        options: [
          {
            value: "stable",
            label: "Mostly stable",
            effects: {
              resources: { routine_anchor: 2, consistency: 2, tracking: 1 },
              obstacles: { time_fragmentation: -1 }
            }
          },
          {
            value: "mixed",
            label: "Somewhat mixed",
            effects: {
              resources: { routine_anchor: 1, consistency: 1 },
              obstacles: { time_fragmentation: 2 }
            }
          },
          {
            value: "chaotic",
            label: "Often chaotic",
            effects: {
              resources: { routine_anchor: -1 },
              obstacles: { time_fragmentation: 4, inconsistency: 2 }
            }
          }
        ]
      },
      {
        key: "fitness_confidence",
        prompt: "How confident are you about what to do when you exercise?",
        initial: "somewhat",
        options: [
          {
            value: "high",
            label: "I know what to do",
            effects: {
              resources: { exercise_clarity: 3, confidence: 2 },
              obstacles: { uncertainty: -2 }
            }
          },
          {
            value: "somewhat",
            label: "I know a little",
            effects: {
              resources: { exercise_clarity: 1, confidence: 1 },
              obstacles: { uncertainty: 2 }
            }
          },
          {
            value: "low",
            label: "I feel unsure",
            effects: {
              resources: { confidence: -1 },
              obstacles: { uncertainty: 4 }
            }
          }
        ]
      },
      {
        key: "energy_pattern",
        prompt: "How is your energy on most days?",
        initial: "medium",
        options: [
          {
            value: "high",
            label: "Good energy",
            effects: {
              resources: { energy_capacity: 3, recovery: 1 },
              obstacles: { low_energy: -2 }
            }
          },
          {
            value: "medium",
            label: "Up and down",
            effects: {
              resources: { energy_capacity: 1 },
              obstacles: { low_energy: 2 }
            }
          },
          {
            value: "low",
            label: "Often low",
            effects: {
              resources: { recovery: -1 },
              obstacles: { low_energy: 4 }
            }
          }
        ]
      },
      {
        key: "support_level",
        prompt: "How supported would you feel starting this habit?",
        initial: "some",
        options: [
          {
            value: "strong",
            label: "Strong support",
            effects: {
              resources: { accountability: 3, environment: 2 },
              obstacles: { low_motivation: -1 }
            }
          },
          {
            value: "some",
            label: "Some support",
            effects: {
              resources: { accountability: 1, environment: 1 },
              obstacles: { low_motivation: 1 }
            }
          },
          {
            value: "solo",
            label: "Mostly on my own",
            effects: {
              resources: { accountability: -1 },
              obstacles: { low_motivation: 3 }
            }
          }
        ]
      },
      {
        key: "entry_size",
        prompt: "What kind of starting point feels realistic?",
        initial: "moderate",
        options: [
          {
            value: "small",
            label: "Very small and easy",
            effects: {
              resources: { consistency: 2, recovery: 2 },
              obstacles: { inconsistency: -1 }
            }
          },
          {
            value: "moderate",
            label: "Moderate challenge",
            effects: {
              resources: { confidence: 1, tracking: 1 },
              obstacles: { inconsistency: 1 }
            }
          },
          {
            value: "hard",
            label: "I want a hard push",
            effects: {
              resources: { confidence: 1 },
              obstacles: { inconsistency: 3, low_energy: 1 }
            }
          }
        ]
      }
    ],
    resources: [
      { key: "routine_anchor", label: "Routine Anchor", description: "A reliable time slot or trigger that helps the habit happen.", value: 4, note: "" },
      { key: "exercise_clarity", label: "Exercise Clarity", description: "Knowing what kind of workout to do when the session starts.", value: 4, note: "" },
      { key: "energy_capacity", label: "Energy Capacity", description: "Having enough physical and mental energy to begin.", value: 4, note: "" },
      { key: "accountability", label: "Accountability", description: "A person, coach, class, or commitment that keeps you showing up.", value: 4, note: "" },
      { key: "recovery", label: "Recovery", description: "Your ability to rest enough so the habit stays sustainable.", value: 4, note: "" },
      { key: "confidence", label: "Confidence", description: "Belief that you can do the next session without overthinking it.", value: 4, note: "" },
      { key: "environment", label: "Helpful Environment", description: "Access to a space, gear, or setup that reduces friction.", value: 4, note: "" },
      { key: "tracking", label: "Simple Tracking", description: "A lightweight way to see streaks, sessions, or small wins.", value: 4, note: "" }
    ],
    obstacles: [
      { key: "time_fragmentation", label: "Time Fragmentation", description: "Your available time is split up or frequently interrupted.", value: 0, active: false },
      { key: "uncertainty", label: "Exercise Uncertainty", description: "Not knowing what to do makes starting harder.", value: 0, active: false },
      { key: "low_energy", label: "Low Energy", description: "Fatigue makes follow-through less consistent.", value: 0, active: false },
      { key: "low_motivation", label: "Low Motivation", description: "The habit does not yet feel emotionally rewarding or urgent.", value: 0, active: false },
      { key: "inconsistency", label: "Inconsistency Risk", description: "The plan may be too ambitious to repeat every week.", value: 0, active: false }
    ]
  },
  {
    key: "finish_portfolio",
    label: "Finish my portfolio",
    description: "Organize and complete a portfolio that clearly shows your strongest work.",
    questions: [
      {
        key: "project_selection",
        prompt: "How clear are you on which projects belong in the portfolio?",
        initial: "somewhat",
        options: [
          {
            value: "clear",
            label: "Very clear",
            effects: {
              resources: { curation_clarity: 3, confidence: 1 },
              obstacles: { selection_confusion: -2 }
            }
          },
          {
            value: "somewhat",
            label: "Somewhat clear",
            effects: {
              resources: { curation_clarity: 1 },
              obstacles: { selection_confusion: 2 }
            }
          },
          {
            value: "unclear",
            label: "Still unclear",
            effects: {
              resources: { curation_clarity: -1 },
              obstacles: { selection_confusion: 4 }
            }
          }
        ]
      },
      {
        key: "writing_ready",
        prompt: "How ready are you to write case studies or descriptions?",
        initial: "medium",
        options: [
          {
            value: "ready",
            label: "Ready to write",
            effects: {
              resources: { storytelling: 3, momentum: 1 },
              obstacles: { writing_friction: -2 }
            }
          },
          {
            value: "medium",
            label: "I can draft with effort",
            effects: {
              resources: { storytelling: 1 },
              obstacles: { writing_friction: 2 }
            }
          },
          {
            value: "stuck",
            label: "I feel stuck",
            effects: {
              resources: { storytelling: -1 },
              obstacles: { writing_friction: 4 }
            }
          }
        ]
      },
      {
        key: "available_time",
        prompt: "How much focused time can you protect each week?",
        initial: "some",
        options: [
          {
            value: "enough",
            label: "Enough time",
            effects: {
              resources: { time_blocks: 3, momentum: 2 },
              obstacles: { time_pressure: -2 }
            }
          },
          {
            value: "some",
            label: "Some time",
            effects: {
              resources: { time_blocks: 1 },
              obstacles: { time_pressure: 2 }
            }
          },
          {
            value: "very_little",
            label: "Very little time",
            effects: {
              resources: { time_blocks: -1 },
              obstacles: { time_pressure: 4 }
            }
          }
        ]
      },
      {
        key: "feedback_access",
        prompt: "Can you get feedback from someone whose taste you trust?",
        initial: "limited",
        options: [
          {
            value: "yes",
            label: "Yes, easily",
            effects: {
              resources: { feedback_loop: 3, confidence: 1 },
              obstacles: { isolation: -1 }
            }
          },
          {
            value: "limited",
            label: "Somewhat",
            effects: {
              resources: { feedback_loop: 1 },
              obstacles: { isolation: 1 }
            }
          },
          {
            value: "no",
            label: "Not really",
            effects: {
              resources: { feedback_loop: -1 },
              obstacles: { isolation: 3 }
            }
          }
        ]
      },
      {
        key: "publish_comfort",
        prompt: "How comfortable are you putting your work online?",
        initial: "nervous",
        options: [
          {
            value: "comfortable",
            label: "Comfortable",
            effects: {
              resources: { publishing_readiness: 3, confidence: 2 },
              obstacles: { perfectionism: -2 }
            }
          },
          {
            value: "nervous",
            label: "A bit nervous",
            effects: {
              resources: { publishing_readiness: 1 },
              obstacles: { perfectionism: 2 }
            }
          },
          {
            value: "avoidant",
            label: "I keep delaying it",
            effects: {
              resources: { publishing_readiness: -1 },
              obstacles: { perfectionism: 4 }
            }
          }
        ]
      }
    ],
    resources: [
      { key: "curation_clarity", label: "Project Curation", description: "Confidence in which pieces belong in the portfolio.", value: 4, note: "" },
      { key: "storytelling", label: "Case Study Writing", description: "Ability to explain context, process, and outcomes clearly.", value: 4, note: "" },
      { key: "time_blocks", label: "Focused Time Blocks", description: "Protected time for editing, writing, and polishing.", value: 4, note: "" },
      { key: "feedback_loop", label: "Feedback Loop", description: "Trusted input that helps you improve faster.", value: 4, note: "" },
      { key: "publishing_readiness", label: "Publishing Readiness", description: "Willingness to put the work online without over-polishing.", value: 4, note: "" },
      { key: "confidence", label: "Creative Confidence", description: "Belief that your work is worth presenting.", value: 4, note: "" },
      { key: "momentum", label: "Momentum", description: "Current energy for moving the portfolio toward completion.", value: 4, note: "" },
      { key: "presentation_quality", label: "Presentation Quality", description: "Visual polish and organization that supports the story.", value: 4, note: "" }
    ],
    obstacles: [
      { key: "selection_confusion", label: "Selection Confusion", description: "Too many possible pieces make it hard to choose a final set.", value: 0, active: false },
      { key: "writing_friction", label: "Writing Friction", description: "Explaining the work feels harder than doing the work.", value: 0, active: false },
      { key: "time_pressure", label: "Time Pressure", description: "Portfolio work keeps losing against more urgent tasks.", value: 0, active: false },
      { key: "isolation", label: "Limited Feedback", description: "Lack of outside perspective slows decisions.", value: 0, active: false },
      { key: "perfectionism", label: "Perfectionism", description: "Fear of publishing keeps the project unfinished.", value: 0, active: false }
    ]
  },
  {
    key: "prepare_new_role",
    label: "Prepare for a new role",
    description: "Build readiness and confidence for stepping into a stronger role or responsibility.",
    questions: [
      {
        key: "target_clarity",
        prompt: "How clear is the role you are preparing for?",
        initial: "somewhat",
        options: [
          {
            value: "clear",
            label: "Very clear",
            effects: {
              resources: { role_clarity: 3, roadmap_focus: 2 },
              obstacles: { unclear_target: -2 }
            }
          },
          {
            value: "somewhat",
            label: "Somewhat clear",
            effects: {
              resources: { role_clarity: 1 },
              obstacles: { unclear_target: 2 }
            }
          },
          {
            value: "foggy",
            label: "Still foggy",
            effects: {
              resources: { role_clarity: -1 },
              obstacles: { unclear_target: 4 }
            }
          }
        ]
      },
      {
        key: "skill_gap",
        prompt: "How manageable do the skill gaps feel?",
        initial: "medium",
        options: [
          {
            value: "manageable",
            label: "Manageable",
            effects: {
              resources: { learning_plan: 2, confidence: 2 },
              obstacles: { skill_gap_pressure: -1 }
            }
          },
          {
            value: "medium",
            label: "Noticeable but manageable",
            effects: {
              resources: { learning_plan: 1 },
              obstacles: { skill_gap_pressure: 2 }
            }
          },
          {
            value: "large",
            label: "They feel large",
            effects: {
              resources: { confidence: -1 },
              obstacles: { skill_gap_pressure: 4 }
            }
          }
        ]
      },
      {
        key: "mentor_access",
        prompt: "Do you have access to guidance from experienced people?",
        initial: "limited",
        options: [
          {
            value: "yes",
            label: "Yes",
            effects: {
              resources: { mentorship: 3, feedback_speed: 2 },
              obstacles: { isolation: -2 }
            }
          },
          {
            value: "limited",
            label: "A little",
            effects: {
              resources: { mentorship: 1 },
              obstacles: { isolation: 1 }
            }
          },
          {
            value: "no",
            label: "Not really",
            effects: {
              resources: { mentorship: -1 },
              obstacles: { isolation: 3 }
            }
          }
        ]
      },
      {
        key: "time_for_growth",
        prompt: "How much time can you dedicate to preparing each week?",
        initial: "some",
        options: [
          {
            value: "strong",
            label: "A strong amount",
            effects: {
              resources: { practice_time: 3, consistency: 2 },
              obstacles: { time_pressure: -2 }
            }
          },
          {
            value: "some",
            label: "Some time",
            effects: {
              resources: { practice_time: 1 },
              obstacles: { time_pressure: 2 }
            }
          },
          {
            value: "low",
            label: "Very limited",
            effects: {
              resources: { practice_time: -1 },
              obstacles: { time_pressure: 4 }
            }
          }
        ]
      },
      {
        key: "confidence_level",
        prompt: "How ready do you feel emotionally for the step up?",
        initial: "growing",
        options: [
          {
            value: "ready",
            label: "Ready",
            effects: {
              resources: { confidence: 3, communication: 1 },
              obstacles: { self_doubt: -2 }
            }
          },
          {
            value: "growing",
            label: "Growing into it",
            effects: {
              resources: { confidence: 1 },
              obstacles: { self_doubt: 2 }
            }
          },
          {
            value: "shaky",
            label: "Still shaky",
            effects: {
              resources: { confidence: -1 },
              obstacles: { self_doubt: 4 }
            }
          }
        ]
      }
    ],
    resources: [
      { key: "role_clarity", label: "Role Clarity", description: "A clear understanding of what the new role really demands.", value: 4, note: "" },
      { key: "learning_plan", label: "Learning Plan", description: "A focused path for closing important skill gaps.", value: 4, note: "" },
      { key: "mentorship", label: "Mentorship", description: "Access to advice from people already operating at that level.", value: 4, note: "" },
      { key: "practice_time", label: "Practice Time", description: "Protected time for preparation, rehearsal, or study.", value: 4, note: "" },
      { key: "confidence", label: "Professional Confidence", description: "Belief that you can step into the role and grow from there.", value: 4, note: "" },
      { key: "communication", label: "Communication Strength", description: "Ability to speak clearly about your thinking and decisions.", value: 4, note: "" },
      { key: "feedback_speed", label: "Fast Feedback", description: "How quickly you can learn from corrections and examples.", value: 4, note: "" },
      { key: "consistency", label: "Consistency", description: "Your ability to prepare steadily rather than in bursts.", value: 4, note: "" }
    ],
    obstacles: [
      { key: "unclear_target", label: "Unclear Target", description: "You may still be preparing for a vague or moving target.", value: 0, active: false },
      { key: "skill_gap_pressure", label: "Skill Gap Pressure", description: "The distance between current skills and target expectations feels heavy.", value: 0, active: false },
      { key: "isolation", label: "Isolation", description: "Lack of guidance makes it harder to judge real readiness.", value: 0, active: false },
      { key: "time_pressure", label: "Time Pressure", description: "Preparation competes with work, family, or other responsibilities.", value: 0, active: false },
      { key: "self_doubt", label: "Self-Doubt", description: "You may be discounting your current ability to grow into the role.", value: 0, active: false }
    ]
  },
  {
    key: "improve_finances",
    label: "Improve my finances",
    description: "Strengthen financial stability through clearer priorities and realistic habits.",
    questions: [
      {
        key: "money_visibility",
        prompt: "How clearly do you understand your current money flow?",
        initial: "partial",
        options: [
          {
            value: "clear",
            label: "Very clearly",
            effects: {
              resources: { money_visibility: 3, planning: 1 },
              obstacles: { unclear_spending: -2 }
            }
          },
          {
            value: "partial",
            label: "Partially",
            effects: {
              resources: { money_visibility: 1 },
              obstacles: { unclear_spending: 2 }
            }
          },
          {
            value: "unclear",
            label: "Not clearly",
            effects: {
              resources: { money_visibility: -1 },
              obstacles: { unclear_spending: 4 }
            }
          }
        ]
      },
      {
        key: "expense_control",
        prompt: "How much control do you feel over optional spending?",
        initial: "mixed",
        options: [
          {
            value: "good",
            label: "Good control",
            effects: {
              resources: { spending_control: 3, consistency: 1 },
              obstacles: { impulse_spending: -2 }
            }
          },
          {
            value: "mixed",
            label: "Mixed control",
            effects: {
              resources: { spending_control: 1 },
              obstacles: { impulse_spending: 2 }
            }
          },
          {
            value: "low",
            label: "Low control",
            effects: {
              resources: { spending_control: -1 },
              obstacles: { impulse_spending: 4 }
            }
          }
        ]
      },
      {
        key: "income_stability",
        prompt: "How stable is your income right now?",
        initial: "mostly",
        options: [
          {
            value: "stable",
            label: "Stable",
            effects: {
              resources: { stability: 3, savings_buffer: 1 },
              obstacles: { income_variability: -2 }
            }
          },
          {
            value: "mostly",
            label: "Mostly stable",
            effects: {
              resources: { stability: 1 },
              obstacles: { income_variability: 2 }
            }
          },
          {
            value: "unstable",
            label: "Unstable",
            effects: {
              resources: { stability: -1 },
              obstacles: { income_variability: 4 }
            }
          }
        ]
      },
      {
        key: "support_system",
        prompt: "Do you have useful systems or people helping you stay on track?",
        initial: "some",
        options: [
          {
            value: "yes",
            label: "Yes",
            effects: {
              resources: { accountability: 3, planning: 1 },
              obstacles: { decision_fatigue: -1 }
            }
          },
          {
            value: "some",
            label: "A little",
            effects: {
              resources: { accountability: 1 },
              obstacles: { decision_fatigue: 1 }
            }
          },
          {
            value: "no",
            label: "Not really",
            effects: {
              resources: { accountability: -1 },
              obstacles: { decision_fatigue: 3 }
            }
          }
        ]
      },
      {
        key: "goal_pressure",
        prompt: "How pressured do your financial goals feel right now?",
        initial: "moderate",
        options: [
          {
            value: "low",
            label: "Manageable pressure",
            effects: {
              resources: { emotional_capacity: 2, consistency: 1 },
              obstacles: { overwhelm: -2 }
            }
          },
          {
            value: "moderate",
            label: "Moderate pressure",
            effects: {
              resources: { emotional_capacity: 1 },
              obstacles: { overwhelm: 2 }
            }
          },
          {
            value: "high",
            label: "Very pressured",
            effects: {
              resources: { emotional_capacity: -1 },
              obstacles: { overwhelm: 4 }
            }
          }
        ]
      }
    ],
    resources: [
      { key: "money_visibility", label: "Money Visibility", description: "A clear view of income, bills, and spending patterns.", value: 4, note: "" },
      { key: "spending_control", label: "Spending Control", description: "Ability to direct optional spending toward priorities.", value: 4, note: "" },
      { key: "stability", label: "Income Stability", description: "Reliability of current income or financial baseline.", value: 4, note: "" },
      { key: "accountability", label: "Accountability", description: "Helpful systems, reminders, or people that reinforce the plan.", value: 4, note: "" },
      { key: "planning", label: "Financial Planning", description: "A clear, realistic structure for what happens next.", value: 4, note: "" },
      { key: "savings_buffer", label: "Savings Buffer", description: "A cushion that reduces panic and increases flexibility.", value: 4, note: "" },
      { key: "emotional_capacity", label: "Emotional Capacity", description: "Ability to deal with money decisions without shutting down.", value: 4, note: "" },
      { key: "consistency", label: "Habit Consistency", description: "Capacity to repeat small financial actions week after week.", value: 4, note: "" }
    ],
    obstacles: [
      { key: "unclear_spending", label: "Unclear Spending", description: "You may not yet have a sharp picture of where money is going.", value: 0, active: false },
      { key: "impulse_spending", label: "Impulse Spending", description: "Unplanned purchases may be weakening progress.", value: 0, active: false },
      { key: "income_variability", label: "Income Variability", description: "Changing income makes planning feel fragile.", value: 0, active: false },
      { key: "decision_fatigue", label: "Decision Fatigue", description: "Too many choices make consistent action harder.", value: 0, active: false },
      { key: "overwhelm", label: "Overwhelm", description: "Pressure around money may be making the plan feel heavier than it needs to be.", value: 0, active: false }
    ]
  },
  {
    key: "regain_focus",
    label: "Regain daily focus",
    description: "Rebuild calm attention and a simpler structure for meaningful work.",
    questions: [
      {
        key: "workspace_quality",
        prompt: "How supportive is your environment for focused work?",
        initial: "mixed",
        options: [
          {
            value: "supportive",
            label: "Supportive",
            effects: {
              resources: { environment: 3, deep_work_blocks: 1 },
              obstacles: { distraction_load: -2 }
            }
          },
          {
            value: "mixed",
            label: "Mixed",
            effects: {
              resources: { environment: 1 },
              obstacles: { distraction_load: 2 }
            }
          },
          {
            value: "noisy",
            label: "Distracting",
            effects: {
              resources: { environment: -1 },
              obstacles: { distraction_load: 4 }
            }
          }
        ]
      },
      {
        key: "task_clarity",
        prompt: "How clear is the next meaningful task on most days?",
        initial: "somewhat",
        options: [
          {
            value: "clear",
            label: "Clear",
            effects: {
              resources: { task_clarity: 3, prioritization: 1 },
              obstacles: { ambiguity: -2 }
            }
          },
          {
            value: "somewhat",
            label: "Somewhat clear",
            effects: {
              resources: { task_clarity: 1 },
              obstacles: { ambiguity: 2 }
            }
          },
          {
            value: "unclear",
            label: "Often unclear",
            effects: {
              resources: { task_clarity: -1 },
              obstacles: { ambiguity: 4 }
            }
          }
        ]
      },
      {
        key: "energy_stability",
        prompt: "How stable is your mental energy across the day?",
        initial: "mixed",
        options: [
          {
            value: "stable",
            label: "Mostly stable",
            effects: {
              resources: { energy_regulation: 3, recovery: 1 },
              obstacles: { fatigue: -2 }
            }
          },
          {
            value: "mixed",
            label: "Mixed",
            effects: {
              resources: { energy_regulation: 1 },
              obstacles: { fatigue: 2 }
            }
          },
          {
            value: "fragile",
            label: "Often fragile",
            effects: {
              resources: { energy_regulation: -1 },
              obstacles: { fatigue: 4 }
            }
          }
        ]
      },
      {
        key: "digital_boundaries",
        prompt: "How strong are your boundaries around notifications and distraction?",
        initial: "partial",
        options: [
          {
            value: "strong",
            label: "Strong",
            effects: {
              resources: { boundary_control: 3, deep_work_blocks: 1 },
              obstacles: { digital_drift: -2 }
            }
          },
          {
            value: "partial",
            label: "Partial",
            effects: {
              resources: { boundary_control: 1 },
              obstacles: { digital_drift: 2 }
            }
          },
          {
            value: "weak",
            label: "Weak",
            effects: {
              resources: { boundary_control: -1 },
              obstacles: { digital_drift: 4 }
            }
          }
        ]
      },
      {
        key: "restart_ability",
        prompt: "When you lose focus, how easily can you restart?",
        initial: "sometimes",
        options: [
          {
            value: "easy",
            label: "Fairly easily",
            effects: {
              resources: { reset_skill: 3, confidence: 1 },
              obstacles: { self_judgment: -2 }
            }
          },
          {
            value: "sometimes",
            label: "Sometimes",
            effects: {
              resources: { reset_skill: 1 },
              obstacles: { self_judgment: 2 }
            }
          },
          {
            value: "hard",
            label: "It is hard",
            effects: {
              resources: { reset_skill: -1 },
              obstacles: { self_judgment: 4 }
            }
          }
        ]
      }
    ],
    resources: [
      { key: "environment", label: "Helpful Environment", description: "A space and setup that support attention.", value: 4, note: "" },
      { key: "task_clarity", label: "Task Clarity", description: "Knowing the next meaningful thing to do without delay.", value: 4, note: "" },
      { key: "energy_regulation", label: "Energy Regulation", description: "A steadier mental and physical rhythm across the day.", value: 4, note: "" },
      { key: "boundary_control", label: "Boundary Control", description: "Ability to protect focus from notifications and interruptions.", value: 4, note: "" },
      { key: "reset_skill", label: "Restart Skill", description: "Ability to recover after distraction without spiraling.", value: 4, note: "" },
      { key: "deep_work_blocks", label: "Deep Work Blocks", description: "Protected windows for concentrated work.", value: 4, note: "" },
      { key: "recovery", label: "Recovery Rhythm", description: "Breaks and rest that help attention come back.", value: 4, note: "" },
      { key: "prioritization", label: "Prioritization", description: "Choosing the task that matters most right now.", value: 4, note: "" }
    ],
    obstacles: [
      { key: "distraction_load", label: "Distraction Load", description: "Your environment may be pulling attention in too many directions.", value: 0, active: false },
      { key: "ambiguity", label: "Ambiguity", description: "Unclear next steps can quietly drain focus.", value: 0, active: false },
      { key: "fatigue", label: "Fatigue", description: "Low or unstable energy may be undermining concentration.", value: 0, active: false },
      { key: "digital_drift", label: "Digital Drift", description: "Devices and notifications are likely stealing momentum.", value: 0, active: false },
      { key: "self_judgment", label: "Self-Judgment", description: "Harsh self-talk after distraction makes it harder to restart.", value: 0, active: false }
    ]
  }
];

const QUESTION_LIMIT = 4;
const RESOURCE_LIMIT = 4;
const OBSTACLE_LIMIT = 3;

function normalizeOptionEffects(option, resourceKeys, obstacleKeys) {
  const rawEffects = option && option.effects ? option.effects : {};
  const resourceEffects = {};
  const obstacleEffects = {};

  resourceKeys.forEach((key) => {
    resourceEffects[key] = Number(rawEffects.resources && rawEffects.resources[key] ? rawEffects.resources[key] : 0);
  });

  obstacleKeys.forEach((key) => {
    obstacleEffects[key] = Number(rawEffects.obstacles && rawEffects.obstacles[key] ? rawEffects.obstacles[key] : 0);
  });

  return {
    resources: resourceEffects,
    obstacles: obstacleEffects
  };
}

function trimGoalDefinition(goal) {
  const resources = goal.resources.slice(0, RESOURCE_LIMIT).map((resource) => ({ ...resource }));
  const obstacles = goal.obstacles.slice(0, OBSTACLE_LIMIT).map((obstacle) => ({ ...obstacle, note: obstacle.note || "" }));
  const resourceKeys = resources.map((resource) => resource.key);
  const obstacleKeys = obstacles.map((obstacle) => obstacle.key);
  const questions = goal.questions.slice(0, QUESTION_LIMIT).map((question) => ({
    ...question,
    options: question.options.map((option) => ({
      ...option,
      effects: normalizeOptionEffects(option, resourceKeys, obstacleKeys)
    }))
  }));

  return {
    ...goal,
    questions,
    resources,
    obstacles
  };
}

const goals = goalCatalog.map(trimGoalDefinition);

function getDefaultGoalKey() {
  return goals[0].key;
}

function getGoalDefinition(goalKey) {
  return goals.find((goal) => goal.key === goalKey) || goals[0];
}

module.exports = {
  goalPrompt,
  goals,
  outcomeStates,
  getDefaultGoalKey,
  getGoalDefinition
};
