import { describe, it, expect } from "vitest";
import { orderStatusLabel, orderStatusTone } from "./orders";

describe("orderStatusLabel", () => {
  it("maps known statuses to friendly labels", () => {
    expect(orderStatusLabel("PLACED")).toBe("Order placed");
    expect(orderStatusLabel("OUT_FOR_DELIVERY")).toBe("Out for delivery");
    expect(orderStatusLabel("DELIVERED")).toBe("Delivered");
  });

  it("falls back to the raw status when unknown", () => {
    expect(orderStatusLabel("WEIRD")).toBe("WEIRD");
  });
});

describe("orderStatusTone", () => {
  it("uses verified tone for delivered/confirmed", () => {
    expect(orderStatusTone("DELIVERED")).toBe("verified");
    expect(orderStatusTone("CONFIRMED")).toBe("verified");
  });

  it("uses pending tone for awaiting payment", () => {
    expect(orderStatusTone("PENDING")).toBe("pending");
  });

  it("defaults to neutral", () => {
    expect(orderStatusTone("PLACED")).toBe("neutral");
    expect(orderStatusTone("CANCELLED")).toBe("neutral");
  });
});
