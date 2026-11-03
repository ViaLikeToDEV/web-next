import Link from "next/link";
import Manager from "../components/manager";
import Cart from "../components/cart";

export default function Page() {
  return (
    <main className="shop-page">
      <Link href="/">← หน้าหลัก</Link>
      <h1>ร้านค้าจำลอง</h1>
      <p>
        จัดการสินค้าและทดลองสั่งซื้อ ราคาเป็นจำนวนเต็มหน่วยบาท
        ไม่มีการชำระเงินจริง
      </p>
      <nav className="shop-navigation" aria-label="ส่วนต่าง ๆ ของร้านค้า">
        <a href="#categories">หมวดหมู่</a>
        <a href="#products">สินค้า</a>
        <a href="#cart">ตะกร้าและคำสั่งซื้อ</a>
      </nav>
      <div id="categories">
        <Manager resource="categories" />
      </div>
      <div id="products">
        <Manager resource="products" />
      </div>
      <div id="cart">
        <Cart />
      </div>
    </main>
  );
}
