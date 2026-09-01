import { cartApi } from "../api/cart";
import { wishlistApi } from "../api/wishlist";
import { ApiError } from "../api/auth";
import {
  getGuestCartLines,
  getGuestWishlist,
  removeGuestCartLine,
  removeGuestWishlistItem,
} from "./guest";

/**
 * A 4xx means the item will never merge (out of stock, inactive, gone, or
 * already present) → drop it. A network error or 5xx is transient → keep it in
 * the guest store so a later attempt retries, instead of silently losing it.
 */
function isPermanent(err: unknown): boolean {
  return err instanceof ApiError && err.status < 500;
}

/**
 * Merges the guest cart + wishlist (localStorage) into the server account for
 * the given token — the Amazon pattern. Shared by `GuestMerge` (passive,
 * fires once right after any sign-in) and guest checkout (active, at the
 * moment of a guest's first purchase, FEAT-019). Items are removed from the
 * guest store only once definitively handled — merged, or permanently
 * rejected — so an interruption leaves exactly the un-merged items behind for
 * a later retry, never a duplicate and never a silent loss.
 */
export async function mergeGuestData(token: string): Promise<void> {
  for (const l of getGuestCartLines()) {
    try {
      await cartApi.add(token, l.productId, l.quantity);
      removeGuestCartLine(l.productId);
    } catch (err) {
      if (isPermanent(err)) removeGuestCartLine(l.productId);
    }
  }
  for (const id of getGuestWishlist()) {
    try {
      await wishlistApi.add(token, id);
      removeGuestWishlistItem(id);
    } catch (err) {
      if (isPermanent(err)) removeGuestWishlistItem(id);
    }
  }
}
