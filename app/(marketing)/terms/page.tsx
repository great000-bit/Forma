import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms", description: "The terms for using Forma." };

export default function TermsPage() {
  return (
    <main id="main" className="mx-auto max-w-prose px-6 py-24 text-text-soft">
      <h1 className="text-h2 text-text">Terms</h1>
      <p className="mt-2 text-caption text-text-muted">Last updated 25 November 2026</p>
      <div className="mt-8 space-y-5 text-body">
        <p>By using Forma you agree to these terms.</p>
        <h2 className="text-h3 text-text">Your content</h2>
        <p>You own what you put into Forma and the portfolio it makes. You give us permission to host and show it so your portfolio works. Only publish things you have the right to share.</p>
        <h2 className="text-h3 text-text">Fair use</h2>
        <p>Do not use Forma for anything illegal, misleading or harmful, or to impersonate someone else. We may remove portfolios that do.</p>
        <h2 className="text-h3 text-text">Plans</h2>
        <p>The free plan is free. Pro is billed monthly or yearly through Paystack and can be cancelled any time; it runs to the end of the period you paid for.</p>
        <h2 className="text-h3 text-text">The service</h2>
        <p>We work hard to keep Forma running but cannot promise it will never go down. Forma is provided as is.</p>
        <h2 className="text-h3 text-text">Contact</h2>
        <p>greatemmanwori@gmail.com</p>
      </div>
    </main>
  );
}
