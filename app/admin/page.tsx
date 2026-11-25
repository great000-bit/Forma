import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { currentUser } from "@/lib/supabase/auth-server";
import { isAdminEmail } from "@/lib/admin/access";
import { adminStats } from "@/lib/admin/stats";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-card p-5">
      <p className="text-body-sm text-text-muted">{label}</p>
      <p className="mt-2 text-h2 text-text tabular-nums">{value.toLocaleString("en-NG")}</p>
    </div>
  );
}

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) notFound();

  const stats = await adminStats();

  return (
    <div className="relative min-h-dvh bg-bg">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link href="/" aria-label="Forma home"><Logo /></Link>
        <Link href="/dashboard" className="text-label text-text-soft hover:text-text">Dashboard</Link>
      </header>
      <main id="main" className="mx-auto max-w-[1100px] p-6 lg:p-8">
        <h1 className="text-h2 text-text">Admin</h1>
        {!stats ? (
          <p className="mt-4 text-body text-text-soft">
            Add SUPABASE_SERVICE_ROLE_KEY in Vercel to see totals.
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
              <Stat label="Waitlist" value={stats.waitlist} />
              <Stat label="Portfolios" value={stats.portfolios} />
              <Stat label="Published" value={stats.published} />
              <Stat label="Pro" value={stats.pro} />
              <Stat label="Views, 7 days" value={stats.views7d} />
            </div>

            <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
              <div className="glass rounded-card p-5">
                <h2 className="text-label text-text">Portfolios by niche</h2>
                <ul className="mt-3 space-y-2">
                  {stats.byNiche.length === 0 && <li className="text-body-sm text-text-muted">None yet.</li>}
                  {stats.byNiche.map((n) => (
                    <li key={n.niche} className="flex justify-between text-body-sm text-text-soft">
                      <span>{n.niche}</span>
                      <span className="tabular-nums text-text">{n.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass overflow-x-auto rounded-card p-5">
                <h2 className="text-label text-text">Latest waitlist</h2>
                <table className="mt-3 w-full text-left text-body-sm">
                  <thead className="text-text-muted">
                    <tr><th className="py-2 pr-4 font-normal">Name</th><th className="py-2 pr-4 font-normal">Email</th><th className="py-2 pr-4 font-normal">Niche</th><th className="py-2 font-normal">Joined</th></tr>
                  </thead>
                  <tbody className="text-text-soft">
                    {stats.recentWaitlist.map((w) => (
                      <tr key={w.email} className="border-t border-border">
                        <td className="py-2 pr-4 text-text">{w.name}</td>
                        <td className="py-2 pr-4">{w.email}</td>
                        <td className="py-2 pr-4">{w.niche}</td>
                        <td className="py-2">{new Date(w.created_at).toLocaleDateString("en-NG")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
