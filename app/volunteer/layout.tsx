import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer With Ayudar",
  description:
    "Join our field rescue, feeding drive, foster care, and veterinary volunteer network in West Bengal.",
};

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
