import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../motion/Reveal";
import { STEPS } from "./content";

export function VerificationSteps() {
  return (
    <Container as="section" id="standard" className="py-20 md:py-24">
      <SectionHeading eyebrow="Verification">
        How a brand earns the badge
      </SectionHeading>
      <ol className="mt-12 grid gap-9 md:grid-cols-3 md:gap-0">
        {STEPS.map((step, i) => (
          <Reveal as="li" key={step.n} delay={i * 0.08} className="md:pr-6">
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full bg-forest font-mono text-[13px] text-paper"
            >
              {step.n}
            </span>
            <h3 className="mt-5 font-display text-[19px] font-semibold">
              {step.title}
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-gray">
              {step.copy}
            </p>
          </Reveal>
        ))}
      </ol>
    </Container>
  );
}
