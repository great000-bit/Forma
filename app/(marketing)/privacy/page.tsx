import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", description: "How Forma handles your data." };

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-prose px-6 py-24 text-text-soft">
      <h1 className="text-h2 text-text">Privacy</h1>
      <p className="mt-2 text-caption text-text-muted">Last updated 25 November 2026</p>
      <div className="mt-8 space-y-5 text-body">
        <p>Forma builds portfolios from the answers you give. This page explains what we keep and why.</p>
        <h2 className="text-h3 text-text">What we collect</h2>
        <p>Your email and name when you sign in (including with Google), the answers you type or speak in the interview, and the portfolio we build from them. If you join the waitlist we keep your name, email and field.</p>
        <h2 className="text-h3 text-text">How we use it</h2>
        <p>Only to run Forma: sign you in, build and host your portfolio, and contact you about your account. We do not sell your data. Your answers are sent to our AI provider to write your portfolio and are not used to train their models.</p>
        <h2 className="text-h3 text-text">Visitors to your portfolio</h2>
        <p>We count page views per day and source. No cookies, no IP addresses and nothing that identifies a visitor.</p>
        <h2 className="text-h3 text-text">Payments</h2>
        <p>Paystack handles payments. We never see or store card numbers.</p>
        <h2 className="text-h3 text-text">Your choices</h2>
        <p>You can edit, unpublish or delete your portfolio at any time. To delete your account and all data, email us and we will do it within 7 days.</p>
        <h2 className="text-h3 text-text">Contact</h2>
        <p>greatemmanwori@gmail.com</p>
      </div>
    </main>
  );
}
