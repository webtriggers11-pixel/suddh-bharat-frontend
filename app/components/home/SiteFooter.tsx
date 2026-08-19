import { Container } from "../ui/Container";

const COLUMNS: { heading: string; links: string[] }[] = [
  { heading: "Shop", links: ["Food & Pantry", "Baby", "Beauty", "Clothing"] },
  { heading: "Shuddha", links: ["Our Standard", "Sell on Shuddha", "FAQ", "Contact"] },
  { heading: "Follow", links: ["Instagram", "Terms", "Privacy"] },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <Container className="grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold">SHUDDHA</p>
          <p className="mt-2.5 max-w-60 font-body text-[13px] text-gray">
            A trust layer for how India shops — starting with the people who care
            most about what&apos;s in it.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="font-mono text-xs uppercase tracking-wider text-gray">
              {col.heading}
            </h2>
            <ul className="mt-3.5 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-ink hover:text-forest">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
    </footer>
  );
}
