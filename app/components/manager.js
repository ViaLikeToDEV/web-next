"use client";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import ProductImage from "./product-image";
// กำหนดช่องข้อมูลของแต่ละประเภทไว้ในที่เดียว
const config = {
  books: {
    label: "หนังสือ",
    fields: [
      ["title", "ชื่อ"],
      ["description", "รายละเอียด"],
      ["coverUrl", "รูปปก"],
    ],
  },
  categories: { label: "หมวดหมู่", fields: [["name", "ชื่อหมวดหมู่"]] },
  products: {
    label: "สินค้า",
    fields: [
      ["name", "ชื่อสินค้า"],
      ["price", "ราคา (บาท)"],
      ["stock", "สต็อก"],
      ["categoryId", "หมวดหมู่"],
      ["imageUrl", "รูปสินค้า"],
    ],
  },
};
const initial = (resource) =>
  Object.fromEntries(config[resource].fields.map(([key]) => [key, ""]));
export default function Manager({ resource }) {
  // ข้อมูลที่แสดง ฟอร์ม และสถานะการทำงาน
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(() => initial(resource));
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkStock, setBulkStock] = useState("");
  const [stocks, setStocks] = useState({});

  // โหลดรายการและหมวดหมู่ที่ใช้ในฟอร์มสินค้า
  const refresh = useCallback(async () => {
    const res = await axios.get(`/api/${resource}`, {
      params: { q },
      headers: { "Cache-Control": "no-store" },
    });
    setRows(res.data);
    if (resource === "products") {
      const c = await axios.get("/api/categories", {
        headers: { "Cache-Control": "no-store" },
      });
      setCategories(c.data);
    }
  }, [resource, q]);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await refresh();
      } catch (e) {
        if (active) setMessage(e.message);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [refresh]);
  useEffect(() => {
    const listener = () => {
      void refresh().catch((e) => setMessage(e.message));
    };
    window.addEventListener("shop-change", listener);
    return () => window.removeEventListener("shop-change", listener);
  }, [refresh]);
  async function send(url, method, body) {
    const res = await axios.request({ url, method, data: body });
    return res.status === 204 ? null : res.data;
  }
  // ทุกการบันทึกใช้ขั้นตอนแจ้งผลและโหลดข้อมูลใหม่ร่วมกัน
  async function action(fn) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await refresh();
      setMessage("บันทึกสำเร็จ");
      window.dispatchEvent(new Event("shop-change"));
    } catch (e) {
      setMessage(e.response?.data?.error || e.message || "เชื่อมต่อไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setEditing(null);
    setForm(initial(resource));
  }
  async function upload(event, key) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const data = new FormData();
      data.append("file", file);
      const { data: result } = await axios.post("/api/upload", data);
      setForm((f) => ({ ...f, [key]: result.url }));
      setMessage("อัปโหลดแล้ว อย่าลืมกดบันทึก");
    } catch (e) {
      setMessage(e.response?.data?.error || e.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <h2>จัดการ{config[resource].label}</h2>
      <label>
        ค้นหา
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelected([]);
            setStocks({});
          }}
        />
      </label>
      <form
        className="stack manager-form"
        onSubmit={(e) => {
          e.preventDefault();
          void action(async () => {
            await send(`/api/${resource}`, editing ? "PUT" : "POST", {
              ...form,
              ...(editing ? { id: editing } : {}),
            });
            reset();
          });
        }}
      >
        {config[resource].fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {key === "categoryId" ? (
              <select
                required
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={key === "price" || key === "stock" ? "number" : "text"}
                min={key === "price" || key === "stock" ? 0 : undefined}
                step={1}
                required={["title", "name", "price", "stock"].includes(key)}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
            {(key === "coverUrl" || key === "imageUrl") && (
              <input
                aria-label={`อัปโหลด${label}`}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void upload(e, key)}
              />
            )}
            {key === "imageUrl" && form[key] && (
              <ProductImage url={form[key]} name={form.name} />
            )}
          </label>
        ))}
        <div className="row">
          <button disabled={busy}>
            {editing ? "บันทึกการแก้ไข" : "เพิ่ม"}
          </button>
          {editing && (
            <button type="button" onClick={reset}>
              ยกเลิก
            </button>
          )}
        </div>
      </form>
      {message && <p role="status">{message}</p>}
      <div className="scroll">
        <table>
          <thead>
            <tr>
              {resource === "products" && <th>เลือก</th>}
              <th>ID</th>
              {config[resource].fields.map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {resource === "products" && (
                  <td>
                    <input
                      aria-label={`เลือก ${row.name}`}
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, row.id]
                            : selected.filter((id) => id !== row.id),
                        )
                      }
                    />
                  </td>
                )}
                <td>{row.id}</td>
                {config[resource].fields.map(([key]) => (
                  <td key={key}>
                    {key === "categoryId" ? (
                      row.category?.name
                    ) : key === "stock" && resource === "products" ? (
                      <input
                        aria-label={`สต็อกใหม่ ${row.name}`}
                        type="number"
                        min="0"
                        value={stocks[row.id] ?? row.stock}
                        onChange={(e) =>
                          setStocks({ ...stocks, [row.id]: e.target.value })
                        }
                      />
                    ) : key === "imageUrl" ? (
                      <ProductImage url={row[key]} name={row.name} />
                    ) : key === "coverUrl" && row[key] ? (
                      <a href={row[key]} target="_blank" rel="noreferrer">
                        ดูรูป
                      </a>
                    ) : row[key] || row[key] === 0 ? (
                      String(row[key])
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
                <td>
                  <div className="row">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditing(row.id);
                        setForm(
                          Object.fromEntries(
                            config[resource].fields.map(([key]) => [
                              key,
                              row[key] ?? "",
                            ]),
                          ),
                        );
                      }}
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm("ลบรายการนี้?"))
                          void action(() =>
                            send(`/api/${resource}`, "DELETE", { id: row.id }),
                          );
                      }}
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {resource === "products" && (
        <div className="stack">
          <p>
            เลือกสินค้าเพื่ออัปเดตหลายรายการ
            (ช่องสต็อกในตารางใช้กับแบบค่าต่างกัน)
          </p>
          <label>
            สต็อกเดียวกัน
            <input
              type="number"
              min="0"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
            />
          </label>
          <div className="row">
            <button
              type="button"
              disabled={busy || !selected.length || bulkStock === ""}
              onClick={() =>
                void action(async () => {
                  await send("/api/products/bulk", "PATCH", {
                    mode: "same",
                    ids: selected,
                    stock: Number(bulkStock),
                  });
                  setSelected([]);
                  setStocks({});
                })
              }
            >
              ตั้งสต็อกเท่ากัน
            </button>
            <button
              type="button"
              disabled={busy || !selected.length}
              onClick={() =>
                void action(async () => {
                  const items = selected.map((id) => {
                    const row = rows.find((r) => r.id === id);
                    const value = stocks[id] ?? row?.stock;
                    return {
                      id,
                      stock:
                        value === "" || value === undefined
                          ? null
                          : Number(value),
                    };
                  });
                  await send("/api/products/bulk", "PATCH", {
                    mode: "different",
                    items,
                  });
                  setSelected([]);
                  setStocks({});
                })
              }
            >
              บันทึกสต็อกแต่ละรายการ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
