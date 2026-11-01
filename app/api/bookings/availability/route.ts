import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { api, ApiError } from "@/lib/http";
import { availability } from "@/lib/booking";
import { validDate, localDate } from "@/lib/validation";
export const GET = api(async (request) => {
  if (process.env.PREVIEW_MODE === "true")
    throw new ApiError(503, "Kết nối MySQL để xem lịch trống thực tế.");
  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? "",
    serviceId = params.get("serviceId") ?? "",
    staffId = params.get("staffId") || undefined;
  if (
    !validDate(date) ||
    !serviceId ||
    date < localDate() ||
    date > localDate(new Date(Date.now() + 90 * 86400000))
  )
    throw new ApiError(400, "Vui lòng chọn ngày và dịch vụ.");
  return NextResponse.json({
    slots: await availability(db, date, serviceId, staffId),
  });
}, false);
