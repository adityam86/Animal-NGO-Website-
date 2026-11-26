import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthError, recordAuditLog, requireAdminSession } from "@/lib/auth-server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizeCsvCell } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const ip = getClientIp(request);

    const rate = await checkDistributedRateLimit(`reports-export:${session.userId}:${ip}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many export requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const { type } = await params;
    let csvContent = "";
    let filename = "";

    if (type === "donations") {
      const donations = await prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
      });
      csvContent = "ID,Donor Name,Email,Phone,Amount,Purpose,Frequency,Status,PAN,Order ID,Payment ID,Date\n";
      for (const d of donations) {
        csvContent +=
          [
            sanitizeCsvCell(d.id),
            sanitizeCsvCell(d.donorName),
            sanitizeCsvCell(d.donorEmail),
            sanitizeCsvCell(d.donorPhone),
            sanitizeCsvCell(d.amount),
            sanitizeCsvCell(d.purpose),
            sanitizeCsvCell(d.frequency),
            sanitizeCsvCell(d.paymentStatus),
            sanitizeCsvCell(d.donorPan || ""),
            sanitizeCsvCell(d.razorpayOrderId || ""),
            sanitizeCsvCell(d.razorpayPaymentId || ""),
            sanitizeCsvCell(d.createdAt.toISOString()),
          ].join(",") + "\n";
      }
      filename = "donations_report.csv";
    } else if (type === "rescues") {
      const rescues = await prisma.rescueCase.findMany({
        orderBy: { reportedAt: "desc" },
      });
      csvContent =
        "ID,Animal Type,Emergency Level,Location,Reporter Name,Reporter Phone,Reporter Email,Assigned Team,Status,Reported At\n";
      for (const r of rescues) {
        csvContent +=
          [
            sanitizeCsvCell(r.id),
            sanitizeCsvCell(r.animalType),
            sanitizeCsvCell(r.emergencyLevel),
            sanitizeCsvCell(r.location),
            sanitizeCsvCell(r.reporterName),
            sanitizeCsvCell(r.reporterPhone),
            sanitizeCsvCell(r.reporterEmail || ""),
            sanitizeCsvCell(r.assignedTeam || ""),
            sanitizeCsvCell(r.status),
            sanitizeCsvCell(r.reportedAt.toISOString()),
          ].join(",") + "\n";
      }
      filename = "rescues_report.csv";
    } else if (type === "adoptions") {
      const adoptions = await prisma.adoptionApplication.findMany({
        orderBy: { createdAt: "desc" },
        include: { animal: { select: { name: true } } },
      });
      csvContent =
        "ID,Applicant Name,Email,Phone,Occupation,Home Type,Family Members,Has Pets,Pet Details,Target Animal,Status,Applied At\n";
      for (const a of adoptions) {
        csvContent +=
          [
            sanitizeCsvCell(a.id),
            sanitizeCsvCell(a.applicantName),
            sanitizeCsvCell(a.email),
            sanitizeCsvCell(a.phone),
            sanitizeCsvCell(a.occupation),
            sanitizeCsvCell(a.homeType),
            sanitizeCsvCell(a.familyMembers),
            sanitizeCsvCell(a.hasPets),
            sanitizeCsvCell(a.petDetails || ""),
            sanitizeCsvCell(a.animal?.name || "General"),
            sanitizeCsvCell(a.status),
            sanitizeCsvCell(a.createdAt.toISOString()),
          ].join(",") + "\n";
      }
      filename = "adoptions_report.csv";
    } else if (type === "sponsorships") {
      const sponsorships = await prisma.sponsorship.findMany({
        orderBy: { createdAt: "desc" },
        include: { animal: { select: { name: true } } },
      });
      csvContent =
        "ID,Sponsor Name,Email,Phone,Tier,Amount,Frequency,Animal,Status,Order ID,Payment ID,Created At\n";
      for (const s of sponsorships) {
        csvContent +=
          [
            sanitizeCsvCell(s.id),
            sanitizeCsvCell(s.sponsorName),
            sanitizeCsvCell(s.sponsorEmail),
            sanitizeCsvCell(s.sponsorPhone),
            sanitizeCsvCell(s.tier),
            sanitizeCsvCell(s.amount),
            sanitizeCsvCell(s.frequency),
            sanitizeCsvCell(s.animal?.name || "Sanctuary Pool"),
            sanitizeCsvCell(s.paymentStatus),
            sanitizeCsvCell(s.razorpayOrderId || ""),
            sanitizeCsvCell(s.razorpayPaymentId || ""),
            sanitizeCsvCell(s.createdAt.toISOString()),
          ].join(",") + "\n";
      }
      filename = "sponsorships_report.csv";
    } else {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: "EXPORT_CSV_REPORT",
      resource: `report:${type}`,
      details: `Exported ${filename}`,
      ipAddress: ip,
    });

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Report generation failed:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
