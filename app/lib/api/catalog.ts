// Typed client for the catalog API (categories + products). Public storefront
// reads — no auth. Money arrives as integer paise (ADR-0010); format at the edge.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMinor: number;
  mrpMinor: number;
  stock: number;
  images: string[];
  categoryId: string | null;
  tags: string[];
  collection: string | null;
  material: string | null;
  color: string | null;
  isActive: boolean;
  isHandmade: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  avgRating: number;
  reviewCount: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
  sort?: "price_asc" | "price_desc";
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

/** Format integer paise as an Indian-grouped rupee string, e.g. 129900 → "₹1,299". */
export function formatINR(minor: number): string {
  const rupees = minor / 100;
  const whole = Number.isInteger(rupees);
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Percentage off, rounded. Returns 0 when there is no discount. */
export function discountPct(priceMinor: number, mrpMinor: number): number {
  if (mrpMinor <= 0 || mrpMinor <= priceMinor) return 0;
  return Math.round(((mrpMinor - priceMinor) / mrpMinor) * 100);
}

// Storefront catalog is read-heavy and changes rarely, so we lean on the Next.js
// Data Cache (revalidate + tags) instead of hitting the backend every request —
// cheap horizontal scaling without Redis. Admin writes can later bust a tag via
// revalidateTag('categories'|'products'). Redis stays a future option for
// session/cart/rate-limit scale (ADR-0010 revisit trigger).
const CACHE = {
  categories: { revalidate: 300, tags: ["categories"] },
  products: { revalidate: 60, tags: ["products"] },
  product: (slug: string) => ({
    revalidate: 60,
    tags: ["products", `product:${slug}`],
  }),
} as const;

async function get<T>(
  path: string,
  fallback: T,
  next: { revalidate: number; tags: readonly string[] },
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: next.revalidate, tags: [...next.tags] },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // Backend unreachable — degrade to an empty/fallback state, never crash the page.
    return fallback;
  }
}

export const catalogApi = {
  categories: () => get<Category[]>("/categories", [], CACHE.categories),

  products: (filters: ProductFilters = {}) => {
    const qs = new URLSearchParams();
    if (filters.categorySlug) qs.set("categorySlug", filters.categorySlug);
    if (filters.subcategorySlug)
      qs.set("subcategorySlug", filters.subcategorySlug);
    if (filters.search) qs.set("search", filters.search);
    if (filters.sort) qs.set("sort", filters.sort);
    if (filters.isFeatured) qs.set("isFeatured", "true");
    qs.set("page", String(filters.page ?? 1));
    qs.set("pageSize", String(filters.pageSize ?? 24));
    return get<Paginated<Product>>(
      `/products?${qs.toString()}`,
      {
        items: [],
        total: 0,
        page: 1,
        pageSize: filters.pageSize ?? 24,
        totalPages: 0,
      },
      CACHE.products,
    );
  },

  product: (slug: string) =>
    get<Product | null>(
      `/products/${encodeURIComponent(slug)}`,
      null,
      CACHE.product(slug),
    ),
};
