import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isUnauthorized,
  setUnauthorizedHandler,
  reportUnauthorized,
} from "./session";
import { ApiError } from "../api/auth";

describe("isUnauthorized", () => {
  it("is true only for a 401 ApiError", () => {
    expect(isUnauthorized(new ApiError("nope", 401))).toBe(true);
    expect(isUnauthorized(new ApiError("forbidden", 403))).toBe(false);
    expect(isUnauthorized(new Error("boom"))).toBe(false);
    expect(isUnauthorized(null)).toBe(false);
  });
});

describe("reportUnauthorized", () => {
  // Fake timers throughout so the internal debounce flag resets deterministically
  // between tests (a real setTimeout would leak `firing` into the next test).
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runAllTimers();
    setUnauthorizedHandler(null);
    vi.useRealTimers();
  });

  it("does nothing when no handler is registered", () => {
    setUnauthorizedHandler(null);
    expect(() => reportUnauthorized()).not.toThrow();
  });

  it("invokes the registered handler", () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    reportUnauthorized();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("collapses a burst of 401s into a single logout", () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    // Parallel requests all 401 in the same tick.
    reportUnauthorized();
    reportUnauthorized();
    reportUnauthorized();
    expect(handler).toHaveBeenCalledTimes(1);
    // After the tick releases, a genuinely new 401 fires again.
    vi.runAllTimers();
    reportUnauthorized();
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
