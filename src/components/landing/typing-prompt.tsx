"use client";

import { useEffect, useState } from "react";
import {
  EXAMPLE_QUESTIONS,
  firstTypingState,
  nextTypingStep,
} from "@/components/landing/typing-steps";

/**
 * Example questions that type themselves into the hero question box.
 *
 * Each render schedules exactly one timeout for the next step, and the
 * cleanup cancels it, so unmounting mid-animation leaves nothing running.
 * The text is aria-hidden: the surrounding link has its own label, and a
 * screen reader should not hear a sentence being typed letter by letter.
 */
export function TypingPrompt() {
  const [step, setStep] = useState(firstTypingState);

  useEffect(() => {
    // Reduced motion keeps the first question still, which is also exactly
    // what the server rendered, so nothing jumps.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { state, delay } = nextTypingStep(step);
    const timer = setTimeout(() => setStep(state), delay);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <span aria-hidden="true">
      {EXAMPLE_QUESTIONS[step.index].slice(0, step.length)}
      <span className="bg-accent-2 ml-0.5 inline-block h-5 w-0.5 translate-y-1 rounded-full motion-safe:animate-pulse" />
    </span>
  );
}
