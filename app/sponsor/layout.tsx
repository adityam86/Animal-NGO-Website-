import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor an Animal or Gaushala Cow",
  description:
    "Sponsor monthly food, vaccinations, and medical care for a rescued dog, cat, or cow at Ayudar.",
};

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
