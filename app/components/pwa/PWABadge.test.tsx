import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PWABadge } from "./PWABadge";

type FakeInstallEvent = Event & {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: string }>;
};

function fireInstallPrompt(): FakeInstallEvent {
  const evt = new Event("beforeinstallprompt") as FakeInstallEvent;
  evt.prompt = vi.fn().mockResolvedValue(undefined);
  evt.userChoice = Promise.resolve({ outcome: "accepted" });
  act(() => {
    window.dispatchEvent(evt);
  });
  return evt;
}

describe("PWABadge", () => {
  it("is hidden until the browser offers an install", () => {
    render(<PWABadge />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("offers install after beforeinstallprompt and calls the browser prompt", async () => {
    render(<PWABadge />);
    const evt = fireInstallPrompt();
    await userEvent.click(await screen.findByRole("button", { name: /install/i }));
    expect(evt.prompt).toHaveBeenCalled();
  });

  it("Dismiss removes the badge", async () => {
    render(<PWABadge />);
    fireInstallPrompt();
    expect(await screen.findByRole("status")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
