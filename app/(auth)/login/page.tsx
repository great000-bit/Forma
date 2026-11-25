import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 py-12">
      <Link href="/" aria-label="Forma home" className="mb-8">
        <Logo />
      </Link>
      <div className="w-full max-w-[420px] rounded-card border border-border bg-surface p-8 shadow-card">
        <h1 className="mb-6 text-h3">Welcome to Forma</h1>
        <Suspense fallback={<div className="skeleton h-64" />}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
