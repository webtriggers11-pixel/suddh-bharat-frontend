import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { site } from "./lib/site";
import { QueryProvider } from "./lib/query/QueryProvider";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { GuestMerge } from "./lib/guest/GuestMerge";
import { BottomTabBar } from "./components/home/BottomTabBar";
import "./globals.css";

// Brand fonts (business/design-system.md): Fraunces display, Inter body, IBM Plex Mono.
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Shuddha", template: "%s · Shuddha" },
  description: site.description,
  applicationName: "Shuddha",
  appleWebApp: { capable: true, title: "Shuddha", statusBarStyle: "default" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1b3a2f", // --forest
  // Lets the header read env(safe-area-inset-*) in standalone PWA display
  // (notch/status-bar area) instead of it always resolving to 0.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      {/* The var() fallback below is 0px, not a guessed bar height — the real
          value always comes from :root's --bottom-tab-bar-height default
          (globals.css) plus BottomTabBar's own measurement; a fallback here
          can only matter if that declaration is ever removed. */}
      <body className="min-h-full flex flex-col bg-paper text-ink pb-[var(--bottom-tab-bar-height,0px)] md:pb-0">
        <QueryProvider>
          <AuthProvider>
            <GuestMerge />
            {children}
            <BottomTabBar />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
