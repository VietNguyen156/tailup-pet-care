import { ApiError, jsonBody } from "./http";
import { readBannerForm, readBannerImage } from "./banner-upload";

export async function petInput(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    return {
      input: await jsonBody(request),
      image: null,
      removeImage: false,
    };

  const form = await readBannerForm(request);
  const data = form.get("data");
  if (typeof data !== "string")
    throw new ApiError(400, "Thiếu thông tin thú cưng.");

  const removeImageValue = form.get("removeImage");
  if (
    removeImageValue !== null &&
    removeImageValue !== "true" &&
    removeImageValue !== "false"
  )
    throw new ApiError(400, "Yêu cầu ảnh thú cưng không hợp lệ.");

  const image = await readBannerImage(form.get("image"));
  const removeImage = removeImageValue === "true";
  if (image && removeImage)
    throw new ApiError(400, "Không thể vừa thay ảnh vừa xóa ảnh.");

  return { input: JSON.parse(data), image, removeImage };
}
