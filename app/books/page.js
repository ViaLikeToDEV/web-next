import Link from "next/link";
import Manager from "../components/manager";
export default function Page() {
  return (
    <main>
      <Link href="/">← หน้าหลัก</Link>
      <h1>หนังสือ</h1>
      <Manager resource="books" />
    </main>
  );
}
