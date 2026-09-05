import { describe, expect, it, vi, beforeEach } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag: (...a: unknown[]) => revalidateTag(...a) }));

import { POST } from "./route";

function req(secret: string | null, body: unknown) {
  const url = `http://localhost/api/revalidate${secret === null ? "" : `?secret=${secret}`}`;
  return {
    nextUrl: new URL(url),
    json: async () => body,
  } as unknown as import("next/server").NextRequest;
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    process.env.REVALIDATE_SECRET = "s3cret";
  });

  it("rejects a wrong secret without touching the cache", async () => {
    const res = await POST(req("nope", { tags: ["products"] }));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects when no secret is configured", async () => {
    delete process.env.REVALIDATE_SECRET;
    const res = await POST(req("s3cret", { tags: ["products"] }));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  /**
   * Read-your-own-writes: an admin who deactivates a product must not see it on
   * the very next storefront load. `{ expire: 0 }` makes that request a blocking
   * revalidate; the "max" profile would serve the pre-change page once more.
   */
  it("expires each tag immediately rather than stale-while-revalidate", async () => {
    const res = await POST(req("s3cret", { tags: ["products", "product:atta"] }));
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("product:atta", { expire: 0 });
  });

  it("falls back to the products tag for a malformed body", async () => {
    await POST(req("s3cret", { tags: [1, 2] }));
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("products", { expire: 0 });
  });
});
