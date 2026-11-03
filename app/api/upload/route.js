import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
export async function POST(request) {
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return Response.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    if (file.size === 0 || file.size > 5 * 1024 * 1024) return Response.json({ error: "ไฟล์ต้องมีขนาดไม่เกิน 5 MB" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    // ตรวจ signature ของเนื้อหา ไม่เชื่อชื่อไฟล์หรือ MIME จาก browser เพียงอย่างเดียว
    let ext = "";
    if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext = "png";
    else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ext = "jpg";
    else if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") ext = "webp";
    if (!ext) return Response.json({ error: "รองรับเฉพาะภาพ PNG, JPEG และ WebP" }, { status: 400 });
    const dir = path.join(process.cwd(), "public", "uploads"); await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${ext}`; await writeFile(path.join(dir, name), bytes);
    return Response.json({ url: `/api/uploads/${name}` }, { status: 201 });
  } catch { return Response.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 }); }
}
