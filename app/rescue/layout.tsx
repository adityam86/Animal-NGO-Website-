import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report an Animal Emergency (24/7 Rescue)",
  description:
    "Report an injured, sick, or stranded animal in Raniganj, Asansol & Durgapur. Dispatch Ayudar's 24/7 emergency rescue ambulance with live GPS and photo upload.",
};

export default function RescueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
