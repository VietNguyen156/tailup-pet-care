import { api, ApiError } from "@/lib/http";
import { requireStoreManager } from "@/lib/stores";
// Older clients must not overwrite a live image outside the atomic banner save.
export const POST = api(async (request) => {
  await requireStoreManager(
    new URL(request.url).searchParams.get("storeId") ?? undefined,
  );
  throw new ApiError(
    410,
    "Chức năng tải ảnh đã chuyển sang mục Quản lý banner. Vui lòng tải lại trang Admin.",
  );
});
