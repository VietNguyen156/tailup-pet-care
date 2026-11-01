import { z } from "zod";
import { Prisma } from "@prisma/client";
import { orderSchema } from "./validation";
import { serializable } from "./transaction";
import { ApiError } from "./http";
export async function createOrder(
  userId: string,
  input: z.infer<typeof orderSchema>,
) {
  const merged = new Map<string, number>();
  for (const item of input.items) {
    const quantity = (merged.get(item.productId) ?? 0) + item.quantity;
    if (quantity > 20)
      throw new ApiError(400, "Mỗi sản phẩm tối đa 20 đơn vị.");
    merged.set(item.productId, quantity);
  }
  return serializable(async (tx) => {
    let total = new Prisma.Decimal(0);
    const items = [];
    for (const [productId, quantity] of [...merged].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const product = await tx.product.findFirst({
        where: { id: productId, isActive: true },
      });
      if (!product)
        throw new ApiError(400, "Một sản phẩm không còn kinh doanh.");
      const result = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (!result.count)
        throw new ApiError(409, `${product.name}: không đủ tồn kho.`);
      total = total.add(product.price.mul(quantity));
      items.push({
        productId,
        quantity,
        unitPrice: product.price,
        productName: product.name,
      });
    }
    return tx.order.create({
      data: {
        userId,
        recipientName: input.recipientName,
        phone: input.phone,
        address: input.address,
        note: input.note,
        paymentMethod: input.paymentMethod,
        totalAmount: total,
        items: { create: items },
      },
      include: { items: true },
    });
  });
}
