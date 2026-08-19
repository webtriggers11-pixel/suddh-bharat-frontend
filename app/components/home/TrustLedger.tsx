import { Container } from "../ui/Container";
import { LEDGER } from "./content";

export function TrustLedger() {
  return (
    <section className="border-y border-line bg-paper-dim" aria-label="Our guarantees">
      <Container as="ul" className="grid font-mono text-[13px] sm:grid-cols-2 lg:grid-cols-4">
        {LEDGER.map((item) => (
          <li
            key={item}
            className="flex items-baseline gap-2.5 border-line py-[18px] not-first:border-t sm:[&:nth-child(2)]:border-t-0 lg:border-t-0 lg:not-first:border-l lg:pl-5"
          >
            <span aria-hidden className="font-semibold text-forest">
              ✓
            </span>
            {item}
          </li>
        ))}
      </Container>
    </section>
  );
}
