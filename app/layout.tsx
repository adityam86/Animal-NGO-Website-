import type { Metadata, Viewport } from "next";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";
import PWARegister from "@/components/shared/PWARegister";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Ayudar Animal Welfare Foundation | Raniganj",
    template: "%s | Ayudar Animal Welfare Foundation",
  },
  description:
    "Ayudar Animal Welfare Foundation — rescuing, treating, sheltering, and rehoming animals across Raniganj, Asansol & Durgapur. Report an injured animal, adopt a pet, or donate today.",
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
    <html lang="en" suppressHydrationWarning>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
