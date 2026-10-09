// Shared class recipes for anything that should look like a button. Plain
// strings rather than a component, so they work on <Link>, <a> and <button>
// alike without wrapping each one. Size and colour live in separate pieces so
// no recipe ever carries two conflicting padding or text size classes.

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40";

const medium = "min-h-11 px-5 text-[15px]";
const large = "min-h-13 px-7 text-base";
const compact = "min-h-11 px-3.5 text-[15px]";

const filled =
  "bg-primary text-on-primary hover:-translate-y-px hover:shadow-soft";
const outline = "border border-line text-fg hover:bg-surface";

export const filledButton = `${base} ${medium} ${filled}`;
export const filledButtonLarge = `${base} ${large} ${filled}`;

export const outlineButton = `${base} ${medium} ${outline}`;
export const outlineButtonLarge = `${base} ${large} ${outline}`;

export const tonalButton = `${base} ${medium} bg-primary-container text-on-primary-container hover:shadow-soft`;

export const textButton = `${base} ${compact} text-primary hover:bg-surface`;

export const quietButton = `${base} ${compact} text-fg-muted hover:bg-surface hover:text-fg`;
