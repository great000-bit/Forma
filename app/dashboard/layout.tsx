import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutGrid, LayoutTemplate, LogOut, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { currentUser } from "@/lib/supabase/auth-server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const nav = [
  { href: "/dashboard", label: "Portfolios", icon: LayoutGrid },
  { href: "/builder", label: "New portfolio", icon: Sparkles },
  { href: "/#templates", label: "Templates", icon: LayoutTemplate },
];

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");

  const initial = (user.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="relative flex min-h-dvh bg-bg">
      <div className="signal-glow pointer-events-none fixed inset-x-0 top-0 h-[520px]" aria-hidden="true" />
      <aside className="relative hidden w-[260px] shrink-0 flex-col border-r border-border bg-white/[0.02] p-6 backdrop-blur-2xl lg:flex">
        <Link href="/" aria-label="Forma home" className="mb-8">
          <Logo />
        </Link>
        <nav aria-label="Dashboard" className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex h-11 items-center gap-3 rounded-control px-3 text-body-sm text-text-soft transition-colors duration-150 hover:bg-accent-soft hover:text-text">
              <Icon className="size-5 text-text-muted" strokeWidth={1.5} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="glass mt-auto rounded-card p-5">
          <p className="text-label text-text">Free plan</p>
          <p className="mt-1 text-body-sm text-text-soft">One portfolio and a forma link. Pro arrives at launch.</p>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-black/60 px-6 backdrop-blur-2xl">
          <Link href="/" aria-label="Forma home" className="lg:hidden"><Logo /></Link>
          <span className="hidden text-label text-text lg:block">Dashboard</span>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-label text-accent" title={user.email ?? undefined}>
              {initial}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" aria-label="Sign out" className="inline-flex size-11 items-center justify-center rounded-control text-text-muted hover:bg-accent-soft hover:text-text">
                <LogOut className="size-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
