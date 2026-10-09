// @vitest-environment jsdom

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "@/components/auth/password-input";

function renderField() {
  return render(
    <PasswordInput
      id="password"
      name="password"
      label="Password"
      autoComplete="current-password"
    />,
  );
}

describe("PasswordInput", () => {
  it("masks the value by default", () => {
    renderField();

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("reveals and re-masks the value as the toggle is clicked", async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("exposes the current action as a hover tooltip", () => {
    // The button shows an icon rather than text, so the title attribute is
    // what tells a sighted user what it does before they click it.
    renderField();

    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toHaveAttribute("title", "Show password");
  });

  it("does not submit the surrounding form when toggled", async () => {
    // The regression this file exists for. A button inside a form defaults to
    // type="submit", so without an explicit type="button" every attempt to
    // peek at the password would submit the login form instead.
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();

    render(
      <form onSubmit={onSubmit}>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
        />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
