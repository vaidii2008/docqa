// Shared class recipes for anything that should look like a button. Plain
// strings rather than a component, so they work on <Link>, <a> and <button>
// alike without wrapping each one.

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40";

export const filledButton = `${base} bg-primary px-5 text-on-primary hover:-translate-y-px hover:shadow-soft`;

export const tonalButton = `${base} bg-primary-container px-5 text-on-primary-container hover:shadow-soft`;

export const outlineButton = `${base} border border-line px-5 text-fg hover:bg-surface`;

export const textButton = `${base} px-3.5 text-primary hover:bg-surface`;

export const quietButton = `${base} px-3.5 text-fg-muted hover:bg-surface hover:text-fg`;
