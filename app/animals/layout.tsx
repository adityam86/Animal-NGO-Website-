import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rescued Animals Gallery & Adoption",
  description:
    "Browse vaccinated, sterilized dogs, cats, and cows rescued by Ayudar Animal Welfare Foundation.",
};

export default function AnimalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
