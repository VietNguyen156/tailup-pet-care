import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PetsManager } from "@/components/pets-manager";
export const metadata = { title: "Hồ sơ thú cưng" };
export default async function Page() {
  const user = await requirePageUser();
  const pets = await db.pet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <PetsManager
      pets={pets.map((p) => ({
        ...p,
        weight: p.weight?.toString() ?? null,
        birthDate: p.birthDate?.toISOString() ?? null,
        nextVaccinationAt: p.nextVaccinationAt?.toISOString() ?? null,
        nextDewormingAt: p.nextDewormingAt?.toISOString() ?? null,
      }))}
    />
  );
}
