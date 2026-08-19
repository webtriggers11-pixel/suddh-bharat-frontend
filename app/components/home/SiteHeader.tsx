"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV } from "../../lib/site";
import { Container } from "../ui/Container";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <Container className="flex h-[76px] items-center justify-between">
        <Link href="/#top" className="font-display text-[22px] font-semibold tracking-tight">
          SHUDDHA<span className="text-gold">.</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`font-body text-sm font-medium hover:text-forest ${
                item.muted ? "text-gray" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="rounded-chip bg-forest px-[18px] py-2.5 font-mono text-xs tracking-wide text-paper"
          >
            CART (0)
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded-chip border border-ink px-3 py-2 font-mono text-[13px] lg:hidden"
          >
            {open ? "CLOSE" : "MENU"}
          </button>
        </div>
      </Container>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="border-t border-line bg-paper lg:hidden"
      >
        <Container as="ul" className="flex flex-col">
          {NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block py-3 font-body text-base ${
                  item.muted ? "text-gray" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </Container>
      </nav>
    </header>
  );
}
