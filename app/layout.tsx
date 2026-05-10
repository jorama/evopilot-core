import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvoPilot",
  description: "AI operating system for startup execution workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <Link href="/" className="text-lg font-semibold">
              EvoPilot
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
              <Link href="/">Dashboard</Link>
              <Link href="/hq">HQ</Link>
              <Link href="/agents">Agents</Link>
              <Link href="/tasks">Tasks</Link>
              <Link href="/projects/new">Add MVP</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
