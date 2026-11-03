import { prisma } from "@/lib/prisma";
const bad = (message) => Response.json({ error: message }, { status: 400 });
export async function PATCH(request) {
  try {
    const body = await request.json();
    // same: เปลี่ยน stock เดียวกัน; different: แต่ละ id มี stock ของตัวเอง
    let updates = null;
    if (body.mode === "same" && Array.isArray(body.ids)) {
      updates = body.ids.map((id) => ({ id, stock: body.stock }));
    } else if (body.mode === "different") {
      updates = body.items;
    }
    if (
      !Array.isArray(updates) ||
      !updates.length ||
      updates.length > 100 ||
      updates.some(
        (update) =>
          !update ||
          !Number.isSafeInteger(update.id) ||
          update.id <= 0 ||
          !Number.isSafeInteger(update.stock) ||
          update.stock < 0,
      ) ||
      new Set(updates.map((x) => x.id)).size !== updates.length
    )
      return bad(
        "ระบุรายการและสต็อกเป็นจำนวนเต็มไม่ติดลบ โดย id ต้องไม่ซ้ำกัน",
      );
    // update ทุกตัวใน transaction: ถ้า id ใดไม่มีอยู่ จะย้อนกลับทั้งหมด
    await prisma.$transaction(
      updates.map((update) =>
        prisma.product.update({
          where: { id: update.id },
          data: { stock: update.stock },
        }),
      ),
    );
    return Response.json({ updated: updates.length });
  } catch (e) {
    return e.code === "P2025"
      ? Response.json(
          { error: "ไม่พบสินค้าบางรายการ จึงไม่ได้บันทึก" },
          { status: 404 },
        )
      : bad("ข้อมูลไม่ถูกต้องหรือบันทึกไม่สำเร็จ");
  }
}
