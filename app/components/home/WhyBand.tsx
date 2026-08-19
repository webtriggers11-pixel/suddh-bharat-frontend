import { Container } from "../ui/Container";

export function WhyBand() {
  return (
    <section className="bg-forest text-paper">
      <Container className="grid items-start gap-14 py-20 md:grid-cols-2 md:py-24">
        <h2 className="font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-tight">
          You won&apos;t find this on Zepto, Blinkit, or DMart.
        </h2>
        <div>
          <p className="font-body text-base leading-relaxed text-sage">
            Quick commerce is built to move mass-manufactured brands fast.
            We&apos;re built to check every brand against a published standard
            before it ever reaches your cart.
          </p>
          <p className="mt-5 font-body text-base leading-relaxed text-sage">
            Most of what&apos;s here isn&apos;t stocked anywhere else — because it
            doesn&apos;t need to compete on price. It competes on being actually
            good for you.
          </p>
          <a
            href="#standard"
            className="mt-6 inline-block rounded-chip border border-sage px-4 py-2.5 font-mono text-[13px] text-sage"
          >
            Read the full standard →
          </a>
        </div>
      </Container>
    </section>
  );
}
