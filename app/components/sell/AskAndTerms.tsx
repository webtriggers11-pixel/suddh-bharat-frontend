import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { ASKS, TERMS } from "./content";

/** Two-column "what we ask" ledger list + transparent terms table. */
export function AskAndTerms() {
  return (
    <Container as="section" className="border-t border-line py-20 md:py-24">
      <div className="grid gap-16 md:grid-cols-2">
        <div>
          <Eyebrow>What we ask</Eyebrow>
          <h2 className="mt-3.5 mb-6 font-display text-[clamp(26px,3.2vw,36px)] font-semibold leading-tight">
            A short, honest bar to clear
          </h2>
          <ol className="max-w-xl">
            {ASKS.map((ask, i) => (
              <li
                key={ask}
                className="flex gap-4 border-t border-line py-[18px] font-body text-[15px] leading-relaxed last:border-b"
              >
                <span className="shrink-0 font-mono text-[13px] text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {ask}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <Eyebrow>Terms</Eyebrow>
          <h2 className="mt-3.5 mb-6 font-display text-[clamp(26px,3.2vw,36px)] font-semibold leading-tight">
            Simple, transparent terms
          </h2>
          <table className="w-full max-w-xl border-collapse">
            <tbody>
              {TERMS.map((term) => (
                <tr key={term.label} className="border-t border-line last:border-b">
                  <td className="py-4 font-mono text-[12.5px] uppercase tracking-wide text-gray">
                    {term.label}
                  </td>
                  <td className="py-4 text-right font-body text-[14.5px] font-semibold">
                    {term.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
