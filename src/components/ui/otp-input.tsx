"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OtpInputProps {
  /** Form field name. The joined digits are posted under this name. */
  name: string;
  /** Accessible name for the group of boxes, for example "6 digit code". */
  label: string;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Submit the surrounding form as soon as every box is filled. */
  autoSubmit?: boolean;
  /** id of the element describing an error, linked for screen readers. */
  describedBy?: string;
}

const DIGIT = /^[0-9]$/;

/**
 * A one time code entered into separate boxes, one digit each.
 *
 * The boxes are only the interface. The value the server receives is a single
 * hidden input holding the joined digits, so existing server actions that
 * read formData.get("code") keep working unchanged.
 */
export function OtpInput({
  name,
  label,
  length = 6,
  invalid = false,
  disabled = false,
  autoFocus = false,
  autoSubmit = true,
  describedBy,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length }, () => ""),
  );
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const submitted = useRef(false);
  const complete = digits.every((digit) => digit !== "");

  // Submit after React has written the last digit into the hidden field.
  // Submitting from inside the key handler would post the code one digit
  // short, because the DOM has not been updated yet at that point.
  useEffect(() => {
    if (!complete) {
      submitted.current = false;
      return;
    }
    if (autoSubmit && !submitted.current) {
      submitted.current = true;
      inputs.current[0]?.form?.requestSubmit();
    }
  }, [complete, autoSubmit]);

  function focusBox(index: number) {
    const box = inputs.current[Math.max(0, Math.min(length - 1, index))];
    box?.focus();
    box?.select();
  }

  function setDigit(index: number, value: string, focusIndex: number) {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    focusBox(focusIndex);
  }

  function fillFrom(start: number, text: string) {
    const next = [...digits];
    const chars = text.slice(0, length - start).split("");
    chars.forEach((char, offset) => {
      next[start + offset] = char;
    });
    setDigits(next);
    focusBox(start + chars.length);
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (DIGIT.test(event.key)) {
      event.preventDefault();
      setDigit(index, event.key, index + 1);
      return;
    }

    switch (event.key) {
      case "Backspace":
        event.preventDefault();
        if (digits[index]) setDigit(index, "", index);
        else if (index > 0) setDigit(index - 1, "", index - 1);
        return;
      case "Delete":
        event.preventDefault();
        setDigit(index, "", index);
        return;
      case "ArrowLeft":
        event.preventDefault();
        focusBox(index - 1);
        return;
      case "ArrowRight":
        event.preventDefault();
        focusBox(index + 1);
        return;
      case "Enter":
        // Explicit, because implicit form submission is unreliable in some
        // window focus states.
        event.preventDefault();
        if (complete) event.currentTarget.form?.requestSubmit();
        return;
    }

    // Block any other printable character, but let Tab and shortcuts like
    // Cmd+V through.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
    }
  }

  // Phones and password managers often skip key events and write straight
  // into the field, sometimes the whole code at once.
  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 1) {
      setDigit(index, value, value ? index + 1 : index);
      return;
    }

    if (value.length === 2 && digits[index]) {
      // A new digit typed into a box that already had one: keep the new one.
      setDigit(index, value.replace(digits[index], ""), index + 1);
      return;
    }

    fillFrom(value.length >= length ? 0 : index, value);
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (text) fillFrom(text.length >= length ? 0 : index, text);
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center gap-2.5 max-[520px]:gap-1.5 ${
        invalid ? "animate-shake motion-reduce:animate-none" : ""
      }`}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={digit}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onChange={(event) => handleChange(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={`text-fg caret-primary focus:border-primary focus:bg-card h-16 w-14 rounded-2xl border-2 text-center font-mono text-[26px] font-semibold transition outline-none focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 max-[520px]:h-[54px] max-[520px]:w-11 max-[520px]:rounded-[13px] max-[520px]:text-[22px] ${
            invalid
              ? "border-danger bg-danger-container"
              : digit
                ? "bg-surface-3 border-transparent"
                : "bg-surface-2 border-transparent"
          }`}
        />
      ))}
      <input type="hidden" name={name} value={digits.join("")} />
    </div>
  );
}
