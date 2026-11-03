import Link from "next/link";
export default function Home() {
  return (
    <main>
      <h1>คู่มือ Full-stack สำหรับฝึกสอบ</h1>
      <p>
        ตัวอย่างที่เชื่อมหน้าเว็บ → API → Prisma → SQLite
        อ่านตามลำดับจากง่ายไปยาก
      </p>
      <div className="card">
        <h2>1. Todo List — เริ่มต้น</h2>
        <p>เพิ่ม ค้นหา แก้ไข ลบ พร้อมดูการส่ง JSON ระหว่างหน้าเว็บกับ API</p>
        <Link href="/todo">เปิด Todo</Link>
      </div>
      <div className="card">
        <h2>2. หนังสือ — ฝึก CRUD และรูปภาพ</h2>
        <p>จัดการหนังสือ ค้นหา และอัปโหลดรูปปก</p>
        <Link href="/books">เปิดหนังสือ</Link>
      </div>
      <div className="card">
        <h2>3. E-commerce — ตัวอย่างขั้นสูง</h2>
        <p>หมวดหมู่ สินค้า ตะกร้า คำสั่งซื้อ สต็อก และอัปเดตหลายรายการ</p>
        <Link href="/shop">เปิดร้านค้าจำลอง</Link>
      </div>
      <div className="card">
        <h2>เริ่มทดลองและอ่านโค้ด</h2>
        <p>
          รัน <code>npm run db:seed</code> หลังสร้างฐานข้อมูลเพื่อเพิ่มงาน
          หนังสือ สินค้า และประวัติคำสั่งซื้อตัวอย่าง
        </p>
        <p>Todo: app/components/todo-list.tsx → app/api/todos/route.ts</p>
        <p>
          หนังสือและสินค้า: app/components/manager.js →
          app/api/[resource]/route.js
        </p>
        <p>
          ตะกร้าและคำสั่งซื้อ: app/components/cart.js → app/api/orders/route.js
        </p>
        <p>ดูขั้นตอนติดตั้ง วิธีทดลอง และแผนที่ source ฉบับเต็มใน README.md</p>
      </div>
    </main>
  );
}
