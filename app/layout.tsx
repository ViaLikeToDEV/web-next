import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Full-stack Exam Guide", description: "ตัวอย่าง Next.js และ Prisma สำหรับฝึกเขียน CRUD" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
