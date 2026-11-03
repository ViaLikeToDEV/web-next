import { prisma } from "@/lib/prisma";
export async function GET() {
  return Response.json(
    await prisma.order.findMany({
      include: { items: true },
      orderBy: { id: "desc" },
    }),
  );
}
export async function POST(request) {
  try {
    const { items } = await request.json();
    if (
      !Array.isArray(items) ||
      !items.length ||
      items.length > 100 ||
      items.some(
        (item) =>
          !item ||
          !Number.isSafeInteger(item.productId) ||
          item.productId <= 0 ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0,
      ) ||
      new Set(items.map((item) => item.productId)).size !== items.length
    )
      return Response.json(
        { error: "สินค้าและจำนวนไม่ถูกต้อง หรือสินค้าซ้ำ" },
        { status: 400 },
      );
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const lines = [];
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw Error("ไม่พบสินค้า");
        // เงื่อนไข stock ป้องกันการตัดสต็อกเกินเมื่อมีคำสั่งซื้อพร้อมกัน
        const changed = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (!changed.count) throw Error(`สินค้า ${product.name} มีสต็อกไม่พอ`);
        total += product.price * item.quantity;
        if (!Number.isSafeInteger(total) || total > 2147483647)
          throw Error("ยอดรวมสูงเกินไป");
        lines.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }
      return tx.order.create({
        data: { total, items: { create: lines } },
        include: { items: true },
      });
    });
    return Response.json(order, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: e.message || "สั่งซื้อไม่สำเร็จ" },
      { status: 400 },
    );
  }
}
