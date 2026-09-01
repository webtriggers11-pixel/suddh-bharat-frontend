import Link from "next/link";
import { Container } from "../ui/Container";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Food & Pantry", href: "#" },
      { label: "Baby", href: "#" },
      { label: "Beauty", href: "#" },
      { label: "Clothing", href: "#" },
    ],
  },
  {
    heading: "Shuddha",
    links: [
      { label: "Our Standard", href: "/our-standard" },
      { label: "Journal", href: "/journal" },
      { label: "Sell on Shuddha", href: "/sell" },
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Follow",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
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
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ink hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
    </footer>
  );
}
