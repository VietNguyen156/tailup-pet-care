import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomBytes, createHash } from "node:crypto";

if (
  !process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL ||
  !new URL(process.env.DATABASE_URL!).pathname.endsWith("_test")
)
  throw Error("Dedicated test database required");
const base = process.env.APP_URL!;
if (new URL(base).hostname !== "127.0.0.1")
  throw Error("Local server required");
const db = new PrismaClient();
const prefix = `service-image-${randomBytes(5).toString("hex")}`;
const stores: string[] = [],
  users: string[] = [];
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=",
  "base64",
);
async function actor(role: "STORE_ADMIN" | "CUSTOMER", storeId: string) {
  const user = await db.user.create({
    data: {
      name: prefix,
      email: `${prefix}-${users.length}@example.invalid`,
      passwordHash: "not-a-password",
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
async function upload(
  cookie: string,
  data: object,
  method = "POST",
  status = 201,
  bytes: Buffer | null = png,
) {
  const form = new FormData();
  form.set("data", JSON.stringify(data));
  if (bytes)
    form.set(
      "image",
      new Blob([new Uint8Array(bytes)], { type: "image/png" }),
      "photo.png",
    );
  const response = await fetch(`${base}/api/admin/services`, {
    method,
    headers: { Cookie: cookie, Origin: base },
    body: form,
  });
  const result = await response.json();
  assert.equal(response.status, status, JSON.stringify(result));
  return result.service;
}
async function getImage(id: string, status = 200, cookie = "") {
  const response = await fetch(`${base}/api/services/${id}/image`, {
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, status);
  if (status === 200) {
    assert.equal(response.headers.get("content-type"), "image/png");
    return Buffer.from(await response.arrayBuffer());
  }
}
async function main() {
  for (const suffix of ["a", "b"]) {
    const store = await db.store.create({
      data: {
        name: `${prefix}-${suffix}`,
        slug: `${prefix}-${suffix}`,
        address: "123 Test street",
        phone: "0901234567",
        description: "Test store",
      },
    });
    stores.push(store.id);
  }
  const owner = await actor("STORE_ADMIN", stores[0]);
  const other = await actor("STORE_ADMIN", stores[1]);
  const customer = await actor("CUSTOMER", stores[0]);
  const payload = {
    storeId: stores[0],
    name: "Test grooming",
    description: "Service description for test",
    category: "Grooming",
    price: 100000,
    durationMinutes: 60,
    process: "Wash\nDry",
  };
  await upload("", payload, "POST", 401);
  await upload(customer, payload, "POST", 403);
  await upload(other, payload, "POST", 403);
  await upload(owner, payload, "POST", 400, Buffer.from("invalid image"));
  await upload(owner, payload, "POST", 413, Buffer.alloc(2 * 1024 * 1024 + 1));
  assert.equal(await db.service.count({ where: { storeId: stores[0] } }), 0);
  const service = await upload(owner, payload);
  assert.deepEqual(await getImage(service.id), png);
  await getImage(service.id, 404, other);
  const detail = await fetch(`${base}/services/${service.slug}`);
  assert.equal(detail.status, 200);
  const html = await detail.text();
  assert.ok(html.includes(`/api/services/${service.id}/image`));
  assert.ok(html.includes(payload.description));
  assert.ok(html.includes(`/booking?service=${service.id}`));
  const list = await (
    await fetch(`${base}/stores/${prefix}-a/services`)
  ).text();
  assert.ok((list.match(/<a\b[^>]*>/g) ?? []).some(tag =>
    tag.includes(`href="/services/${service.slug}"`) && tag.includes('class="round-link"')
  ), "Service arrow opens its detail page");
  await upload(
    other,
    { id: service.id, name: "Forbidden change" },
    "PATCH",
    403,
  );
  await upload(customer, { id: service.id }, "PATCH", 403);
  const replacement = Buffer.concat([png, Buffer.from("replacement")]);
  await upload(
    owner,
    { id: service.id, description: "Updated description" },
    "PATCH",
    200,
    replacement,
  );
  assert.deepEqual(await getImage(service.id), replacement);
  await upload(owner, { id: service.id, price: 120000 }, "PATCH", 200, null);
  assert.deepEqual(await getImage(service.id), replacement);
  await upload(owner, { id: service.id }, "PATCH", 400, Buffer.from("invalid"));
  assert.deepEqual(await getImage(service.id), replacement);
  await upload(owner, { id: service.id, isActive: false }, "PATCH", 200, null);
  await getImage(service.id, 404);
  await getImage(service.id, 200, owner);
  await upload(owner, { id: service.id, isActive: true }, "PATCH", 200, null);
  const noImage = await upload(owner, payload, "POST", 201, null);
  await getImage(noImage.id, 404);
  await db.store.update({
    where: { id: stores[0] },
    data: { isActive: false },
  });
  await getImage(service.id, 404);
  await upload(owner, { id: service.id }, "PATCH", 403);
  console.log(
    "PASS upload, replacement, optional image, validation, tenant isolation, customer permissions, detail link, hidden and suspended services",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.service.deleteMany({ where: { storeId: { in: stores } } });
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.store.deleteMany({ where: { id: { in: stores } } });
    await db.$disconnect();
  });
