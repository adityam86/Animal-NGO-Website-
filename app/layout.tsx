import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";
import PWARegister from "@/components/shared/PWARegister";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1E3A2F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.ayudarindia.com"),
  title: {
    default: "Ayudar — The voice of Animals | Animal Welfare Foundation",
    template: "%s | Ayudar Animal Welfare Foundation",
  },
  description:
    "The mission of Ayudar is to bring relief to suffering animals. Rescue, veterinary treatment, shelter, cow care & adoptions across Raniganj, Asansol & Durgapur (Reg. IV-2304-00031/2022 • 80G Tax Exempt).",
  keywords: [
    "animal rescue Raniganj",
    "animal NGO West Bengal",
    "dog adoption Asansol",
    "cow shelter Durgapur",
    "Ayudar",
    "animal welfare India",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ayudar",
  },
  openGraph: {
    siteName: "Ayudar Animal Welfare Foundation",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Pre-hydration Zero-Flicker Dark Mode Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('ayudar_theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NGO",
              name: "Ayudar Animal Welfare Foundation",
              alternateName: "Ayudar — The voice of Animals",
              description: "The mission of Ayudar is to bring relief to suffering animals.",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.ayudarindia.com",
              areaServed: ["Asansol", "Tilabad", "Kumarpur", "Raniganj", "Durgapur", "West Bengal"],
              address: {
                "@type": "PostalAddress",
                streetAddress: "Ayudar Shelter (Animal Hospital), PW3Q+5F, Tilabad, Kumarpur",
                addressLocality: "Asansol",
                addressRegion: "West Bengal",
                postalCode: "713304",
                addressCountry: "IN",
              },
              telephone: "+91-98000-00000",
              sameAs: ["https://maps.app.goo.gl/Aug8yQi2FmTVeegx7"],
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <PublicShell>{children}</PublicShell>
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
