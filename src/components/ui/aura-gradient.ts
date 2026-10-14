// The three soft colour pools behind the marketing pages, shared by the fixed
// page background and the call to action card. It lives in a plain module
// because anything exported from a "use client" file reaches a server
// component as a client reference, not as the value itself.
export const AURA_GRADIENT = [
  "radial-gradient(60% 50% at 20% 0%, var(--aura-1), transparent 70%)",
  "radial-gradient(50% 45% at 85% 10%, var(--aura-2), transparent 70%)",
  "radial-gradient(45% 40% at 55% 100%, var(--aura-3), transparent 70%)",
].join(", ");
