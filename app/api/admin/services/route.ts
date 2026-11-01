import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { api, jsonBody } from "@/lib/http";
export const PATCH = api(async (request) => {
  await requireStaff();
  const { id, ...data } = z
    .object({
      id: z.string(),
      price: z.number().int().min(1000).max(999999999),
      isActive: z.boolean(),
    })
    .parse(await jsonBody(request));
  return NextResponse.json({
    service: await db.service.update({ where: { id }, data }),
  });
});
