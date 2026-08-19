import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { site } from "./lib/site";
import { AuthProvider } from "./lib/auth/AuthProvider";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
