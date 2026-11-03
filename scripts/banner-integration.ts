import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { defaultWebsite, readWebsite } from "../lib/store-website";
import type { ManagedBanner } from "../lib/banner-validation";
if (
  !process.env.TEST_DATABASE_URL ||
  process.env.TEST_DATABASE_URL !== process.env.DATABASE_URL ||
  !new URL(process.env.DATABASE_URL!).pathname.endsWith("_test")
)
  throw new Error("Dedicated test database required");
const base = process.env.APP_URL!;
if (new URL(base).hostname !== "127.0.0.1")
  throw new Error("Local test server required");
const db = new PrismaClient(),
  prefix = `banner-${randomBytes(5).toString("hex")}`,
  stores: string[] = [],
  users: string[] = [];
async function actor(
  role: "STORE_ADMIN" | "SUPER_ADMIN" | "CUSTOMER",
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
async function call(
  path: string,
  cookie: string,
  method = "GET",
  body?: unknown,
  status = 200,
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Cookie: cookie,
      Origin: base,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const text = await response.text();
  if (
    method === "GET" &&
    !path.startsWith("/api/") &&
    status === 404 &&
    response.status === 200
  )
    assert.ok(text.includes("NEXT_HTTP_ERROR_FALLBACK;404"));
  else
    assert.equal(
      response.status,
      status,
      `${method} ${path}: ${text.slice(0, 250)}`,
    );
  return text.startsWith("{") ? JSON.parse(text) : text;
}
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=",
  "base64",
);
const endpoint = (id: string) => `/api/admin/banners?storeId=${id}`;
async function save(
  id: string,
  cookie: string,
  fields: Record<string, string | number | boolean>,
  image: Uint8Array | null = png,
  method = "POST",
  status = 201,
  mime = "image/png",
) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    title: `${prefix}-slide`,
    description: "Slide description",
    buttonText: "Discover",
    buttonUrl: "/stores",
    enabled: true,
    sortOrder: 0,
    ...fields,
  }))
    form.set(key, String(value));
  if (image)
    form.set(
      "image",
      new Blob([new Uint8Array(image)], { type: mime }),
      "banner.png",
    );
  const response = await fetch(base + endpoint(id), {
    method,
    headers: { Cookie: cookie, Origin: base },
    body: form,
  });
  const json = await response.json();
  assert.equal(response.status, status, JSON.stringify(json));
  return json.banners as ManagedBanner[];
}
async function main() {
  for (const suffix of ["a", "b"]) {
    const store = await db.store.create({
      data: {
        name: `${prefix}-store-${suffix}`,
        slug: `${prefix}-${suffix}`,
        description: "Store description",
        address: "Test street 123",
        phone: "0901234567",
      },
    });
    stores.push(store.id);
  }
  const [a, b] = await Promise.all(
    stores.map((id) => db.store.findUniqueOrThrow({ where: { id } })),
  );
  const ownerA = await actor("STORE_ADMIN", a.id),
    ownerB = await actor("STORE_ADMIN", b.id),
    customer = await actor("CUSTOMER"),
    superAdmin = await actor("SUPER_ADMIN");
  const website = defaultWebsite(a);
  website.headline = `${prefix}-headline`;
  website.aboutTitle = `${prefix}-about`;
  website.articles = [
    { title: `${prefix}-article`, body: "Store information only.", image: "" },
  ];
  website.email = "store@example.invalid";
  await call("/api/admin/website", ownerA, "PATCH", { storeId: a.id, website });
  await call(
    "/api/admin/website",
    ownerB,
    "PATCH",
    { storeId: a.id, website },
    403,
  );
  await call(
    "/api/admin/website",
    customer,
    "PATCH",
    { storeId: a.id, website },
    403,
  );
  await call(
    "/api/admin/website",
    ownerA,
    "PATCH",
    { storeId: a.id, website: { ...website, facebook: "javascript:alert(1)" } },
    400,
  );
  for (const [cookie, status] of [
    [ownerB, 403],
    [customer, 403],
    ["", 401],
  ] as const) {
    await call(endpoint(a.id), cookie, "GET", undefined, status);
    await save(a.id, cookie, {}, png, "POST", status);
    await save(a.id, cookie, { slot: 0 }, null, "PATCH", status);
    await call(endpoint(a.id), cookie, "DELETE", { slot: 0 }, status);
    await call(
      endpoint(a.id),
      cookie,
      "PATCH",
      { action: "toggle", slot: 0, enabled: false },
      status,
    );
  }
  await call(endpoint(a.id), superAdmin, "GET");
  await call(endpoint(a.id), ownerA, "DELETE", { slot: 0 });
  assert.deepEqual((await call(endpoint(a.id), ownerA)).banners, []);
  await save(a.id, ownerA, {}, null, "POST", 400);
  await save(
    a.id,
    ownerA,
    {},
    Buffer.from("<svg onload='alert(1)'/>"),
    "POST",
    400,
  );
  await save(
    a.id,
    ownerA,
    {},
    new Uint8Array(2 * 1024 * 1024 + 1),
    "POST",
    413,
  );
  await save(a.id, ownerA, {}, png, "POST", 400, "image/jpeg");
  await save(
    a.id,
    ownerA,
    { buttonUrl: "javascript:alert(1)" },
    png,
    "POST",
    400,
  );
  await save(
    a.id,
    ownerA,
    { buttonText: "", buttonUrl: "https://example.com" },
    png,
    "POST",
    400,
  );
  let banners: ManagedBanner[] = [];
  for (let i = 0; i < 5; i++)
    banners = await save(a.id, ownerA, {
      title: `${prefix}-slide-${i}`,
      sortOrder: i,
      buttonUrl: `/stores/${a.slug}/contact`,
    });
  await save(a.id, ownerA, {}, png, "POST", 400);
  assert.equal(await db.storeBanner.count({ where: { storeId: a.id } }), 5);
  for (const banner of banners) {
    const response = await fetch(base + banner.image);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  }
  console.log(
    "PASS admin-only create/edit/delete, store isolation, five uploads, format/size/link validation",
  );
  const first = banners[0];
  const replacement = Buffer.concat([png, Buffer.from("replacement")]);
  banners = await save(
    a.id,
    ownerA,
    {
      slot: first.slot,
      title: `${prefix}-edited`,
      description: "Changed caption",
      buttonText: "Contact us",
      buttonUrl: `/stores/${a.slug}/contact`,
      sortOrder: 2,
    },
    replacement,
    "PATCH",
    200,
  );
  assert.equal(banners[2].title, `${prefix}-edited`);
  assert.equal(banners[2].buttonText, "Contact us");
  assert.deepEqual(
    Buffer.from(await (await fetch(base + banners[2].image)).arrayBuffer()),
    replacement,
  );
  const reversed = banners.map((b) => b.slot).reverse();
  banners = (
    await call(endpoint(a.id), ownerA, "PATCH", {
      action: "reorder",
      slots: reversed,
    })
  ).banners;
  assert.deepEqual(
    banners.map((b) => b.slot),
    reversed,
  );
  await call(
    endpoint(a.id),
    ownerA,
    "PATCH",
    { action: "reorder", slots: [0, 0, 1, 2, 3] },
    409,
  );
  await call(
    endpoint(a.id),
    ownerA,
    "PATCH",
    { action: "reorder", slots: [0] },
    409,
  );
  const hidden = banners[1];
  await call(endpoint(a.id), ownerA, "PATCH", {
    action: "toggle",
    slot: hidden.slot,
    enabled: false,
  });
  const home = await call(`/stores/${a.slug}`, "", "GET");
  assert.ok(!home.includes(hidden.title));
  assert.ok(home.includes(banners[0].title));
  assert.ok(home.indexOf(banners[0].title) < home.indexOf(banners[2].title));
  assert.ok(home.includes("Contact us"));
  await call(hidden.image, customer, "GET", undefined, 404);
  const preview = await fetch(base + hidden.image, {
    headers: { Cookie: ownerA },
  });
  assert.equal(preview.status, 200);
  await call(hidden.image, ownerB, "GET", undefined, 404);
  const expected = (await call(endpoint(a.id), ownerA)).banners;
  await call("/api/admin/website", ownerA, "PATCH", {
    storeId: a.id,
    website: { ...website, headline: `${prefix}-fresh`, banners: [] },
  });
  assert.deepEqual((await call(endpoint(a.id), ownerA)).banners, expected);
  for (const section of [
    "",
    "/about",
    "/services",
    "/information",
    "/contact",
  ]) {
    const page = await call(`/stores/${a.slug}${section}`, customer);
    assert.ok(page.includes(a.name));
    assert.ok(!page.includes(b.name));
    await call(`/stores/${b.slug}${section}`, ownerA, "GET", undefined, 404);
  }
  assert.ok(
    (await call(`/stores/${a.slug}/information`, customer)).includes(
      website.articles[0].title,
    ),
  );
  assert.ok(
    (await call(`/stores/${a.slug}/contact`, customer)).includes(website.email),
  );
  console.log(
    "PASS atomic replacement, button content, ordering, hidden images, fresh public rendering and text-save isolation",
  );
  for (const banner of expected)
    await call(endpoint(a.id), ownerA, "DELETE", { slot: banner.slot });
  assert.equal(await db.storeBanner.count({ where: { storeId: a.id } }), 0);
  const stored = await db.store.findUniqueOrThrow({ where: { id: a.id } });
  assert.deepEqual(readWebsite(stored.website, stored).banners, []);
  assert.ok(
    !(await call(`/stores/${a.slug}`, customer)).includes(
      'aria-roledescription="băng chuyền"',
    ),
  );
  await call(first.image, customer, "GET", undefined, 404);
  // Store lock must serialize concurrent allocations; two new banners must have distinct slots.
  await Promise.all([
    save(a.id, ownerA, { title: `${prefix}-parallel-one` }),
    save(a.id, superAdmin, { title: `${prefix}-parallel-two` }),
  ]);
  const concurrent = (await call(endpoint(a.id), ownerA)).banners;
  assert.equal(concurrent.length, 2);
  assert.equal(new Set(concurrent.map((b: ManagedBanner) => b.slot)).size, 2);
  await db.store.update({ where: { id: a.id }, data: { isActive: false } });
  await call(
    endpoint(a.id),
    ownerA,
    "PATCH",
    { action: "toggle", slot: concurrent[0].slot, enabled: false },
    403,
  );
  await call(concurrent[0].image, customer, "GET", undefined, 404);
  const before = await db.session.count({ where: { userId: { in: users } } });
  await call("/api/auth/logout", customer, "POST");
  assert.equal(
    await db.session.count({ where: { userId: { in: users } } }),
    before - 1,
  );
  console.log(
    "PASS deletion removes stored images, empty carousel stays empty, concurrent allocations, suspended store and logout",
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
