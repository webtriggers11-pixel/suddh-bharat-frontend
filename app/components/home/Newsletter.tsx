"use client";

import { useState } from "react";
import { Container } from "../ui/Container";

/**
 * Pre-launch waitlist signup. Client-side only for now (no backend — see
 * FEAT-001 spec); validates the email and shows an inline confirmation.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(true);
      return;
    }
    // TODO: POST to the waitlist provider once chosen (FEAT-001 open question).
    setError(false);
    setDone(true);
  };

  return (
    <section className="bg-ink text-paper" aria-labelledby="newsletter-title">
      <Container className="py-20 text-center">
        <h2
          id="newsletter-title"
          className="font-display text-[clamp(26px,3.4vw,36px)] font-semibold"
        >
          Join the list before we launch
        </h2>
        <p className="mx-auto mt-3.5 max-w-md font-body text-[15px] text-sage">
          Early access, our full clean-label breakdown series, and first pick of
          founding-member perks.
        </p>

        {done ? (
          <p role="status" className="mt-8 font-mono text-sm text-gold">
            You&apos;re on the list. We&apos;ll be in touch.
          </p>
        ) : (
          <>
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row"
              noValidate
            >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(false);
              }}
              aria-invalid={error}
              aria-describedby={error ? "newsletter-error" : undefined}
              placeholder="your@email.com"
              className="min-w-0 flex-1 rounded-chip border border-sage/40 bg-transparent px-4 py-3.5 font-body text-sm text-paper placeholder:text-sage"
            />
            <button
              type="submit"
              className="rounded-chip bg-gold px-5 py-3.5 font-body text-sm font-bold text-ink"
            >
              Notify me
            </button>
            </form>
            {error && (
              <p
                id="newsletter-error"
                role="alert"
                className="mt-3 font-mono text-sm text-gold"
              >
                Please enter a valid email address.
              </p>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
