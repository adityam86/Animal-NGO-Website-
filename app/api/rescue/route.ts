import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const queryOptions: any = {
      include: {
        history: true,
      },
      orderBy: { reportedAt: 'desc' },
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const cases = await prisma.rescueCase.findMany(queryOptions);

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Failed to fetch rescue cases:", error);
    return NextResponse.json({ error: "Failed to fetch rescue cases" }, { status: 500 });
  }
}

function classifyRescue(description: string, animalType: string) {
  const desc = description.toLowerCase();
  let emergencyLevel = "Normal";
  
  const criticalKeywords = [
    "bleeding", "blood", "accident", "hit by", "car", "run over", "truck",
    "fracture", "unconscious", "dying", "broken leg", "injured badly", "poisoned"
  ];
  const highKeywords = [
    "sick", "vomiting", "limping", "wounded", "pain", "open wound", 
    "crying", "mange", "trapped", "cannot walk"
  ];

  if (criticalKeywords.some(kw => desc.includes(kw))) {
    emergencyLevel = "Critical";
  } else if (highKeywords.some(kw => desc.includes(kw))) {
    emergencyLevel = "High";
  }

  // Auto-assign team based on animal type
  let assignedTeam = "General Rescue Team 01";
  const type = animalType.toLowerCase();
  if (type === "cow" || type === "buffalo" || type === "bull") {
    assignedTeam = "Gaushala Rescue Team 02";
  } else if (type === "cat" || type === "kitten") {
    assignedTeam = "Cat Care Team 03";
  } else if (type === "bird" || type === "goat") {
    assignedTeam = "Small Animals Team 04";
  }

  return { emergencyLevel, assignedTeam };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const desc = data.description || "";
    
    // AI Auto-prioritize and assign team based on description
    const aiResult = classifyRescue(desc, data.animalType);

    const newCase = await prisma.rescueCase.create({
      data: {
        animalType: data.animalType,
        emergencyLevel: data.emergencyLevel || aiResult.emergencyLevel,
        location: data.location,
        reporterName: data.reporterName,
        reporterPhone: data.reporterPhone,
        description: desc,
        assignedTeam: aiResult.assignedTeam,
        status: "Reported",
        history: {
          create: [
            {
              status: "Reported",
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              done: true,
            },
            { status: "Assigned", done: false },
            { status: "On The Way", done: false },
            { status: "Rescued", done: false },
            { status: "Treatment", done: false },
            { status: "Closed", done: false },
          ]
        }
      },
      include: {
        history: true,
      }
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Failed to create rescue case:", error);
    return NextResponse.json({ error: "Failed to create rescue case" }, { status: 500 });
  }
}
