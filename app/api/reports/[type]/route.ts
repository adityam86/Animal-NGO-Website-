import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        orderBy: { createdAt: "desc" }
      });
      csvContent = "ID,Donor Name,Email,Phone,Amount,Purpose,Frequency,Status,PAN,Date\n";
      donations.forEach(d => {
        csvContent += `"${d.id}","${d.donorName}","${d.donorEmail}","${d.donorPhone}",${d.amount},"${d.purpose}","${d.frequency}","${d.paymentStatus}","${d.donorPan || ""}","${d.createdAt.toISOString()}"\n`;
      });
      filename = "donations_report.csv";
    } else if (type === "rescues") {
      const rescues = await prisma.rescueCase.findMany({
        orderBy: { reportedAt: "desc" }
      });
      csvContent = "ID,Animal Type,Emergency Level,Location,Reporter Name,Reporter Phone,Assigned Team,Status,Reported At\n";
      rescues.forEach(r => {
        csvContent += `"${r.id}","${r.animalType}","${r.emergencyLevel}","${r.location}","${r.reporterName}","${r.reporterPhone}","${r.assignedTeam || ""}","${r.status}","${r.reportedAt.toISOString()}"\n`;
      });
      filename = "rescues_report.csv";
    } else if (type === "adoptions") {
      const adoptions = await prisma.adoptionApplication.findMany({
        orderBy: { createdAt: "desc" },
        include: { animal: true }
      });
      csvContent = "ID,Applicant Name,Email,Phone,Occupation,Home Type,Family Members,Has Pets,Target Animal,Status,Applied At\n";
      adoptions.forEach(a => {
        csvContent += `"${a.id}","${a.applicantName}","${a.email}","${a.phone}","${a.occupation}","${a.homeType}",${a.familyMembers},${a.hasPets},"${a.animal?.name || "General"}","${a.status}","${a.createdAt.toISOString()}"\n`;
      });
      filename = "adoptions_report.csv";
    } else {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Report generation failed:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
