import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate (80G Tax-Exempt Care Fund)",
  description:
    "Support 24/7 animal emergency ambulance dispatch, veterinary surgeries, and daily shelter meals with verified Razorpay payments and 80G tax receipts.",
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
