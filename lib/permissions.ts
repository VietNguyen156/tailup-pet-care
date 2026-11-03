// Shared authorization rules. Never accept the actor's role/store from a request body.
export type Actor = { id: string; role: string; storeId: string | null };
export function canManageStore(actor: Actor, storeId: string) {
  return (
    actor.role === "SUPER_ADMIN" ||
    (actor.role === "STORE_ADMIN" &&
      actor.storeId !== null &&
      actor.storeId === storeId)
  );
}
export function managementScope(actor: Actor, requestedStoreId?: string) {
  if (actor.role === "SUPER_ADMIN") return requestedStoreId || null;
  if (actor.role !== "STORE_ADMIN" || !actor.storeId) return null;
  if (requestedStoreId && requestedStoreId !== actor.storeId) return null;
  return actor.storeId;
}
export function accountHome(role: string) {
  return role === "SUPER_ADMIN"
    ? "/platform"
    : role === "STORE_ADMIN"
      ? "/admin"
      : "/dashboard";
}
