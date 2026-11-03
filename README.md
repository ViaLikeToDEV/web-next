# Full-stack Exam Guide

ชุดตัวอย่าง Next.js App Router + TypeScript/JavaScript + Prisma + SQLite สำหรับศึกษา CRUD และนำไปประยุกต์ อ่าน Todo ก่อน แล้วจึงดูหนังสือและร้านค้า โค้ดเป็นตัวอย่างเพื่อการเรียน ไม่ใช่ระบบ production: ไม่มีสมาชิก การอนุญาตสิทธิ์ และการชำระเงินจริง

## ติดตั้งจาก clone

ต้องมี Node.js ที่รองรับ Next.js 16 และ npm (แนะนำ Node.js 22 ขึ้นไป) และ Git ในเครื่อง ให้เจ้าของนำโฟลเดอร์นี้ขึ้น Git repository ของตนก่อน แล้วใช้ URL จริงแทน `<repository-url>`:

```bash
git clone <repository-url>
cd <repository-folder>
npm ci
```

คัดลอก `.env.example` เป็น `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`) จากนั้น:

```bash
npx prisma generate
node -e "const fs=require('node:fs'); fs.closeSync(fs.openSync('dev.db','a'))"
npx prisma migrate deploy
npm run db:seed
npm run dev
```

เปิด http://localhost:3000 คำสั่ง `node -e` สร้างไฟล์ฐานข้อมูลว่างหากยังไม่มี โดยไม่ลบข้อมูลเดิม (ใช้กับค่า DATABASE_URL เริ่มต้น) ข้อมูลเก็บใน SQLite ในเครื่อง คำสั่ง seed สามารถรันซ้ำได้โดยไม่เพิ่มข้อมูลตัวอย่างชื่อเดิม `npm run lint` ตรวจโค้ด และ `npm run build` สร้าง production build; ใช้ `npm start` หลัง build สำเร็จ

**เตรียม Git:** ตรวจว่าไม่มีข้อมูลส่วนตัวหรือความลับในไฟล์ก่อน commit แล้วใช้ `git init`, `git add .`, `git commit` และตั้ง remote ของตนเอง `.env`, ฐานข้อมูล, generated client, uploads และ node_modules ถูก ignore; `.env.example`, schema และ migrations ต้องอยู่ใน Git ทั้งหมด โปรเจกต์นี้ยังไม่ได้เชื่อม remote โดยอัตโนมัติ

## ทดลองข้อมูลตัวอย่างหลัง seed

เปิดหน้าแรกแล้วเลือกตัวอย่าง หรือเข้าหน้าเหล่านี้โดยตรง:

| หน้า | สิ่งที่จะเห็นและลองทำ | เริ่มอ่านโค้ด |
| --- | --- | --- |
| `/todo` | 3 งานตัวอย่าง ลองค้นหา `ค้นหา` แล้วแก้ไขหรือลบ | `app/components/todo-list.tsx` → `app/api/todos/route.ts` |
| `/books` | หนังสือ 3 รายการ ลองค้นหา `ฐานข้อมูล` และแก้รายละเอียด | `app/components/manager.js` → `app/api/[resource]/route.js` |
| `/shop` | 3 หมวดหมู่และ 4 สินค้า รวมแก้วน้ำที่สต็อกเป็น 0; ลองเลือกสินค้าหลายรายการเพื่อปรับสต็อก และเพิ่มสินค้าในตะกร้า | `app/components/manager.js`, `app/components/cart.js` → `app/api/products/bulk/route.js`, `app/api/orders/route.js` |
| `/shop` ส่วนคำสั่งซื้อ | ประวัติตัวอย่างสมุด 2 เล่ม รวม 90 บาท | `app/api/orders/route.js` และความสัมพันธ์ใน `prisma/schema.prisma` |

`npm run db:seed` เพิ่มเฉพาะรายการตัวอย่างที่ยังไม่มี ไม่ลบหรือเขียนทับข้อมูลเดิม หมวดหมู่ สินค้า และหนังสือตรวจจากชื่อ หากเปลี่ยนชื่อรายการตัวอย่างแล้วสั่ง seed อีกครั้ง รายการชื่อเดิมอาจถูกเพิ่มกลับมา ประวัติตัวอย่างใช้ order ID ติดลบและไม่ตัดสต็อกตอน seed; สินค้าที่มีประวัติจะลบไม่ได้ตามข้อจำกัด foreign key รูปภาพตัวอย่างไม่ได้ใส่มา ให้ลองอัปโหลดเองจากหน้าฟอร์ม

## แผนที่อ่าน source

