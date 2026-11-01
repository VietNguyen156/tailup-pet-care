import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { api, jsonBody } from "@/lib/http";
import { orderSchema } from "@/lib/validation";
import { createOrder } from "@/lib/orders";
export const POST = api(async (request) => {
  const user = await requireUser();
  const input = orderSchema.parse(await jsonBody(request));
  return NextResponse.json(
    { order: await createOrder(user.id, input) },
    { status: 201 },
  );
});
