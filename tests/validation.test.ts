import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingSchema,
  petSchema,
  registerSchema,
  orderSchema,
  assertFutureSlot,
  localDate,
  validDate,
} from "../lib/validation";
import { hashPassword, verifyPassword } from "../lib/password";
const booking = {
  serviceId: "service",
  petId: "pet",
  bookingDate: "2027-01-02",
  timeSlot: "09:00",
};
test("dates reject calendar overflow and respect Vietnam midnight", () => {
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validDate("2026-2-01"), false);
  assert.equal(localDate(new Date("2026-10-30T18:00:00Z")), "2026-10-31");
});
test("booking requires either an owned pet id or a new name AND pet type", () => {
  assert.equal(bookingSchema.safeParse(booking).success, true);
  assert.equal(
    bookingSchema.safeParse({
      ...booking,
      petId: "",
      newPetName: "Milo",
      newPetType: "CAT",
    }).success,
    true,
  );
  assert.equal(
    bookingSchema.safeParse({ ...booking, petId: "", newPetName: "Milo" })
      .success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({
      ...booking,
      newPetName: "Milo",
      newPetType: "CAT",
    }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...booking, petId: "" }).success,
    false,
  );
});
test("booking rejects unsupported slots and impossible dates", () => {
  assert.equal(
    bookingSchema.safeParse({ ...booking, timeSlot: "03:00" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...booking, bookingDate: "2027-02-30" }).success,
    false,
  );
});

test("booking reports a Vietnamese message for a missing service", () => {
  for (const serviceId of [undefined, null, "", "   "]) {
    const result = bookingSchema.safeParse({ ...booking, serviceId });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(
        result.error.issues.find((issue) => issue.path[0] === "serviceId")?.message,
        "Vui lòng chọn dịch vụ.",
      );
    }
  }
});
test("future-time checks use UTC+7 and reject bookings outside 90 days", () => {
  const now = new Date("2026-01-01T01:00:00Z");
  assert.equal(assertFutureSlot("2026-01-01", "09:00", now), true);
  assert.equal(assertFutureSlot("2026-01-01", "07:00", now), false);
  assert.equal(assertFutureSlot("2026-06-01", "09:00", now), false);
});
test("pet weight must be positive and birthday cannot be in future", () => {
  const pet = { name: "Milo", type: "CAT" };
  assert.equal(
    petSchema.safeParse({ ...pet, weight: "4.25", birthDate: "2020-01-01" })
      .success,
    true,
  );
  assert.equal(petSchema.safeParse({ ...pet, weight: "-1" }).success, false);
  assert.equal(petSchema.safeParse({ ...pet, weight: "abc" }).success, false);
  assert.equal(petSchema.safeParse({ ...pet, weight: "0.001" }).success, false);
  assert.equal(
    petSchema.safeParse({ ...pet, birthDate: "2999-01-01" }).success,
    false,
  );
});
test("registration never accepts privilege assignment", () => {
  const value = registerSchema.parse({
    name: "Minh Anh",
    email: "ANH@example.com",
    phone: "0901234567",
    password: "LongPassword2026",
    role: "ADMIN",
  });
  assert.equal(value.email, "anh@example.com");
  assert.equal("role" in value, false);
  assert.equal(
    registerSchema.safeParse({ ...value, password: "123" }).success,
    false,
  );
});
test("order accepts COD only, rejects negative and fractional quantities", () => {
  const data = {
    recipientName: "Minh Anh",
    phone: "0901234567",
    address: "123 đường Mẫu, Thành phố Mẫu",
    paymentMethod: "COD",
    items: [{ productId: "product", quantity: 1 }],
  };
  assert.equal(orderSchema.safeParse(data).success, true);
  assert.equal(
    orderSchema.safeParse({ ...data, paymentMethod: "BANK_TRANSFER" }).success,
    false,
  );
  for (const quantity of [0, -1, 1.5, 21])
    assert.equal(
      orderSchema.safeParse({
        ...data,
        items: [{ productId: "product", quantity }],
      }).success,
      false,
    );
});
test("password hashing is salted and validates without plaintext storage", async () => {
  const a = await hashPassword("CorrectPassword!"),
    b = await hashPassword("CorrectPassword!");
  assert.notEqual(a, b);
  assert.equal(a.includes("CorrectPassword!"), false);
  assert.equal(await verifyPassword("CorrectPassword!", a), true);
  assert.equal(await verifyPassword("WrongPassword!", a), false);
  assert.equal(await verifyPassword("any", "invalid"), false);
});
