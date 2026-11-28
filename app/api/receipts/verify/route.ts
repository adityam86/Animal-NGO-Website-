import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizePlainText } from "@/lib/security";
import { AYUDAR_LEGAL } from "@/lib/data";

export const dynamic = "force-dynamic";

function maskPersonName(name: string): string {
  const clean = name.trim();
  if (!clean) return "Supporter";
  return clean
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) return `${part[0] || "*"}*`;
      return `${part[0]}${"*".repeat(Math.min(part.length - 2, 5))}${part[part.length - 1]}`;
    })
    .join(" ");
}

function maskPan(pan: string | null | undefined): string | null {
  if (!pan || pan.length < 6) return null;
  return `${pan.slice(0, 2)}*****${pan.slice(-2)}`;
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`receipt-verify:${ip}`, 30, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many verification lookups. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawRef = sanitizePlainText(searchParams.get("ref") ?? "", 80).trim();
    if (!rawRef || rawRef.length < 4) {
      return NextResponse.json(
        { error: "Please provide a valid Donation ID, Sponsorship ID, or Razorpay Payment ID." },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { id: rawRef },
          { razorpayPaymentId: rawRef },
          { razorpayOrderId: rawRef },
        ],
      },
      select: {
        id: true,
        donorName: true,
        amount: true,
        purpose: true,
        frequency: true,
        paymentStatus: true,
        donorPan: true,
        razorpayPaymentId: true,
        createdAt: true,
      },
    });

    if (donation) {
      return NextResponse.json(
        {
          found: true,
          verified: donation.paymentStatus === "Completed",
          recordType: "Donation",
          receiptId: donation.id,
          paymentId: donation.razorpayPaymentId ?? null,
          maskedDonorName: maskPersonName(donation.donorName),
          maskedPan: maskPan(donation.donorPan),
          amount: donation.amount,
          purpose: donation.purpose,
          frequency: donation.frequency,
          paymentStatus: donation.paymentStatus,
          issuedAt: donation.createdAt.toISOString(),
          organization: {
            name: AYUDAR_LEGAL.name,
            regNo: AYUDAR_LEGAL.regNo,
            urn80G: AYUDAR_LEGAL.urn80G,
            urn80GDate: AYUDAR_LEGAL.urn80GDate,
          },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const sponsorship = await prisma.sponsorship.findFirst({
      where: {
        OR: [
          { id: rawRef },
          { razorpayPaymentId: rawRef },
          { razorpayOrderId: rawRef },
        ],
      },
      select: {
        id: true,
        sponsorName: true,
        amount: true,
        tier: true,
        frequency: true,
        paymentStatus: true,
        razorpayPaymentId: true,
        createdAt: true,
        animal: {
          select: { name: true },
        },
      },
    });

    if (sponsorship) {
      return NextResponse.json(
        {
          found: true,
          verified: sponsorship.paymentStatus === "Completed",
          recordType: "Sponsorship",
          receiptId: sponsorship.id,
          paymentId: sponsorship.razorpayPaymentId ?? null,
          maskedDonorName: maskPersonName(sponsorship.sponsorName),
          maskedPan: null,
          amount: sponsorship.amount,
          purpose: `Animal Sponsorship (${sponsorship.tier}${sponsorship.animal?.name ? ` — ${sponsorship.animal.name}` : ""})`,
          frequency: sponsorship.frequency || "Monthly",
          paymentStatus: sponsorship.paymentStatus,
          issuedAt: sponsorship.createdAt.toISOString(),
          organization: {
            name: AYUDAR_LEGAL.name,
            regNo: AYUDAR_LEGAL.regNo,
            urn80G: AYUDAR_LEGAL.urn80G,
            urn80GDate: AYUDAR_LEGAL.urn80GDate,
          },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { found: false, error: "No donation or sponsorship record matched that reference." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Receipt verification error:", error);
    return NextResponse.json({ error: "Unable to verify receipt right now." }, { status: 500 });
  }
}
