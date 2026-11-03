import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Dữ liệu JSON không hợp lệ." },
      { status: 400 },
    );
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return NextResponse.json(
        { error: "Thông tin này đã tồn tại." },
        { status: 409 },
      );
    if (error.code === "P2025")
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu." },
        { status: 404 },
      );
    if (error.code === "P2003")
      return NextResponse.json(
        { error: "Dữ liệu đang được sử dụng, không thể xóa." },
        { status: 409 },
      );
  }
  console.error(
    "API error",
    error instanceof Error ? error.message : "Unknown error",
  );
  return NextResponse.json(
    { error: "Hệ thống tạm thời chưa xử lý được. Vui lòng thử lại." },
    { status: 500 },
  );
}
export function checkOrigin(request: Request) {
  if (process.env.PREVIEW_MODE === "true")
    throw new ApiError(
      503,
      "Bản xem giao diện chưa kết nối MySQL. Hãy cấu hình DATABASE_URL để dùng chức năng này.",
    );
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.APP_URL ?? request.url).origin;
  if (!origin || origin !== expected)
    throw new ApiError(403, "Nguồn yêu cầu không hợp lệ. Kiểm tra APP_URL.");
}
export async function jsonBody(request: Request, maxBytes = 32768) {
  const body = await request.text();
  if (Buffer.byteLength(body) > maxBytes)
    throw new ApiError(413, "Dữ liệu gửi lên quá lớn.");
  return JSON.parse(body);
}
export function api(
  handler: (request: Request) => Promise<Response>,
  mutating = true,
) {
  return async (request: Request) => {
    try {
      if (mutating) checkOrigin(request);
      return await handler(request);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
