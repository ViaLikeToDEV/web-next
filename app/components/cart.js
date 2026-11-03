"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import ProductImage from "./product-image";

// จำนวนในตะกร้าต้องเป็นจำนวนเต็มและไม่เกินสต็อกล่าสุด
function validQuantity(value, stock) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(Math.trunc(number), 0), stock);
}

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [productResponse, orderResponse] = await Promise.all([
      axios.get("/api/products", { headers: { "Cache-Control": "no-store" } }),
      axios.get("/api/orders", { headers: { "Cache-Control": "no-store" } }),
    ]);
    const latestProducts = productResponse.data;
    setProducts(latestProducts);
    setOrders(orderResponse.data);
    // ปรับตะกร้าเมื่อสต็อกเปลี่ยนหรือลบสินค้าออกจากร้าน
    setCart((previous) =>
      Object.fromEntries(
        latestProducts.map((product) => [
          product.id,
          validQuantity(previous[product.id] ?? 0, product.stock),
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    const refresh = () => {
      void load().catch(() => setMessage("โหลดร้านค้าไม่สำเร็จ"));
    };
    refresh();
    window.addEventListener("shop-change", refresh);
    return () => window.removeEventListener("shop-change", refresh);
  }, [load]);

  function changeQuantity(product, value, add = false) {
    setCart((previous) => ({
      ...previous,
      [product.id]: validQuantity(
        add ? (previous[product.id] ?? 0) + value : value,
        product.stock,
      ),
    }));
  }

  async function checkout() {
    setBusy(true);
    setMessage("");
    try {
      const items = Object.entries(cart)
        .filter(([, quantity]) => quantity > 0)
        .map(([productId, quantity]) => ({
          productId: Number(productId),
          quantity,
        }));
      const { data: result } = await axios.post("/api/orders", { items });
      setCart({});
      setMessage(`สร้างคำสั่งซื้อ #${result.id} แล้ว`);
      await load();
      window.dispatchEvent(new Event("shop-change"));
    } catch (error) {
      setMessage(
        error.response?.data?.error || error.message || "สั่งซื้อไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }

  const total = products.reduce(
    (sum, product) => sum + product.price * (cart[product.id] || 0),
    0,
  );

  return (
    <section className="card shop-cart" aria-labelledby="cart-heading">
      <h2 id="cart-heading">ตะกร้าและคำสั่งซื้อ</h2>
      <p>
        เลือกจำนวนสินค้า แล้วกดสั่งซื้อ
        ระบบตรวจสอบราคาและสต็อกอีกครั้งเมื่อสั่งซื้อ
      </p>
      {products.length === 0 && <p>ยังไม่มีสินค้าในร้าน</p>}
      <div className="shop-products">
        {products.map((product) => (
          <div className="shop-product" key={product.id}>
            <ProductImage url={product.imageUrl} name={product.name} />
            <div className="shop-product-details">
              <strong>{product.name}</strong>
              <p>
                {product.price} บาท ·{" "}
                {product.stock > 0
                  ? `คงเหลือ ${product.stock} ชิ้น`
                  : "สินค้าหมด"}
              </p>
              <label>
                จำนวน {product.name}
                <input
                  type="number"
                  min="0"
                  max={product.stock}
                  step="1"
                  inputMode="numeric"
                  value={cart[product.id] ?? 0}
                  disabled={busy || product.stock === 0}
                  onChange={(event) =>
                    changeQuantity(product, event.target.value)
                  }
                />
              </label>
              <div
                className="shop-quantity-buttons"
                role="group"
                aria-label={`ปรับจำนวน ${product.name}`}
              >
                <button
                  type="button"
                  disabled={busy || (cart[product.id] ?? 0) >= product.stock}
                  onClick={() => changeQuantity(product, 5, true)}
                >
                  +5
                </button>
                <button
                  type="button"
                  disabled={busy || (cart[product.id] ?? 0) >= product.stock}
                  onClick={() => changeQuantity(product, 10, true)}
                >
                  +10
                </button>
                <button
                  type="button"
                  disabled={busy || !cart[product.id]}
                  onClick={() => changeQuantity(product, 0)}
                >
                  ตั้งเป็น 0
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p>
        <strong>ยอดประมาณการ: {total} บาท</strong>
      </p>
      <button
        type="button"
        disabled={busy || !Object.values(cart).some((quantity) => quantity > 0)}
        onClick={() => void checkout()}
      >
        {busy ? "กำลังสั่งซื้อ..." : "สั่งซื้อ"}
      </button>
      {message && <p role="status">{message}</p>}
      <h3>คำสั่งซื้อที่ผ่านมา</h3>
      {orders.length === 0 && <p>ยังไม่มีคำสั่งซื้อ</p>}
      {orders.map((order) => (
        <div key={order.id}>
          <strong>
            #{order.id} — {order.total} บาท
          </strong>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.name} × {item.quantity} @ {item.price} บาท
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
