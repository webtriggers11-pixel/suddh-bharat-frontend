"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { reviewApi, type Review } from "../../lib/api/reviews";
import { SkeletonListRows } from "../ui/Skeleton";

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5`} className="text-gold">
      {"★".repeat(Math.round(value))}
      <span className="text-line">{"★".repeat(Math.max(0, 5 - Math.round(value)))}</span>
    </span>
  );
}

/** Reviews list + write form for a product (client-side, TanStack Query). */
export function ProductReviews({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const { user, getToken } = useAuth();
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewApi.forProduct(productId),
  });

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () => {
      const token = getToken();
      if (!token) throw new Error("Please sign in to review");
      return reviewApi.create(token, {
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
      });
    },
    onSuccess: () => {
      setDone(true);
      setTitle("");
      setBody("");
      setRating(5);
      void qc.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "Could not submit your review"),
  });

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="font-display text-2xl font-semibold text-ink">Reviews</h2>

      {isLoading ? (
        <SkeletonListRows count={3} variant="review" className="mt-4" />
      ) : reviews.length === 0 ? (
        <p className="mt-4 font-body text-sm text-gray">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
          {reviews.map((r: Review) => (
            <li key={r.id} className="py-5">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} />
                <span className="font-body text-sm font-semibold text-ink">
                  {r.userName}
                </span>
                <span className="font-mono text-[11px] text-gray">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.title && (
                <p className="mt-2 font-body text-sm font-semibold text-ink">
                  {r.title}
                </p>
              )}
              {r.body && (
                <p className="mt-1 font-body text-sm text-gray">{r.body}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Write a review */}
      <div className="mt-8 rounded-card border border-line bg-paper-dim p-5">
        {!user ? (
          <p className="font-body text-sm text-gray">
            <Link
              href={`/login?redirect=/product/${slug}`}
              className="font-semibold text-forest underline"
            >
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        ) : done ? (
          <p role="status" className="font-body text-sm text-forest">
            Thanks! Your review is submitted and will appear once approved.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              createMut.mutate();
            }}
            className="flex flex-col gap-3"
          >
            <p className="font-display text-lg font-semibold text-ink">
              Write a review
            </p>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  className={`text-2xl leading-none ${
                    n <= rating ? "text-gold" : "text-line"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              maxLength={255}
              className="rounded-chip border border-line bg-white px-3 py-2 font-body text-sm text-ink placeholder:text-gray focus:border-forest focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share what you liked (optional)"
              rows={3}
              maxLength={2000}
              className="rounded-card border border-line bg-white px-3 py-2 font-body text-sm text-ink placeholder:text-gray focus:border-forest focus:outline-none"
            />
            {error && (
              <p role="alert" className="font-mono text-[11px] text-gold">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={createMut.isPending}
              className="self-start rounded-chip bg-forest px-6 py-2.5 font-body text-sm font-semibold text-paper disabled:opacity-60"
            >
              {createMut.isPending ? "Submitting…" : "Submit review"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
