import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { Button } from "../ui/Button";
import { STATS } from "./content";

/** Dark brand-facing hero for the vendor page: pitch + stat cards. */
export function VendorHero() {
  return (
    <section className="bg-forest text-paper">
      <Container className="grid items-end gap-12 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-[76px]">
        <div>
          <Eyebrow>For brands</Eyebrow>
          <h1 className="mt-4 font-display text-[clamp(32px,4.6vw,52px)] font-semibold leading-tight">
            You made it clean.
            <br />
            We&apos;ll help people find it.
          </h1>
          <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-sage">
            If you&apos;ve built a genuinely clean brand, you already know the
            problem: the shoppers who&apos;d love you can&apos;t find you, and the
            platforms that could get you in front of them don&apos;t care what&apos;s
            in your product. Shuddha is built for exactly one kind of brand — yours.
          </p>
          <Button href="#apply" variant="gold" className="mt-8">
            Apply to sell on Shuddha
          </Button>
        </div>
        <ul className="flex flex-col gap-5">
          {STATS.map((stat) => (
            <li
              key={stat.label}
              className="rounded-card border border-sage/30 bg-forest-light p-7"
            >
              <p className="font-display text-4xl font-semibold text-gold">{stat.value}</p>
              <p className="mt-1.5 font-mono text-xs tracking-wide text-sage">{stat.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
