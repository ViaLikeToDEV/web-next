import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  const todos = await prisma.todo.findMany({ where: { title: { contains: q } } });

  return Response.json(todos, {
    headers: { "Cache-Control": "no-store" },
  });
}

async function mutate(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (request.method !== "DELETE" && (!title || title.length > 200)) {
    return Response.json(
      { error: "กรุณากรอกชื่องาน 1–200 ตัวอักษร" },
      { status: 400 },
    );
  }

if (request.method === "POST") {
  const todo = await prisma.todo.create({
    data: { title },
  });

  return Response.json(todo, { status: 201 });
}

  if (typeof body.id !== "string" || !body.id) {
    return Response.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
  }

  if (request.method === "DELETE") {
    const result = await prisma.todo.deleteMany({
      where: { id: body.id },
    });

    if (result.count === 0) {
      return Response.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  }

  const result = await prisma.todo.updateMany({
    where: { id: body.id },
    data: { title },
  });

  if (result.count === 0) {
    return Response.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
  }

  return Response.json({ id: body.id, title });
}

export const POST = mutate;
export const PUT = mutate;
export const DELETE = mutate;
