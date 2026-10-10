// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentPanel } from "@/components/auth/enrollment-panel";

// The server actions are mocked at the module boundary: these tests cover how
// the panel reacts to each answer, not the TOTP checks behind them, which
// have tests of their own.
const actions = vi.hoisted(() => ({
  startEnrollment: vi.fn(),
  confirmEnrollment: vi.fn(),
  disableTotp: vi.fn(),
}));

vi.mock("@/lib/auth/enrollment", () => actions);

const WRONG_CODE = {
  error: "That code is not valid. Check your app and try again.",
};

const TURN_OFF = { name: "Turn off two factor authentication" };

function digitBoxes() {
  return screen.getAllByRole("textbox", { name: /^Digit \d of 6$/ });
}

describe("EnrollmentPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears and refocuses the boxes after a wrong code", async () => {
    actions.startEnrollment.mockResolvedValue({ qrSvg: "<svg></svg>" });
    actions.confirmEnrollment.mockResolvedValue(WRONG_CODE);
    const user = userEvent.setup();
    render(<EnrollmentPanel enabledAt={null} />);

    await user.click(
      screen.getByRole("button", { name: "Set up two factor authentication" }),
    );
    await screen.findByRole("group", { name: /6 digit code/ });
    await user.keyboard("000000");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That code is not valid",
    );
    expect(actions.confirmEnrollment).toHaveBeenCalledTimes(1);
    for (const box of digitBoxes()) {
      expect(box).toHaveValue("");
    }
    expect(digitBoxes()[0]).toHaveFocus();
  });

  it("starts clean when the turn off form is reopened after Cancel", async () => {
    actions.disableTotp.mockResolvedValue(WRONG_CODE);
    const user = userEvent.setup();
    render(<EnrollmentPanel enabledAt={new Date()} />);

    await user.click(screen.getByRole("button", TURN_OFF));
    await user.keyboard("111111");
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", TURN_OFF));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // A fresh wrong code still has to show its error.
    await user.keyboard("222222");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("says two factor authentication is off after turning it off", async () => {
    actions.disableTotp.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<EnrollmentPanel enabledAt={new Date()} />);

    await user.click(screen.getByRole("button", TURN_OFF));
    await user.keyboard("123456");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Two factor authentication is off.",
    );
  });
});
