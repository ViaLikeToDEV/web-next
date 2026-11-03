import { prisma } from "@/lib/prisma";

// ตัวอย่าง API แบบรวม resource: ตรวจชื่อก่อนเลือก model เพื่อไม่เปิดทุกตารางให้แก้ไข
const models = { books: "book", categories: "category", products: "product" };
const error = (message, status = 400) =>
  Response.json({ error: message }, { status });
const idOf = (value) =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0
    ? Number(value)
    : null;
const text = (value) => (typeof value === "string" ? value.trim() : "");
function fields(resource, body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw Error("ข้อมูลไม่ถูกต้อง");
  if (resource === "books") {
    const title = text(body.title);
    if (!title || title.length > 200)
      throw Error("กรอกชื่อหนังสือ 1–200 ตัวอักษร");
    return {
      title,
      description: text(body.description) || null,
      coverUrl: text(body.coverUrl) || null,
    };
  }
  const name = text(body.name);
  if (!name || name.length > 200) throw Error("กรอกชื่อ 1–200 ตัวอักษร");
  if (resource === "categories") return { name };
  const price = Number(body.price);
  const stock = Number(body.stock);
  const categoryId = idOf(body.categoryId);
  if (
    body.price == null ||
    body.stock == null ||
    body.price === "" ||
    body.stock === "" ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    !categoryId
  )
    throw Error("ราคา สต็อก และหมวดหมู่ไม่ถูกต้อง");
  return {
    name,
    price,
    stock,
    categoryId,
    imageUrl: text(body.imageUrl) || null,
  };
}
async function resourceOf(context) {
  const { resource } = await context.params;
  return models[resource] ? resource : null;
}
function failure(e) {
  if (e.code === "P2002") return error("ข้อมูลนี้มีอยู่แล้ว", 409);
  if (e.code === "P2003")
    return error("ข้อมูลนี้ถูกใช้งานอยู่ หรือไม่พบหมวดหมู่", 409);
  if (e.code === "P2025") return error("ไม่พบรายการ", 404);
  return error(e.message || "เกิดข้อผิดพลาด");
}
export async function GET(request, context) {
  const resource = await resourceOf(context);
  if (!resource) return error("ไม่พบ API", 404);
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  const key = resource === "books" ? "title" : "name";
  const rows = await prisma[models[resource]].findMany({
    where: { [key]: { contains: q } },
    orderBy: { id: "desc" },
    ...(resource === "products" ? { include: { category: true } } : {}),
  });
  return Response.json(rows);
}
export async function POST(request, context) {
  const resource = await resourceOf(context);
  if (!resource) return error("ไม่พบ API", 404);
  try {
    const data = fields(resource, await request.json());
    return Response.json(await prisma[models[resource]].create({ data }), {
      status: 201,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(request, context) {
  const resource = await resourceOf(context);
  if (!resource) return error("ไม่พบ API", 404);
  try {
    const body = await request.json();
    const id = idOf(body.id);
    if (!id) return error("id ไม่ถูกต้อง");
    return Response.json(
      await prisma[models[resource]].update({
        where: { id },
        data: fields(resource, body),
      }),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request, context) {
  const resource = await resourceOf(context);
  if (!resource) return error("ไม่พบ API", 404);
  try {
    const body = await request.json();
    const id = idOf(body.id);
    if (!id) return error("id ไม่ถูกต้อง");
    await prisma[models[resource]].delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return failure(e);
  }
}
