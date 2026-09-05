import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand cache invalidation for the storefront Data Cache. The backend calls
 * this (secret-protected) after an order is paid or an admin edits the catalog,
 * so cached product/category reads refresh immediately instead of waiting for
 * their TTL. Body: { tags: string[] } (e.g. ["products", "product:atta"]).
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { tags?: unknown };
  const tags =
    Array.isArray(body.tags) && body.tags.every((t) => typeof t === "string")
      ? (body.tags as string[])
      : ["products"];
  // Next 16: the second arg is the cache profile. `{ expire: 0 }` expires the
  // tag immediately, so the NEXT request blocks on fresh data. The recommended
  // "max" profile is stale-while-revalidate, which served the pre-change page
  // once more after every admin edit — an admin toggling a product off still
  // saw it on the storefront on the next load. Admin writes are rare, so paying
  // for one uncached render is the right trade for read-your-own-writes.
  // (`updateTag`, the other immediate option, is Server-Actions-only.)
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
