import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomBytes, createHash } from "node:crypto";
if (
  !process.env.TEST_DATABASE_URL ||
  process.env.TEST_DATABASE_URL !== process.env.DATABASE_URL ||
  !new URL(process.env.DATABASE_URL!).pathname.endsWith("_test")
)
  throw new Error("Dedicated test database required");
const base = process.env.APP_URL!;
if (new URL(base).hostname !== "127.0.0.1")
  throw new Error("Local server required");
const db = new PrismaClient(),
  prefix = `gallery-${randomBytes(5).toString("hex")}`,
  users: string[] = [],
  stores: string[] = [];
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=",
  "base64",
);
async function actor(
  role: "STORE_ADMIN" | "CUSTOMER" | "SUPER_ADMIN",
  storeId?: string,
) {
  const user = await db.user.create({
    data: {
      name: prefix,
      email: `${prefix}-${users.length}@example.invalid`,
      passwordHash: "not-a-login-password",
      role,
      storeId,
    },
  });
  users.push(user.id);
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      userId: user.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  return `pawly_session=${token}`;
}
const endpoint = (storeId: string) => `/api/admin/gallery?storeId=${storeId}`;
async function call(
  url: string,
  cookie: string,
  method = "GET",
  body?: unknown,
  status = 200,
) {
  const response = await fetch(base + url, {
    method,
    headers: {
      Cookie: cookie,
      Origin: base,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(
    response.status,
    status,
    `${method} ${url}: ${text.slice(0, 180)}`,
  );
  return text.startsWith("{") ? JSON.parse(text) : text;
}
async function upload(
  storeId: string,
  cookie: string,
  alt: string,
  status = 201,
  bytes: Uint8Array = png,
) {
  const data = new FormData();
  data.set("alt", alt);
  data.set(
    "image",
    new Blob([new Uint8Array(bytes)], { type: "image/png" }),
    "image.png",
  );
  const response = await fetch(base + endpoint(storeId), {
    method: "POST",
    headers: { Origin: base, Cookie: cookie },
    body: data,
  });
  const json = await response.json();
  assert.equal(response.status, status, JSON.stringify(json));
  return json.image;
}
async function main() {
  for (const suffix of ["a", "b"]) {
    const store = await db.store.create({
      data: {
        name: `${prefix}-store-${suffix}`,
        slug: `${prefix}-${suffix}`,
        description: "Test store",
        address: "123 Test street",
        phone: "0901234567",
      },
    });
    stores.push(store.id);
  }
  const ownerA = await actor("STORE_ADMIN", stores[0]),
    ownerB = await actor("STORE_ADMIN", stores[1]),
    customer = await actor("CUSTOMER"),
    superAdmin = await actor("SUPER_ADMIN");
  for (const [cookie, status] of [
    [customer, 403],
    [ownerB, 403],
    ["", 401],
  ] as const) {
    await upload(stores[0], cookie, "Denied", status);
    await call(endpoint(stores[0]), cookie, "GET", undefined, status);
    await call(
      endpoint(stores[0]),
      cookie,
      "DELETE",
      { id: "foreign" },
      status,
    );
  }
  await upload(stores[0], ownerA, "Invalid", 400, Buffer.from("<svg/>"));
  await upload(
    stores[0],
    ownerA,
    "Oversized",
    413,
    new Uint8Array(2 * 1024 * 1024 + 1),
  );
  const a1 = await upload(stores[0], ownerA, `${prefix}-photo-one`),
    a2 = await upload(stores[0], ownerA, `${prefix}-photo-two`),
    b1 = await upload(stores[1], ownerB, `${prefix}-other-photo`);
  assert.deepEqual(
    (await call(endpoint(stores[0]), ownerA)).images.map(
      (i: { id: string }) => i.id,
    ),
    [a1.id, a2.id],
  );
  for (const photo of [a1, a2, b1]) {
    const response = await fetch(base + photo.url);
    assert.equal(response.status, 200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  }
  await call(b1.url, ownerA, "GET", undefined, 404);
  await call(
    `/api/stores/${prefix}-b/gallery/${a1.id}`,
    customer,
    "GET",
    undefined,
    404,
  );
  const home = await call(`/stores/${prefix}-a`, customer);
  assert.ok(home.includes(a1.alt) && home.includes(a2.alt));
  assert.ok(!home.includes(b1.id));
  assert.ok(home.includes('id="store-gallery"'));
  assert.ok(!home.includes('id="gallery-manager"'));
  assert.ok(!home.includes("/api/admin/gallery"));
  const other = await call(`/stores/${prefix}-b`, customer);
  assert.ok(!other.includes(a1.id));
  assert.ok(other.includes(b1.id));
  assert.equal(
    (await db.store.findUniqueOrThrow({ where: { id: stores[0] } })).website,
    null,
    "Gallery does not change website/banner metadata",
  );
  await call(endpoint(stores[0]), ownerA, "DELETE", { id: b1.id }, 404);
  assert.ok(await db.storeGalleryImage.findUnique({ where: { id: b1.id } }));
  await call(endpoint(stores[0]), ownerA, "DELETE", { id: a1.id });
  assert.equal(
    await db.storeGalleryImage.findUnique({ where: { id: a1.id } }),
    null,
  );
  await call(a1.url, customer, "GET", undefined, 404);
  await call(endpoint(stores[0]), ownerA, "DELETE", { id: a2.id });
  assert.ok(
    !(await call(`/stores/${prefix}-a`, customer)).includes(
      'id="store-gallery"',
    ),
  );
  await db.store.update({
    where: { id: stores[1] },
    data: { isActive: false },
  });
  await upload(stores[1], ownerB, "Blocked", 403);
  await call(endpoint(stores[1]), ownerB, "DELETE", { id: b1.id }, 403);
  await call(b1.url, customer, "GET", undefined, 404);
  await call(endpoint(stores[1]), superAdmin, "DELETE", { id: b1.id });
  console.log(
    "PASS separate gallery, owner upload/delete, read-only customers, two-store isolation, image validation, persistence, deletion and suspended stores",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.store.deleteMany({ where: { id: { in: stores } } });
    await db.$disconnect();
  });
