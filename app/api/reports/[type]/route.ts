import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    let csvContent = "";
    let filename = "";

    if (type === "donations") {
      const donations = await prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
      });
      csvContent = "ID,Donor Name,Email,Phone,Amount,Purpose,Frequency,Status,PAN,Date\n";
      donations.forEach((d) => {
        csvContent += [
          csvCell(d.id),
          csvCell(d.donorName),
          csvCell(d.donorEmail),
          csvCell(d.donorPhone),
          d.amount,
          csvCell(d.purpose),
          csvCell(d.frequency),
          csvCell(d.paymentStatus),
          csvCell(d.donorPan || ""),
          csvCell(d.createdAt.toISOString()),
        ].join(",") + "\n";
      });
      filename = "donations_report.csv";
    } else if (type === "rescues") {
      const rescues = await prisma.rescueCase.findMany({
        orderBy: { reportedAt: "desc" },
      });
      csvContent = "ID,Animal Type,Emergency Level,Location,Reporter Name,Reporter Phone,Assigned Team,Status,Reported At\n";
      rescues.forEach((r) => {
        csvContent += [
          csvCell(r.id),
          csvCell(r.animalType),
          csvCell(r.emergencyLevel),
          csvCell(r.location),
          csvCell(r.reporterName),
          csvCell(r.reporterPhone),
          csvCell(r.assignedTeam || ""),
          csvCell(r.status),
          csvCell(r.reportedAt.toISOString()),
        ].join(",") + "\n";
      });
      filename = "rescues_report.csv";
    } else if (type === "adoptions") {
      const adoptions = await prisma.adoptionApplication.findMany({
        orderBy: { createdAt: "desc" },
        include: { animal: true },
      });
      csvContent = "ID,Applicant Name,Email,Phone,Occupation,Home Type,Family Members,Has Pets,Target Animal,Status,Applied At\n";
      adoptions.forEach((a) => {
        csvContent += [
          csvCell(a.id),
          csvCell(a.applicantName),
          csvCell(a.email),
          csvCell(a.phone),
          csvCell(a.occupation),
          csvCell(a.homeType),
          a.familyMembers,
          a.hasPets,
          csvCell(a.animal?.name || "General"),
          csvCell(a.status),
          csvCell(a.createdAt.toISOString()),
        ].join(",") + "\n";
      });
      filename = "adoptions_report.csv";
    } else {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Report generation failed:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
