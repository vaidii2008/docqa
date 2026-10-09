import { describe, it, expect } from "vitest";
import {
  EXAMPLE_QUESTIONS,
  HOLD_MS,
  firstTypingState,
  nextTypingStep,
  type TypingState,
} from "@/components/landing/typing-steps";

const QUESTIONS = ["ab", "xyz"];

describe("nextTypingStep", () => {
  it("types one character at a time", () => {
    const { state } = nextTypingStep(
      { index: 0, length: 0, deleting: false },
      QUESTIONS,
    );

    expect(state).toEqual({ index: 0, length: 1, deleting: false });
  });

  it("holds a finished question before deleting it", () => {
    const { state, delay } = nextTypingStep(
      { index: 0, length: 2, deleting: false },
      QUESTIONS,
    );

    expect(state.deleting).toBe(true);
    expect(delay).toBe(HOLD_MS);
  });

  it("deletes one character at a time", () => {
    const { state } = nextTypingStep(
      { index: 0, length: 2, deleting: true },
      QUESTIONS,
    );

    expect(state).toEqual({ index: 0, length: 1, deleting: true });
  });

  it("moves to the next question once deleted, wrapping at the end", () => {
    expect(
      nextTypingStep({ index: 0, length: 0, deleting: true }, QUESTIONS).state,
    ).toEqual({ index: 1, length: 0, deleting: false });
    expect(
      nextTypingStep({ index: 1, length: 0, deleting: true }, QUESTIONS).state,
    ).toEqual({ index: 0, length: 0, deleting: false });
  });

  it("visits every example question and wraps back to the first", () => {
    let state: TypingState = firstTypingState;
    const started: number[] = [];

    // Bounded, so a bug that never advances fails instead of hanging.
    let steps = 0;
    while (started.length < EXAMPLE_QUESTIONS.length && steps < 2000) {
      state = nextTypingStep(state).state;
      if (state.length === 0 && !state.deleting) started.push(state.index);
      steps += 1;
    }

    expect(started).toEqual([1, 2, 3, 0]);
  });
});
