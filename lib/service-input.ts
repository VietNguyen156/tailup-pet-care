import { jsonBody, ApiError } from "./http";
import { readBannerForm, readBannerImage } from "./banner-upload";

export async function serviceInput(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    return { input: await jsonBody(request), image: null };
  const form = await readBannerForm(request);
  const data = form.get("data");
  if (typeof data !== "string")
    throw new ApiError(400, "Thiếu thông tin dịch vụ.");
  return {
    input: JSON.parse(data),
    image: await readBannerImage(form.get("image")),
  };
}
