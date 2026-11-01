import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { api, jsonBody } from "@/lib/http";
import { z } from "zod";
export const PATCH = api(async (request) => {
  const user = await requireUser();
  const data = z
    .object({
      name: z.string().trim().min(2).max(100),
      phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ."),
    })
    .parse(await jsonBody(request));
  await db.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ success: true });
});
