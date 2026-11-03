/** HTTP integration checks against a separately migrated *_test database and dev server.
 * node --env-file=.env.tenant-test --import tsx scripts/tenant-integration.ts
 * Requires the server to use that same test database (scripts/dev-tenant-test.mjs).
 */
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  !new URL(url).pathname.endsWith("_test") ||
  url !== process.env.DATABASE_URL
)
  throw new Error("Dedicated test database required");
const base = process.env.APP_URL ?? "http://127.0.0.1:3005";
if (new URL(base).hostname !== "127.0.0.1")
  throw new Error("Local test server required");
const db = new PrismaClient();
const prefix = `tenant-${randomBytes(5).toString("hex")}`;
const storeIds: string[] = [];
const userIds: string[] = [];
const password = randomBytes(18).toString("hex");
async function session(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      userId,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  return `pawly_session=${token}`;
}
async function call(
  path: string,
  cookie: string,
  method: string,
  body?: unknown,
  expected = 200,
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      Cookie: cookie,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const text = await response.text();
  if (
    method === "GET" &&
    !path.startsWith("/api/") &&
    (expected === 404 || expected === 307) &&
    response.status === 200
  ) {
    assert.ok(
      text.includes(
        expected === 404 ? "NEXT_HTTP_ERROR_FALLBACK;404" : "NEXT_REDIRECT",
      ),
      "Streamed response must contain the expected denial/redirect",
    );
  } else
    assert.equal(
      response.status,
      expected,
      `${method} ${path}: ${text.slice(0, 350)}`,
    );
  return text.startsWith("{") ? JSON.parse(text) : text;
}
async function main() {
  const legacyAdmin = await db.user.findUnique({
    where: { id: "legacy-super" },
  });
  if (legacyAdmin) {
    assert.equal(legacyAdmin.role, "SUPER_ADMIN");
    const legacyOwner = await db.user.findUniqueOrThrow({
      where: { id: "legacy-owner" },
    });
    assert.equal(legacyOwner.role, "STORE_ADMIN");
    assert.equal(legacyOwner.storeId, "store-tailup");
    const legacyProduct = await db.product.findUniqueOrThrow({
      where: { id: "legacy-product" },
    });
    assert.equal(legacyProduct.storeId, "store-tailup");
    assert.equal(legacyProduct.stock, 7);
    assert.equal(
      (await db.service.findUniqueOrThrow({ where: { id: "legacy-service" } }))
        .storeId,
      "store-tailup",
    );
    assert.equal(
      (
        await db.appointmentSlot.findUniqueOrThrow({
          where: { id: "legacy-slot" },
        })
      ).storeId,
      "store-tailup",
    );
    console.log("PASS legacy roles and catalog preserved by migration");
  }
  const superUser = await db.user.create({
    data: {
      name: "Integration Super",
      email: `${prefix}-super@example.invalid`,
      passwordHash: await hashPassword(password),
      role: "SUPER_ADMIN",
    },
  });
  userIds.push(superUser.id);
  const superCookie = await session(superUser.id);
  await call("/api/auth/login", "", "POST", {
    email: superUser.email,
    password,
  });
  await call("/api/platform/stores", "", "POST", {}, 401);
  for (const suffix of ["a", "b"]) {
    const result = await call(
      "/api/platform/stores",
      superCookie,
      "POST",
      {
        name: `${prefix}-${suffix}`,
        slug: `${prefix}-${suffix}`,
        description: "Integration store",
        address: "Test address only",
        phone: "0901234567",
        adminName: `Owner ${suffix}`,
        adminEmail: `${prefix}-${suffix}@example.invalid`,
        adminPassword: password,
        withSampleCatalog: suffix === "b",
      },
      201,
    );
    storeIds.push(result.store.id);
    const owner = await db.user.findUniqueOrThrow({
      where: { email: `${prefix}-${suffix}@example.invalid` },
    });
    userIds.push(owner.id);
    assert.equal(owner.storeId, result.store.id);
    assert.equal(owner.role, "STORE_ADMIN");
  }
  const [storeA, storeB] = storeIds;
  const ownerA = await session(userIds[1]),
    ownerB = await session(userIds[2]);
  assert.ok((await db.product.count({ where: { storeId: storeB } })) > 0);
  assert.equal(await db.product.count({ where: { storeId: storeA } }), 0);
  await call("/api/auth/login", "", "POST", {
    email: `${prefix}-a@example.invalid`,
    password,
  });
  await call(
    "/api/platform/stores",
    ownerA,
    "PATCH",
    { id: storeB, isActive: false },
    403,
  );
  await call("/api/platform/stores", ownerA, "POST", {}, 403);
  const beforeCount = await db.store.count();
  await call(
    "/api/platform/stores",
    superCookie,
    "POST",
    {
      name: "Collision",
      slug: `${prefix}-collision`,
      description: "",
      address: "Test address only",
      phone: "0901234567",
      adminName: "Collision",
      adminEmail: `${prefix}-a@example.invalid`,
      adminPassword: password,
    },
    409,
  );
  assert.equal(await db.store.count(), beforeCount);
  console.log(
    "PASS platform-only provisioning, unique owner email and atomic rollback",
  );
  for (const suffix of ["one", "two"]) {
    const result = await call(
      "/api/auth/register",
      "",
      "POST",
      {
        name: `Customer ${suffix}`,
        email: `${prefix}-${suffix}@example.invalid`,
        phone: "0901234567",
        password,
        role: "SUPER_ADMIN",
        storeId: storeA,
      },
      201,
    );
    userIds.push(result.user.id);
    const customer = await db.user.findUniqueOrThrow({
      where: { id: result.user.id },
    });
    assert.equal(customer.role, "CUSTOMER");
    assert.equal(customer.storeId, null);
  }
  const customerCookie = await session(userIds[3]),
    otherCookie = await session(userIds[4]);
  await call("/api/platform/stores", customerCookie, "POST", {}, 403);
  const productBody = {
    name: `${prefix}-product`,
    category: "Test",
    description: "Test product description",
    price: 12000,
    stock: 10,
    imageUrl: "https://example.com/product.jpg",
  };
  const serviceBody = {
    name: `${prefix}-service`,
    category: "Test",
    description: "Test service description",
    price: 100000,
    durationMinutes: 60,
    process: "Wash\nDry",
  };
  const { product: productA } = await call(
    "/api/admin/products",
    ownerA,
    "POST",
    { ...productBody, name: `${prefix}-private-a`, storeId: storeA },
    201,
  );
  const { product: productB } = await call(
    "/api/admin/products",
    ownerB,
    "POST",
    { ...productBody, name: `${prefix}-private-b`, storeId: storeB },
    201,
  );
  const { service: serviceA } = await call(
    "/api/admin/services",
    ownerA,
    "POST",
    { ...serviceBody, storeId: storeA },
    201,
  );
  const { service: serviceB } = await call(
    "/api/admin/services",
    ownerB,
    "POST",
    { ...serviceBody, name: `${prefix}-service-b`, storeId: storeB },
    201,
  );
  await call(
    "/api/admin/products",
    ownerA,
    "POST",
    { ...productBody, storeId: storeB },
    403,
  );
  await call(
    "/api/admin/services",
    ownerA,
    "POST",
    { ...serviceBody, storeId: storeB },
    403,
  );
  await call(
    "/api/admin/products",
    customerCookie,
    "POST",
    { ...productBody, storeId: storeA },
    403,
  );
  await call(
    "/api/admin/products",
    ownerA,
    "PATCH",
    { id: productB.id, price: 5000, stock: 0, isActive: false },
    403,
  );
  await call(
    "/api/admin/services",
    ownerA,
    "PATCH",
    { id: serviceB.id, price: 5000, isActive: false },
    403,
  );
  await call("/api/admin/products", ownerA, "PATCH", {
    id: productA.id,
    price: 12000,
    stock: 10,
    isActive: true,
  });
  await call(
    "/api/admin/store",
    ownerA,
    "PATCH",
    {
      storeId: storeB,
      name: "Hijack",
      description: "",
      address: "Test address only",
      phone: "0901234567",
    },
    403,
  );
  for (const path of ["/shop", "/services", "/"]) {
    const html = await call(path, ownerA, "GET");
    assert.ok(!html.includes(productB.name));
    assert.ok(!html.includes(serviceB.name));
  }
  assert.ok((await call("/shop", ownerA, "GET")).includes(productA.name));
  assert.ok((await call("/services", ownerA, "GET")).includes(serviceA.name));
  await call("/shop/" + productB.slug, ownerA, "GET", undefined, 404);
  await call("/services/" + serviceB.slug, ownerA, "GET", undefined, 404);
  const foreignStore = await db.store.findUniqueOrThrow({
    where: { id: storeB },
  });
  await call("/stores/" + foreignStore.slug, ownerA, "GET", undefined, 404);
  await call(
    "/booking?store=" + foreignStore.slug,
    ownerA,
    "GET",
    undefined,
    404,
  );
  for (const [kind, item] of [
    ["products", productB],
    ["services", serviceB],
  ] as const) {
    await call("/api/admin/" + kind, ownerA, "DELETE", { id: item.id }, 403);
    await call(
      "/api/admin/" + kind,
      customerCookie,
      "DELETE",
      { id: item.id },
      403,
    );
  }
  console.log("PASS owner public catalog and direct foreign URLs isolated");
  const adminA = await call("/admin", ownerA, "GET");
  assert.ok(adminA.includes(`${prefix}-private-a`));
  assert.ok(!adminA.includes(`${prefix}-private-b`));
  const denied = await call(
    `/admin?store=${storeB}`,
    ownerA,
    "GET",
    undefined,
    404,
  );
  assert.ok(!denied.includes(`${prefix}-private-b`));
  await call("/platform", ownerA, "GET", undefined, 307);
  const platformPage = await call("/platform", superCookie, "GET");
  assert.ok(platformPage.includes(`${prefix}-a`));
  assert.ok(platformPage.includes(`${prefix}-b`));
  await call(`/admin?store=${storeB}`, superCookie, "GET");
  const publicA = await call(`/stores/${prefix}-a`, "", "GET");
  assert.ok(publicA.includes(productA.name));
  assert.ok(!publicA.includes(productB.name));
  assert.ok(!publicA.includes(`${prefix}-a@example.invalid`));
  console.log(
    "PASS store-scoped admin, public storefront and resource writes; super admin sees both stores",
  );
  const date = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);
  const petIds: string[] = [];
  for (let i = 0; i < 4; i++)
    petIds.push(
      (
        await db.pet.create({
          data: { name: `Pet ${i}`, type: "DOG", userId: userIds[3] },
        })
      ).id,
    );
  const booking = {
    serviceId: serviceA.id,
    petId: petIds[0],
    bookingDate: date,
    timeSlot: "09:00",
  };
  await call(
    "/api/bookings",
    customerCookie,
    "POST",
    { ...booking, staffId: userIds[2] },
    400,
  );
  await call(
    `/api/bookings/availability?date=${date}&serviceId=${serviceA.id}&staffId=${userIds[2]}`,
    "",
    "GET",
    undefined,
    400,
  );
  for (let i = 0; i < 3; i++)
    await call(
      "/api/bookings",
      customerCookie,
      "POST",
      { ...booking, petId: petIds[i], storeId: storeB },
      201,
    );
  const { booking: bookingB } = await call(
    "/api/bookings",
    customerCookie,
    "POST",
    { ...booking, serviceId: serviceB.id, petId: petIds[3] },
    201,
  );
  assert.equal(bookingB.storeId, storeB);
  assert.equal(await db.booking.count({ where: { storeId: storeA } }), 3);
  await call(
    `/api/bookings/${bookingB.id}`,
    ownerA,
    "PATCH",
    { status: "CONFIRMED" },
    403,
  );
  await call(
    `/api/bookings/${bookingB.id}`,
    otherCookie,
    "PATCH",
    { status: "CANCELLED" },
    403,
  );
  await call(`/api/bookings/${bookingB.id}`, ownerB, "PATCH", {
    status: "CONFIRMED",
  });
  const owned = await call("/api/bookings", customerCookie, "GET");
  assert.equal(owned.bookings.length, 4);
  const others = await call("/api/bookings", otherCookie, "GET");
  assert.equal(others.bookings.length, 0);
  await call(`/api/bookings/${bookingB.id}`, customerCookie, "PATCH", {
    status: "CANCELLED",
  });
  console.log(
    "PASS independent capacity per store, forged store/staff rejected, shared customer account and private history",
  );
  const orderBody = {
    recipientName: "Test Customer",
    phone: "0901234567",
    address: "Test address only",
    paymentMethod: "COD",
  };
  await call(
    "/api/orders",
    customerCookie,
    "POST",
    {
      ...orderBody,
      items: [
        { productId: productA.id, quantity: 1 },
        { productId: productB.id, quantity: 1 },
      ],
    },
    400,
  );
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: productA.id } })).stock,
    10,
  );
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: productB.id } })).stock,
    10,
  );
  const { order } = await call(
    "/api/orders",
    customerCookie,
    "POST",
    {
      ...orderBody,
      storeId: storeA,
      items: [{ productId: productB.id, quantity: 1 }],
    },
    201,
  );
  assert.equal(order.storeId, storeB);
  await call(
    `/api/orders/${order.id}`,
    ownerA,
    "PATCH",
    { status: "PROCESSING" },
    403,
  );
  await call(
    `/api/orders/${order.id}`,
    otherCookie,
    "PATCH",
    { status: "CANCELLED" },
    403,
  );
  await call(`/api/orders/${order.id}`, ownerB, "PATCH", {
    status: "PROCESSING",
  });
  await call(`/api/orders/${order.id}`, ownerB, "PATCH", { status: "SHIPPED" });
  await call(`/api/orders/${order.id}`, ownerB, "PATCH", {
    status: "COMPLETED",
  });
  console.log(
    "PASS order store derived server-side, mixed-store order rolls back stock, foreign mutations denied",
  );
  await call("/api/platform/stores", superCookie, "PATCH", {
    id: storeB,
    isActive: false,
  });
  await call(`/stores/${prefix}-b`, "", "GET", undefined, 404);
  await call(
    "/api/admin/products",
    ownerB,
    "PATCH",
    { id: productB.id, price: 12000, stock: 10, isActive: true },
    403,
  );
  await call(
    "/api/orders",
    customerCookie,
    "POST",
    { ...orderBody, items: [{ productId: productB.id, quantity: 1 }] },
    400,
  );
  await call(
    "/api/bookings",
    customerCookie,
    "POST",
    { ...booking, serviceId: serviceB.id, timeSlot: "14:00" },
    404,
  );
  await call("/api/platform/stores", superCookie, "PATCH", {
    id: storeB,
    isActive: true,
  });
  console.log(
    "PASS suspended store blocks new transactions and owner writes; platform can restore",
  );
  await call(
    "/api/orders",
    otherCookie,
    "POST",
    { ...orderBody, items: [{ productId: productB.id, quantity: 1 }] },
    201,
  );
  const restrictedCustomers = await call("/admin", ownerA, "GET");
  assert.ok(!restrictedCustomers.includes(`${prefix}-two@example.invalid`));
  const ownCustomers = await call("/admin", ownerB, "GET");
  assert.ok(ownCustomers.includes(`${prefix}-two@example.invalid`));
  const extraAdmin = {
    storeId: storeA,
    name: "Additional owner",
    email: `${prefix}-extra@example.invalid`,
    password,
  };
  await call("/api/platform/store-admins", ownerA, "POST", extraAdmin, 403);
  const added = await call(
    "/api/platform/store-admins",
    superCookie,
    "POST",
    extraAdmin,
    201,
  );
  userIds.push(added.admin.id);
  assert.equal(added.admin.storeId, storeA);
  assert.equal("passwordHash" in added.admin, false);
  console.log(
    "PASS customer list scoped by transactions; only platform may issue additional owner accounts",
  );
  await call("/api/admin/products", ownerB, "PATCH", {
    id: productB.id,
    name: productB.name + "-edited",
    description: "Edited product description",
    category: "Edited",
    imageUrl: "https://example.com/new.jpg",
  });
  const edited = await db.product.findUniqueOrThrow({
    where: { id: productB.id },
    include: { images: true },
  });
  assert.equal(edited.images[0].url, "https://example.com/new.jpg");
  await call("/api/admin/services", ownerB, "PATCH", {
    id: serviceB.id,
    name: serviceB.name + "-edited",
    description: "Edited service description",
    category: "Edited",
    durationMinutes: 90,
    process: "New step one\nNew step two",
  });
  assert.equal(
    (await db.service.findUniqueOrThrow({ where: { id: serviceB.id } }))
      .durationMinutes,
    90,
  );
  const templateA = await db.service.findFirstOrThrow({
    where: { storeId: storeA, id: { not: serviceA.id } },
  });
  const templateB = await db.service.findFirstOrThrow({
    where: { storeId: storeB, name: templateA.name },
  });
  await call("/api/admin/services", ownerA, "DELETE", { id: templateA.id });
  assert.equal(
    (await db.service.findUniqueOrThrow({ where: { id: templateB.id } }))
      .deletedAt,
    null,
  );
  for (const [kind, item] of [
    ["products", productB],
    ["services", serviceB],
  ] as const) {
    await call("/api/admin/" + kind, ownerB, "DELETE", { id: item.id });
    await call(
      "/api/admin/" + kind,
      ownerB,
      "PATCH",
      { id: item.id, isActive: true },
      404,
    );
  }
  assert.ok(await db.order.findUnique({ where: { id: order.id } }));
  assert.ok(await db.booking.findUnique({ where: { id: bookingB.id } }));
  assert.ok(
    !(await call("/admin", ownerB, "GET")).includes(productB.name + "-edited"),
  );
  await call("/shop/" + productB.slug, customerCookie, "GET", undefined, 404);
  await call(
    "/services/" + serviceB.slug,
    customerCookie,
    "GET",
    undefined,
    404,
  );
  await call(
    "/api/orders",
    customerCookie,
    "POST",
    { ...orderBody, items: [{ productId: productB.id, quantity: 1 }] },
    400,
  );
  await call(
    "/api/bookings",
    customerCookie,
    "POST",
    { ...booking, serviceId: serviceB.id, timeSlot: "14:00" },
    404,
  );
  console.log(
    "PASS full editing, independent templates, deletion preserves history and blocks new purchases",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.review.deleteMany({ where: { userId: { in: userIds } } });
    await db.orderItem.deleteMany({
      where: { order: { storeId: { in: storeIds } } },
    });
    await db.order.deleteMany({ where: { storeId: { in: storeIds } } });
    await db.booking.deleteMany({ where: { storeId: { in: storeIds } } });
    await db.appointmentSlot.deleteMany({
      where: { storeId: { in: storeIds } },
    });
    await db.pet.deleteMany({ where: { userId: { in: userIds } } });
    await db.product.deleteMany({ where: { storeId: { in: storeIds } } });
    await db.service.deleteMany({ where: { storeId: { in: storeIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.store.deleteMany({ where: { id: { in: storeIds } } });
    await db.$disconnect();
  });
