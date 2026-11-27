import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAnimalForm from "@/components/admin/EditAnimalForm";

export default async function AdminEditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animal = await prisma.animal.findUnique({ where: { id } });

  if (!animal) {
    notFound();
  }

  return (
    <EditAnimalForm
      animal={{
        id: animal.id,
        name: animal.name,
        type: animal.type,
        breed: animal.breed,
        gender: animal.gender,
        age: animal.age,
        color: animal.color,
        location: animal.location,
        status: animal.status,
        image: animal.image,
        vaccinated: animal.vaccinated,
        dewormed: animal.dewormed,
        sterilized: animal.sterilized,
        rescueDate: animal.rescueDate.toISOString().split("T")[0],
        shelter: animal.shelter,
        story: animal.story,
      }}
    />
  );
}
