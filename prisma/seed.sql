-- ข้อมูลตัวอย่างสำหรับเรียนรู้: รันซ้ำได้โดยไม่ลบหรือแก้ข้อมูลเดิม
-- หากแก้ชื่อรายการตัวอย่างเอง การ seed ครั้งถัดไปอาจเพิ่มรายการชื่อตั้งต้นกลับมา
BEGIN TRANSACTION;

-- Todo: id คงที่ทำให้รันซ้ำได้ แม้มีงานอื่นอยู่ในฐานข้อมูลแล้ว
INSERT OR IGNORE INTO "Todo" ("id", "title") VALUES
  ('sample-todo', 'ฝึกสร้าง CRUD'),
  ('sample-todo-search', 'ลองค้นหางาน'),
  ('sample-todo-edit', 'ลองแก้ไขและลบรายการ');

-- หนังสือ: ใช้ชื่อป้องกันข้อมูลตัวอย่างซ้ำโดยไม่แก้รายการเดิม
INSERT INTO "Book" ("title", "description")
SELECT 'หนังสือฝึกเขียนโปรแกรม', 'ตัวอย่างข้อมูลหนังสือ' WHERE NOT EXISTS (SELECT 1 FROM "Book" WHERE "title" = 'หนังสือฝึกเขียนโปรแกรม');
INSERT INTO "Book" ("title", "description")
SELECT 'เริ่มต้นฐานข้อมูล', 'ฝึกออกแบบตารางและความสัมพันธ์' WHERE NOT EXISTS (SELECT 1 FROM "Book" WHERE "title" = 'เริ่มต้นฐานข้อมูล');
INSERT INTO "Book" ("title", "description")
SELECT 'คู่มือ REST API', 'ตัวอย่างการรับข้อมูลและตอบกลับ' WHERE NOT EXISTS (SELECT 1 FROM "Book" WHERE "title" = 'คู่มือ REST API');

-- หมวดหมู่ต้องมีอยู่ก่อนสินค้า เพราะ Product มี foreign key categoryId
INSERT OR IGNORE INTO "Category" ("name") VALUES ('เครื่องเขียน'), ('อุปกรณ์ไอที'), ('ของใช้');
INSERT INTO "Product" ("name", "price", "stock", "categoryId")
SELECT 'สมุด', 45, 10, "id" FROM "Category" WHERE "name" = 'เครื่องเขียน' AND NOT EXISTS (SELECT 1 FROM "Product" WHERE "name" = 'สมุด');
INSERT INTO "Product" ("name", "price", "stock", "categoryId")
SELECT 'ปากกา', 20, 25, "id" FROM "Category" WHERE "name" = 'เครื่องเขียน' AND NOT EXISTS (SELECT 1 FROM "Product" WHERE "name" = 'ปากกา');
INSERT INTO "Product" ("name", "price", "stock", "categoryId")
SELECT 'เมาส์', 250, 5, "id" FROM "Category" WHERE "name" = 'อุปกรณ์ไอที' AND NOT EXISTS (SELECT 1 FROM "Product" WHERE "name" = 'เมาส์');
INSERT INTO "Product" ("name", "price", "stock", "categoryId")
SELECT 'แก้วน้ำ', 120, 0, "id" FROM "Category" WHERE "name" = 'ของใช้' AND NOT EXISTS (SELECT 1 FROM "Product" WHERE "name" = 'แก้วน้ำ');

-- ประวัติตัวอย่างหนึ่งรายการใช้ id ติดลบ เพื่อไม่ชน id ที่ SQLite สร้างตามปกติ
-- เป็น snapshot ราคาขณะสั่งซื้อ; การ seed ไม่ตัดสต็อกของข้อมูลที่มีอยู่
INSERT OR IGNORE INTO "Order" ("id", "total") VALUES (-67160302, 90);
INSERT INTO "OrderItem" ("orderId", "productId", "name", "price", "quantity")
SELECT -67160302, "id", 'สมุด (ตัวอย่าง seed)', 45, 2 FROM "Product"
WHERE "name" = 'สมุด' AND EXISTS (SELECT 1 FROM "Order" WHERE "id" = -67160302 AND "total" = 90)
AND NOT EXISTS (SELECT 1 FROM "OrderItem" WHERE "orderId" = -67160302) LIMIT 1;

COMMIT;
