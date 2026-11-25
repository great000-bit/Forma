import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main id="main" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6 py-12">
      <div className="grid-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[520px] bg-[radial-gradient(ellipse_55%_60%_at_50%_100%,rgba(47,107,255,0.35),transparent_70%)]" aria-hidden="true" />
      <Link href="/" aria-label="Forma home" className="relative mb-8">
        <Logo />
      </Link>
      <div className="glass relative w-full max-w-[420px] rounded-card p-8">
        <h1 className="mb-6 text-h3">Welcome to Forma</h1>
        <Suspense fallback={<div className="skeleton h-64" />}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
