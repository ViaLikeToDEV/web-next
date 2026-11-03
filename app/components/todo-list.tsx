"use client";

import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";

type Todo = { id: string; title: string };

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ยกเลิกคำขอเก่าเมื่อคำค้นเปลี่ยน เพื่อไม่ให้ผลลัพธ์เก่ามาทับรายการล่าสุด
    const controller = new AbortController();
    async function load() {
      try {
        const response = await axios.get<Todo[]>("/api/todos", {
          params: { q: search },
          headers: { "Cache-Control": "no-store" },
          signal: controller.signal,
        });
        setTodos(response.data);
      } catch {
        if (!controller.signal.aborted) {
          setError("โหลดรายการไม่สำเร็จ");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [search]);

  function resetForm() {
    setTitle("");
    setEditingId(null);
  }

  async function save(method: "POST" | "PUT" | "DELETE", id?: string) {
    setBusy(true);
    setError("");
    try {
      const response = await axios.request<Todo>({
        url: "/api/todos",
        method,
        params: { q: search },
        data: { id, title },
      });
      if (method === "DELETE") {
        setTodos((current) => current.filter((todo) => todo.id !== id));
        if (editingId === id) resetForm();
      } else {
        const saved = response.data;
        setTodos((current) =>
          method === "POST"
            ? [...current, saved]
            : current.map((todo) => (todo.id === saved.id ? saved : todo)),
        );
        resetForm();
      }
    } catch (error) {
      setError(
        axios.isAxiosError(error) &&
          typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(editingId ? "PUT" : "POST", editingId ?? undefined);
  }

  const buttonClassName =
    "min-h-11 cursor-pointer rounded border border-current px-3 disabled:cursor-wait disabled:opacity-50 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2";

  function handleEdit(todo: Todo) {
    setEditingId(todo.id);
    setTitle(todo.title);
    document.getElementById("todo-title")?.focus();
  }

  return (
    <section
      lang="th"
      className="mt-6 w-full max-w-xl"
      aria-labelledby="todo-heading"
    >
      <h2 id="todo-heading" className="text-3xl font-bold">
        Todo List
      </h2>

      {/* htmlFor เชื่อม label กับ input ที่มี id ตรงกัน */}
      <label htmlFor="todo-search">ค้นหางาน</label>
      <input
        id="todo-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="ml-2"
      />
      <form onSubmit={handleSubmit} className="my-6 space-y-2">
        <label htmlFor="todo-title" className="block font-medium">
          {editingId ? "แก้ไขงาน" : "งานที่ต้องทำ"}
        </label>
        <input
          id="todo-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={200}
          disabled={busy || loading}
          className="min-h-11 w-full rounded border border-current px-3"
        />
        <div className="flex gap-2">
          <button
            className={buttonClassName}
            disabled={busy || loading || !title.trim()}
          >
            {busy ? "กำลังบันทึก..." : editingId ? "บันทึก" : "เพิ่มงาน"}
          </button>
          {editingId && (
            <button
              type="button"
              className={buttonClassName}
              onClick={resetForm}
              disabled={busy}
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="mb-4">
          เกิดข้อผิดพลาด: {error}{" "}
          <button
            type="button"
            className="cursor-pointer underline"
            onClick={() => window.location.reload()}
          >
            โหลดใหม่
          </button>
        </p>
      )}
      <div aria-live="polite">
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : todos.length === 0 ? (
          <p>ยังไม่มีรายการ เพิ่มงานแรกได้เลย</p>
        ) : (
          <p className="mb-2">ทั้งหมด {todos.length} รายการ</p>
        )}
      </div>
      <ul className="divide-y divide-current">
        {todos.map((todo) => (
          <li key={todo.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="min-w-0 flex-1 break-all">{todo.title}</span>
            <div className="flex gap-2">
              <button
                type="button"
                className={buttonClassName}
                disabled={busy || loading}
                aria-label={`แก้ไข ${todo.title}`}
                onClick={() => handleEdit(todo)}
              >
                แก้ไข
              </button>
              <button
                type="button"
                className={buttonClassName}
                disabled={busy || loading}
                aria-label={`ลบ ${todo.title}`}
                onClick={() => void save("DELETE", todo.id)}
              >
                ลบ
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
