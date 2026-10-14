// @vitest-environment jsdom

import type { ComponentProps, FormEvent } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpInput } from "@/components/ui/otp-input";

function setup(props: Partial<ComponentProps<typeof OtpInput>> = {}) {
  const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });
  render(
    <form aria-label="Verify" onSubmit={onSubmit}>
      <OtpInput name="code" label="6 digit code" {...props} />
    </form>,
  );
  const form = screen.getByRole("form", { name: "Verify" }) as HTMLFormElement;

  return {
    user: userEvent.setup(),
    onSubmit,
    boxes: screen.getAllByRole("textbox"),
    // What the server action would receive, read the same way it reads it.
    postedCode: () => new FormData(form).get("code"),
  };
}

describe("OtpInput", () => {
  it("shows one labelled box per digit inside a named group", () => {
    const { boxes } = setup();

    expect(screen.getByRole("group", { name: "6 digit code" })).toBeVisible();
    expect(boxes).toHaveLength(6);
    expect(boxes[0]).toHaveAccessibleName("Digit 1 of 6");
  });

  it("moves forward as digits are typed and posts the joined code", async () => {
    const { user, boxes, postedCode } = setup({ autoSubmit: false });

    await user.click(boxes[0]);
    await user.keyboard("123456");

    expect(postedCode()).toBe("123456");
    expect(boxes[5]).toHaveFocus();
  });

  it("steps back and clears the previous box on backspace", async () => {
    const { user, boxes, postedCode } = setup({ autoSubmit: false });

    await user.click(boxes[0]);
    await user.keyboard("12{Backspace}");

    expect(postedCode()).toBe("1");
    expect(boxes[1]).toHaveFocus();
  });

  it("fills every box from a pasted code, ignoring spaces", async () => {
    const { user, boxes, postedCode } = setup({ autoSubmit: false });

    await user.click(boxes[0]);
    await user.paste("123 456");

    expect(postedCode()).toBe("123456");
  });

  it("ignores letters", async () => {
    const { user, boxes, postedCode } = setup({ autoSubmit: false });

    await user.click(boxes[0]);
    await user.keyboard("a1b");

    expect(postedCode()).toBe("1");
  });

  it("submits the form once, as soon as the last box is filled", async () => {
    const { user, boxes, onSubmit } = setup();

    await user.click(boxes[0]);
    await user.keyboard("123456");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit an incomplete code on Enter", async () => {
    const { user, boxes, onSubmit } = setup();

    await user.click(boxes[0]);
    await user.keyboard("123{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
