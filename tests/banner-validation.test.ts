import assert from "node:assert/strict";
import test from "node:test";
import { bannerLink, bannerFields } from "../lib/banner-validation";
import { defaultWebsite, readWebsite } from "../lib/store-website";
test("banner links reject executable and protocol-relative URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.example",
    "/\\evil.example",
    "https://user:pass@example.com",
    "/test\npath",
  ])
    assert.equal(bannerLink.safeParse(url).success, false, url);
  for (const url of [
    "/stores/shop/contact",
    "https://example.com/contact?ref=banner",
    "",
  ])
    assert.equal(bannerLink.safeParse(url).success, true, url);
});
test("banner CTA requires both label and link or neither", () => {
  const item = {
    title: "Test",
    description: "",
    buttonText: "",
    buttonUrl: "",
    enabled: true,
    sortOrder: 0,
  };
  assert.ok(bannerFields.safeParse(item).success);
  assert.equal(
    bannerFields.safeParse({ ...item, buttonText: "Go" }).success,
    false,
  );
  assert.ok(
    bannerFields.safeParse({ ...item, buttonText: "Go", buttonUrl: "/stores" })
      .success,
  );
});
test("legacy banner normalization preserves image slot when empty placeholders are removed", () => {
  const store = { name: "Test", description: "" };
  const website = defaultWebsite(store);
  const legacy = {
    ...website,
    banners: [
      { title: "", description: "", image: "", enabled: false },
      {
        title: "Old",
        description: "",
        image: "/tailup-companions.webp",
        enabled: false,
      },
    ],
  };
  const result = readWebsite(legacy, store).banners;
  assert.equal(result.length, 1);
  assert.equal(result[0].slot, 1);
  assert.equal(result[0].sortOrder, 0);
  assert.equal(result[0].enabled, false);
  assert.deepEqual(readWebsite({ ...website, banners: [] }, store).banners, []);
});
