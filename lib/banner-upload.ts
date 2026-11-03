import { ApiError } from "./http";
import { MAX_BANNER_BYTES } from "./banner-validation";

// Shared bounded reader for uploads; never buffer an unbounded request body.
export async function readBannerForm(request: Request) {
  const max = MAX_BANNER_BYTES + 32 * 1024;
  if (Number(request.headers.get("content-length")) > max)
    throw new ApiError(413, "Ảnh tối đa 2 MB.");
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    throw new ApiError(400, "Dữ liệu tải ảnh không hợp lệ.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Vui lòng gửi thông tin banner.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        await reader.cancel();
        throw new ApiError(413, "Ảnh tối đa 2 MB.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
  } catch {
    throw new ApiError(400, "Dữ liệu tải ảnh không hợp lệ.");
  }
}
export async function readBannerImage(file: FormDataEntryValue | null) {
  if (file === null) return null;
  if (typeof file === "string" || !file.size)
    throw new ApiError(400, "Vui lòng chọn ảnh hợp lệ.");
  if (file.size > MAX_BANNER_BYTES) throw new ApiError(413, "Ảnh tối đa 2 MB.");
  const data = Buffer.from(await file.arrayBuffer());
  const contentType = data
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? "image/png"
    : data[0] === 255 && data[1] === 216 && data[2] === 255
      ? "image/jpeg"
      : data.toString("ascii", 0, 4) === "RIFF" &&
          data.toString("ascii", 8, 12) === "WEBP"
        ? "image/webp"
        : null;
  if (!contentType || file.type !== contentType)
    throw new ApiError(400, "Chỉ nhận ảnh JPG, PNG hoặc WebP đúng định dạng.");
  return { data, contentType };
}
