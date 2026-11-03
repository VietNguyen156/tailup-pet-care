import "server-only";
import { currentUser, requireUser } from "./auth";
import { db } from "./db";
import { ApiError } from "./http";
import { canManageStore, managementScope } from "./permissions";
import { redirect, notFound } from "next/navigation";

export async function requirePlatformAdmin() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN")
    throw new ApiError(403, "Chỉ quản trị tổng được thực hiện thao tác này.");
  return user;
}
export async function requireStoreManager(requestedStoreId?: string) {
  const user = await requireUser();
  const storeId = managementScope(user, requestedStoreId);
  if (!storeId)
    throw new ApiError(403, "Bạn không có quyền quản trị cửa hàng này.");
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || (!store.isActive && user.role !== "SUPER_ADMIN"))
    throw new ApiError(403, "Cửa hàng không hoạt động.");
  return { user, store };
}
export async function requireResourceManager(storeId: string) {
  const user = await requireUser();
  if (!canManageStore(user, storeId))
    throw new ApiError(403, "Bạn không có quyền quản trị cửa hàng này.");
  return requireStoreManager(storeId);
}
export async function managementPage(requestedStoreId?: string) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "CUSTOMER") redirect("/dashboard");
  if (user.role === "SUPER_ADMIN" && !requestedStoreId) redirect("/platform");
  const storeId = managementScope(user, requestedStoreId);
  if (!storeId) notFound();
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) notFound();
  return { user, store };
}
