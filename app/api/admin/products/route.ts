import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { api, jsonBody } from "@/lib/http";
export const PATCH = api(async (request) => {
  await requireStaff();
  const input = z
    .object({
      id: z.string(),
      stock: z.number().int().min(0).max(100000),
      price: z.number().int().min(1000).max(999999999),
      isActive: z.boolean(),
    })
    .parse(await jsonBody(request));
  const { id, ...data } = input;
  return NextResponse.json({
    product: await db.product.update({ where: { id }, data }),
  });
});
