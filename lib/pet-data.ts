import { z } from "zod";
import { petSchema } from "./validation";
export function petData(input: z.infer<typeof petSchema>) {
  const toDate = (date?: string) =>
    date ? new Date(`${date}T00:00:00Z`) : null;
  return {
    name: input.name,
    type: input.type,
    breed: input.breed || null,
    weight: input.weight ? Number(input.weight) : null,
    birthDate: toDate(input.birthDate),
    vaccinationHistory: input.vaccinationHistory || null,
    nextVaccinationAt: toDate(input.nextVaccinationAt),
    nextDewormingAt: toDate(input.nextDewormingAt),
  };
}
