import { prisma } from "@/lib/prisma";
const bad = message => Response.json({ error: message }, { status: 400 });
export async function PATCH(request) {
  try {
    const body = await request.json();
    // same: เปลี่ยน stock เดียวกัน; different: แต่ละ id มี stock ของตัวเอง
    const updates = body.mode === "same" && Array.isArray(body.ids) ? body.ids.map(id => ({ id, stock: body.stock })) : body.mode === "different" ? body.items : null;
    if (!Array.isArray(updates) || !updates.length || updates.length > 100 || updates.some(x => !x || !Number.isSafeInteger(x.id) || x.id <= 0 || !Number.isSafeInteger(x.stock) || x.stock < 0) || new Set(updates.map(x => x.id)).size !== updates.length) return bad("ระบุรายการและสต็อกเป็นจำนวนเต็มไม่ติดลบ โดย id ต้องไม่ซ้ำกัน");
    // update ทุกตัวใน transaction: ถ้า id ใดไม่มีอยู่ จะย้อนกลับทั้งหมด
    await prisma.$transaction(updates.map(x => prisma.product.update({ where: { id: x.id }, data: { stock: x.stock } })));
    return Response.json({ updated: updates.length });
  } catch (e) { return e.code === "P2025" ? Response.json({ error: "ไม่พบสินค้าบางรายการ จึงไม่ได้บันทึก" }, { status: 404 }) : bad("ข้อมูลไม่ถูกต้องหรือบันทึกไม่สำเร็จ"); }
}
