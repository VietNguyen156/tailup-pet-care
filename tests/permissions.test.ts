import assert from "node:assert/strict";
import test from "node:test";
import {
  canManageStore,
  managementScope,
  accountHome,
} from "../lib/permissions";
import { createStoreSchema } from "../lib/store-validation";
import { registerSchema } from "../lib/validation";
const owner = { id: "owner-a", role: "STORE_ADMIN", storeId: "a" };
const customer = { id: "customer", role: "CUSTOMER", storeId: null };
const platform = { id: "platform", role: "SUPER_ADMIN", storeId: null };
test("store admin cannot manage another store, even when requested explicitly", () => {
  assert.equal(canManageStore(owner, "a"), true);
  assert.equal(canManageStore(owner, "b"), false);
  assert.equal(managementScope(owner, "b"), null);
  assert.equal(managementScope(owner), "a");
  assert.equal(managementScope({ ...owner, storeId: null }), null);
});
test("customers and legacy roles never gain management access", () => {
  for (const role of ["CUSTOMER", "STAFF", "ADMIN", "unknown"]) {
    assert.equal(
      canManageStore({ ...customer, role, storeId: "a" }, "a"),
      false,
    );
    assert.equal(
      managementScope({ ...customer, role, storeId: "a" }, "a"),
      null,
    );
  }
});
test("platform admin must select a store for store management", () => {
  assert.equal(canManageStore(platform, "b"), true);
  assert.equal(managementScope(platform), null);
  assert.equal(managementScope(platform, "b"), "b");
  assert.equal(accountHome(platform.role), "/platform");
  assert.equal(accountHome(owner.role), "/admin");
  assert.equal(accountHome(customer.role), "/dashboard");
});
test("public registration cannot assign a role or store", () => {
  const result = registerSchema.parse({
    name: "Test User",
    email: "test@example.com",
    phone: "0901234567",
    password: "longpassword123",
    role: "SUPER_ADMIN",
    storeId: "a",
  });
  assert.equal("role" in result, false);
  assert.equal("storeId" in result, false);
});
test("store creation rejects ambiguous paths and weak admin credentials", () => {
  const valid = {
    name: "Store A",
    slug: "store-a",
    description: "",
    address: "Test address",
    phone: "0901234567",
    adminName: "Store Owner",
    adminEmail: "OWNER@example.com",
    adminPassword: "strongpassword123",
  };
  assert.equal(createStoreSchema.parse(valid).adminEmail, "owner@example.com");
  for (const slug of ["../admin", "store/a", "A B", "store?x=1"])
    assert.equal(
      createStoreSchema.safeParse({ ...valid, slug }).success,
      false,
    );
  assert.equal(
    createStoreSchema.safeParse({ ...valid, adminPassword: "short" }).success,
    false,
  );
});
