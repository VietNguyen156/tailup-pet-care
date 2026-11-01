/** Runs only against a separately migrated database ending in _test.
 * Set TEST_DATABASE_URL in .env, migrate that database first (see README).
 * Creates its own records and removes only records it owns in finally.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
async function main() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !new URL(url).pathname.endsWith("_test"))
    throw new Error(
      "TEST_DATABASE_URL must point to a separate database whose name ends in _test.",
    );
  process.env.DATABASE_URL = url;
  const { db } = await import("../lib/db");
  const { createBooking, availability } = await import("../lib/booking");
  const { createOrder } = await import("../lib/orders");
  const prefix = `it-${randomUUID().slice(0, 8)}`;
  const date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const userIds: string[] = [],
    petIds: string[] = [],
    slotIds: string[] = [];
  const serviceId = `${prefix}-service`,
    productId = `${prefix}-product`,
    otherProductId = `${prefix}-other`;
  try {
    const staff = await db.user.create({
      data: {
        id: `${prefix}-staff`,
        name: "Test Staff",
        email: `${prefix}-staff@example.invalid`,
        passwordHash: "unused",
        role: "STAFF",
      },
    });
    userIds.push(staff.id);
    for (let i = 0; i < 7; i++) {
      const u = await db.user.create({
        data: {
          id: `${prefix}-u${i}`,
          name: `Test Customer ${i}`,
          email: `${prefix}-u${i}@example.invalid`,
          passwordHash: "unused",
        },
      });
      userIds.push(u.id);
      const p = await db.pet.create({
        data: {
          id: `${prefix}-pet${i}`,
          name: `Test Pet ${i}`,
          type: "DOG",
          userId: u.id,
        },
      });
      petIds.push(p.id);
    }
    await db.service.create({
      data: {
        id: serviceId,
        name: "Integration service",
        slug: serviceId,
        description: "temporary",
        process: [],
        price: 100000,
        durationMinutes: 60,
        category: "Test",
      },
    });
    // Reserve empty, isolated slot rows first; never reuse another run's date/slot.
    for (const timeSlot of ["09:00", "10:30", "14:00"]) {
      const slot = await db.appointmentSlot.create({
        data: { bookingDate: new Date(`${date}T00:00:00Z`), timeSlot },
      });
      slotIds.push(slot.id);
    }
    const base = { serviceId, bookingDate: date, timeSlot: "09:00" as const };
    // Five simultaneous requests: exactly three are accepted, never four.
    const result = await Promise.allSettled(
      petIds
        .slice(0, 5)
        .map((petId, i) => createBooking(userIds[i + 1], { ...base, petId })),
    );
    assert.equal(result.filter((x) => x.status === "fulfilled").length, 3);
    assert.equal(await db.booking.count({ where: { slotId: slotIds[0] } }), 3);
    console.log("PASS concurrent slot capacity (3 of 5 accepted)");
    await assert.rejects(
      () =>
        createBooking(userIds[6], {
          ...base,
          timeSlot: "14:00",
          petId: petIds[0],
        }),
      /không thuộc/,
    );
    console.log("PASS pet ownership");
    await createBooking(userIds[6], {
      ...base,
      timeSlot: "10:30",
      petId: petIds[5],
      staffId: staff.id,
    });
    await assert.rejects(
      () =>
        createBooking(userIds[7], {
          ...base,
          timeSlot: "10:30",
          petId: petIds[6],
          staffId: staff.id,
        }),
      /Nhân viên đã có lịch/,
    );
    console.log("PASS staff overlap");
    const cancelled = await db.booking.findFirstOrThrow({
      where: { slotId: slotIds[0] },
    });
    await db.booking.update({
      where: { id: cancelled.id },
      data: { status: "CANCELLED" },
    });
    await createBooking(userIds[7], { ...base, petId: petIds[6] });
    console.log("PASS cancellation releases slot capacity");
    await db.product.create({
      data: {
        id: productId,
        name: "Test product",
        slug: productId,
        category: "Test",
        description: "temporary",
        price: 12000,
        stock: 2,
      },
    });
    await db.product.create({
      data: {
        id: otherProductId,
        name: "Rollback product",
        slug: otherProductId,
        category: "Test",
        description: "temporary",
        price: 5000,
        stock: 1,
      },
    });
    const orderInput = {
      recipientName: "Test Customer",
      phone: "0901234567",
      address: "Test address only",
      paymentMethod: "COD" as const,
      items: [{ productId, quantity: 1 }],
    };
    const orders = await Promise.allSettled(
      [0, 1, 2].map((i) => createOrder(userIds[i + 1], orderInput)),
    );
    assert.equal(orders.filter((o) => o.status === "fulfilled").length, 2);
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id: productId } })).stock,
      0,
    );
    const saved = await db.order.findFirstOrThrow({
      where: { userId: { in: userIds } },
    });
    assert.equal(Number(saved.totalAmount), 12000);
    console.log("PASS concurrent inventory + server-side total");
    await assert.rejects(() =>
      createOrder(userIds[1], {
        ...orderInput,
        items: [
          { productId: otherProductId, quantity: 1 },
          { productId, quantity: 1 },
        ],
      }),
    );
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id: otherProductId } }))
        .stock,
      1,
    );
    console.log("PASS order failure rolls back inventory");
  } finally {
    await db.orderItem.deleteMany({
      where: { productId: { in: [productId, otherProductId] } },
    });
    await db.order.deleteMany({ where: { userId: { in: userIds } } });
    await db.booking.deleteMany({ where: { serviceId } });
    await db.appointmentSlot.deleteMany({ where: { id: { in: slotIds } } });
    await db.pet.deleteMany({ where: { id: { in: petIds } } });
    await db.service.deleteMany({ where: { id: serviceId } });
    await db.product.deleteMany({
      where: { id: { in: [productId, otherProductId] } },
    });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
