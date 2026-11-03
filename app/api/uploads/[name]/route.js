import { readFile } from "node:fs/promises";
import path from "node:path";

// อ่านไฟล์ที่ผู้ใช้อัปโหลดขณะ server ทำงาน ไม่พึ่งรายการ public ที่ build ไว้
export async function GET(_request, { params }) {
  const { name } = await params;
  const ext = path.extname(name).toLowerCase();
  const types = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  };
  if (
    !name ||
    name !== path.basename(name) ||
    name.includes("/") ||
    name.includes("\\") ||
    !types[ext]
  ) {
    return new Response("ไม่พบรูปภาพ", { status: 404 });
  }
  try {
    const bytes = await readFile(
      path.join(process.cwd(), "public", "uploads", name),
    );
    return new Response(bytes, {
      headers: {
        "Content-Type": types[ext],
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response("ไม่พบรูปภาพ", { status: 404 });
  }
}
