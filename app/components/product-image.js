"use client";

import { useState } from "react";

// ไฟล์ที่สร้างหลังเริ่ม server อ่านผ่าน API ได้ทันที แม้ใน production build
export function imageSource(url) {
  return url?.startsWith("/uploads/")
    ? `/api/uploads/${url.slice("/uploads/".length)}`
    : url;
}

export default function ProductImage({ url, name }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const src = imageSource(url);
  if (!src || failedUrl === src) return <span>ไม่มีรูปสินค้า</span>;
  return (
    // ใช้ img เพื่อรองรับ URL รูปที่ผู้ใช้กรอกเองและไฟล์ที่อัปโหลดภายหลัง
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`รูปสินค้า ${name || "ตัวอย่าง"}`}
      width="100"
      height="100"
      style={{ width: 100, height: 100, objectFit: "contain", borderRadius: 6 }}
      onError={() => setFailedUrl(src)}
    />
  );
}
