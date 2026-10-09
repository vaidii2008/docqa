"use client";

import { useEffect, useRef } from "react";

// How far the glow moves toward the cursor on each frame. Lower feels lazier.
const EASING = 0.06;

/**
 * The soft colour field behind the marketing and auth pages, plus a glow that
 * trails the cursor.
 *
 * Place it as the first child of a page wrapper that has "relative isolate".
 * isolate creates a stacking context, so this layer's negative z-index keeps
 * it above the page background instead of slipping behind it.
 *
 * The glow moves by writing a transform straight onto its DOM node inside
 * requestAnimationFrame, not through React state. Setting state 60 times a
 * second would re-render the tree for something only the GPU needs to know.
 */
export function AuraBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Respect the operating system setting: no cursor tracking, and the CSS
    // drift is switched off by motion-reduce in the markup below.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.35;
    let targetX = x;
    let targetY = y;
    let frame = 0;

    const paint = () => {
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const step = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      x += dx * EASING;
      y += dy * EASING;
      paint();
      // Stop once the glow has caught up, so an idle page costs nothing.
      frame =
        Math.abs(dx) + Math.abs(dy) > 0.5 ? requestAnimationFrame(step) : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) frame = requestAnimationFrame(step);
    };

    paint();
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="animate-aura absolute inset-0 motion-reduce:animate-none"
        style={{
          background: [
            "radial-gradient(60% 50% at 20% 0%, var(--aura-1), transparent 70%)",
            "radial-gradient(50% 45% at 85% 10%, var(--aura-2), transparent 70%)",
            "radial-gradient(45% 40% at 55% 100%, var(--aura-3), transparent 70%)",
          ].join(", "),
        }}
      />
      <div
        ref={glowRef}
        className="absolute -top-[300px] -left-[300px] size-[600px] rounded-full blur-[30px] will-change-transform"
        style={{
          background: [
            "radial-gradient(circle, var(--aura-2), transparent 62%)",
            "radial-gradient(circle at 35% 35%, var(--aura-1), transparent 55%)",
          ].join(", "),
        }}
      />
    </div>
  );
}
