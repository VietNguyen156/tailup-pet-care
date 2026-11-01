import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { api } from "@/lib/http";
export const POST = api(async () => {
  await destroySession();
  return NextResponse.json({ success: true });
});
