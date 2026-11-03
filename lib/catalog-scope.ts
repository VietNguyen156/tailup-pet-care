import "server-only";
import { currentUser } from "./auth";

export async function catalogStoreId(requested?: string) {
  const user = await currentUser();
  if (user?.role !== "STORE_ADMIN") return requested;
  if (!user.storeId || (requested && requested !== user.storeId)) return "";
  return user.storeId;
}
