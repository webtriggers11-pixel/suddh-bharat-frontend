import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { VerificationStamp } from "./VerificationStamp";

export function Hero() {
  return (
    <Container
      as="section"
      className="grid items-center gap-12 py-14 md:grid-cols-[1.15fr_0.85fr] md:py-20"
    >
      <div>
        <Eyebrow>Verified before it&apos;s listed</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(38px,5.2vw,64px)] font-semibold leading-[1.04] tracking-tight">
          If it&apos;s on Shuddha,
          <br />
          it&apos;s already <em className="italic text-forest">been checked.</em>
        </h1>
        <p className="mt-5 max-w-md font-body text-[17px] leading-relaxed text-gray">
          India&apos;s curated marketplace for clean, verified food, baby, beauty
          and clothing brands — so you don&apos;t have to read every label
          yourself.
        </p>
        <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap">
          <Button
            href="#categories"
            variant="primary"
            className="w-full text-center sm:w-auto"
          >
            Shop the verified shelf
          </Button>
          <Button
            href="#standard"
            variant="secondary"
            className="w-full text-center sm:w-auto"
          >
            See our clean standard
          </Button>
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        {/* Soft gold aura + faint concentric rings echoing the seal motif.
            Decorative only; design-system tokens, no raw hex. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div
            className="aspect-square w-[78%] rounded-full opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, var(--color-gold-dim) 0%, transparent 70%)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="aspect-square w-[88%] rounded-full border border-line/70" />
          <div className="absolute aspect-square w-full rounded-full border border-line/40" />
        </div>
        <VerificationStamp />
      </div>
    </Container>
  );
}
