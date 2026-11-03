import Link from "next/link";
import TodoList from "../components/todo-list";
export default function Page() {
  return (
    <main>
      <Link href="/">← หน้าหลัก</Link>
      <TodoList />
    </main>
  );
}