1. `app/components/todo-list.tsx` ดู state, form และ fetch แล้วตามไป `app/api/todos/route.ts` เพื่อดู validation และ Prisma
2. `app/components/manager.js` แสดงฟอร์มและตารางหนังสือ/สินค้า; `app/api/[resource]/route.js` เลือก model ที่อนุญาตและทำ CRUD/search
3. `prisma/schema.prisma` ดู model และ relation; `prisma/migrations/` บันทึกการเปลี่ยน schema
4. `app/api/upload/route.js` รับ FormData ตรวจขนาดและ signature สร้างชื่อสุ่มและเขียนไฟล์
5. `app/components/cart.js` ส่งเฉพาะ id กับจำนวน; `app/api/orders/route.js` อ่านราคาจากฐานข้อมูล ตัดสต็อกและสร้าง order ใน transaction
6. `app/api/products/bulk/route.js` สาธิตอัปเดตค่าเดียวกันและค่าต่างกันแบบทั้งหมดสำเร็จหรือย้อนกลับทั้งหมด

## API ตัวอย่าง

ทุก resource รองรับ `GET /api/todos?q=...`, `/api/books?q=...`, `/api/categories?q=...`, `/api/products?q=...` และ POST, PUT, DELETE ที่ path เดียวกัน (PUT/DELETE ส่ง `id` ใน JSON) การค้นหาใช้ `contains` ของ SQLite; พฤติกรรมตัวพิมพ์เล็กใหญ่ขึ้นกับฐานข้อมูล

```http
POST /api/products
Content-Type: application/json

{ "name": "ปากกา", "price": 20, "stock": 10, "categoryId": 1, "imageUrl": "" }
```

ตอบ `201` พร้อม object สินค้า ราคาเป็นจำนวนเต็มบาท หมวดหมู่ต้องมีอยู่ก่อน `PUT` ส่งฟิลด์เดียวกันพร้อม `id`; `DELETE` ส่ง `{ "id": 1 }` ตอบ `204` เมื่อสำเร็จ และ `404` เมื่อไม่พบ การลบหมวดหมู่ที่มีสินค้า หรือสินค้าที่มีประวัติคำสั่งซื้อ จะถูกปฏิเสธ

```http
PATCH /api/products/bulk
Content-Type: application/json

{ "mode": "same", "ids": [1, 2], "stock": 5 }
```

หรือ `{ "mode": "different", "items": [{ "id": 1, "stock": 3 }, { "id": 2, "stock": 8 }] }` ผลสำเร็จเป็น `{ "updated": 2 }`; หาก id ไม่มีอยู่ ระบบย้อนกลับทั้งหมด

```http
POST /api/orders
Content-Type: application/json

{ "items": [{ "productId": 1, "quantity": 2 }] }
```

ผลสำเร็จ `201` มี `id`, `total`, `items`; หากสินค้าไม่พอ transaction ย้อนกลับ ไม่มี order หรือการตัดสต็อกบางส่วน ตรวจประวัติด้วย `GET /api/orders`

อัปโหลดด้วย `POST /api/upload` แบบ `multipart/form-data` ชื่อช่อง `file` รองรับ PNG, JPEG, WebP ไม่เกิน 5 MB; ผลสำเร็จ `{ "url": "/api/uploads/..." }` นำ URL ใส่ `coverUrl` หรือ `imageUrl` แล้วบันทึกรายการ รูปสินค้าแสดงในฟอร์ม ตารางสินค้า และตะกร้า โดย `app/components/product-image.js` อ่านผ่าน `app/api/uploads/[name]/route.js` (รองรับ URL `/uploads/...` เดิมด้วย) ไฟล์อยู่ใน `public/uploads` ของเครื่อง: ไม่เหมาะกับ serverless หรือหลายเครื่อง และการลบรายการไม่ลบไฟล์อัตโนมัติ

## แนวทางประยุกต์

เริ่มจากกำหนด model/ชนิดข้อมูลและความสัมพันธ์ เพิ่ม migration แล้วสร้าง API ที่ตรวจข้อมูลและจัดการรายการไม่พบ จากนั้นสร้างฟอร์มและเชื่อม `fetch` ถ้าโจทย์มีข้อมูลสัมพันธ์หรือตัดยอดหลายตารางให้พิจารณา transaction; ทดสอบกรณีข้อมูลว่าง id ไม่มีอยู่และยอดไม่พอ นอกเหนือจากกรณีสำเร็จ ห้ามใช้ตัวอย่างนี้แทนการตรวจสิทธิ์และความปลอดภัยสำหรับระบบจริง
