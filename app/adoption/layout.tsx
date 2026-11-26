import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adopt a Rescued Animal",
  description:
    "Submit an adoption application to give a vaccinated, sterilized companion from Ayudar a loving forever home.",
};

export default function AdoptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
