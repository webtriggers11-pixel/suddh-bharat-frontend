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

// Storefront catalog freshness. Categories change rarely → cached (Next Data
// Cache). PRODUCTS carry live stock, so they must be fresh: after a purchase the
// shopper must see the real "in stock"/"N available" (a cached snapshot showed
// stale stock — the reported bug). `revalidate: 0` = always fresh, matching the
// uncached client-side infinite-scroll fetch so page-1 and page-2+ agree. When a
// products data cache is reintroduced, bust it via revalidateTag('products') /
// revalidateTag(`product:${slug}`) on order-paid + admin writes (ADR-0010 revisit).
const CACHE = {
  categories: { revalidate: 300, tags: ["categories"] },
  // Products carry live stock. A short TTL bounds staleness, and the backend
  // busts these tags via POST /api/revalidate on order-paid + admin writes for
  // immediate freshness — so this is a safety net, not the primary mechanism.
  products: { revalidate: 120, tags: ["products"] },
  product: (slug: string) => ({
    revalidate: 120,
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

/** Build the products query string shared by server + client fetchers. */
function productsQuery(filters: ProductFilters): string {
  const qs = new URLSearchParams();
  if (filters.categorySlug) qs.set("categorySlug", filters.categorySlug);
  if (filters.subcategorySlug) qs.set("subcategorySlug", filters.subcategorySlug);
  if (filters.search) qs.set("search", filters.search);
  if (filters.sort) qs.set("sort", filters.sort);
  if (filters.isFeatured) qs.set("isFeatured", "true");
  qs.set("page", String(filters.page ?? 1));
  qs.set("pageSize", String(filters.pageSize ?? 24));
  return qs.toString();
}

/**
 * Browser-side products fetch for infinite scroll (pages 2+). Unlike
 * `catalogApi.products`, this does NOT use the Next Data Cache — it runs in the
 * client. Degrades to an empty page on error so the grid never crashes.
 */
export async function fetchProductsClient(
  filters: ProductFilters,
): Promise<Paginated<Product>> {
  const empty: Paginated<Product> = {
    items: [],
    total: 0,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 24,
    totalPages: 0,
  };
  try {
    const res = await fetch(`${API_URL}/products?${productsQuery(filters)}`);
    if (!res.ok) return empty;
    return (await res.json()) as Paginated<Product>;
  } catch {
    return empty;
  }
}

/** A lightweight search suggestion item (autocomplete). */
export interface SuggestItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  priceMinor?: number;
}

export interface SuggestResult {
  products: SuggestItem[];
  suggestions: string[];
}

/**
 * Browser-side fetch for the product page's "You may also like" rail
 * (FEAT-017). Same-category, active, in-stock, ranked server-side — this is a
 * plain read with no query params. Degrades to `[]` on error/not-found so the
 * section simply doesn't render rather than breaking the page.
 */
export async function getRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_URL}/products/${encodeURIComponent(slug)}/related`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Product[]) : [];
  } catch {
    return [];
  }
}

/** Autocomplete for the search bar (backend `suggest=true`). */
export async function fetchSuggestions(search: string): Promise<SuggestResult> {
  const empty: SuggestResult = { products: [], suggestions: [] };
  const q = search.trim();
  if (q.length < 2) return empty;
  try {
    const qs = new URLSearchParams({ suggest: "true", search: q, pageSize: "6" });
    const res = await fetch(`${API_URL}/products?${qs.toString()}`);
    if (!res.ok) return empty;
    const data = (await res.json()) as Partial<SuggestResult>;
    return {
      products: Array.isArray(data.products) ? data.products : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
  } catch {
    return empty;
  }
}
