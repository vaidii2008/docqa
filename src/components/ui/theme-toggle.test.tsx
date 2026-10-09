// @vitest-environment jsdom

import type { FormEvent } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// next-themes is mocked at its boundary: these tests cover what the toggle
// decides, not how the library stores the choice.
const theme = vi.hoisted(() => ({
  resolvedTheme: "light" as string | undefined,
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => theme,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    theme.resolvedTheme = "light";
    theme.setTheme.mockClear();
  });

  it("offers dark mode while the light theme is active", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(theme.setTheme).toHaveBeenCalledWith("dark");
  });

  it("offers light mode while the dark theme is active", async () => {
    theme.resolvedTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );

    expect(theme.setTheme).toHaveBeenCalledWith("light");
  });

  it("does not submit a form it sits inside", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <ThemeToggle />
      </form>,
    );

    await user.click(screen.getByRole("button"));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
