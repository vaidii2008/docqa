// The typing effect in the hero question box, as a pure state machine.
// Keeping the timing rules out of the component means they can be tested
// without timers or a DOM.

export const EXAMPLE_QUESTIONS = [
  "What is the notice period in my lease?",
  "Summarise chapter 3 of my thesis notes",
  "How many leave days do new starters get?",
  "Which clauses mention data retention?",
];

export const TYPE_MS = 55;
export const DELETE_MS = 22;
export const HOLD_MS = 1800;
export const PAUSE_MS = 300;

export interface TypingState {
  index: number;
  length: number;
  deleting: boolean;
}

// Start with the first question already typed, so the server render shows a
// complete example and the animation begins by holding it.
export const firstTypingState: TypingState = {
  index: 0,
  length: EXAMPLE_QUESTIONS[0].length,
  deleting: false,
};

/**
 * Given where the effect is now, return the next state and how long to wait
 * before showing it.
 */
export function nextTypingStep(
  current: TypingState,
  questions: readonly string[] = EXAMPLE_QUESTIONS,
): { state: TypingState; delay: number } {
  const question = questions[current.index];

  if (!current.deleting && current.length < question.length) {
    return {
      state: { ...current, length: current.length + 1 },
      delay: TYPE_MS,
    };
  }

  if (!current.deleting) {
    // Fully typed: hold it long enough to read, then start deleting.
    return { state: { ...current, deleting: true }, delay: HOLD_MS };
  }

  if (current.length > 0) {
    return {
      state: { ...current, length: current.length - 1 },
      delay: DELETE_MS,
    };
  }

  // Fully deleted: move on to the next question, wrapping at the end.
  return {
    state: {
      index: (current.index + 1) % questions.length,
      length: 0,
      deleting: false,
    },
    delay: PAUSE_MS,
  };
}
