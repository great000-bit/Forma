import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroStage } from "@/components/marketing/hero-stage";
import { Container } from "@/components/marketing/section";
import { templateCount } from "@/templates/catalog";
import { NICHES } from "@/lib/niches";

export function Hero() {
  return (
    <section className="relative -mt-16 md:-mt-18" aria-labelledby="hero-title">
      <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[760px]" aria-hidden="true" />
      <div className="signal-glow pointer-events-none absolute inset-x-0 top-0 h-[760px]" aria-hidden="true" />
      <Container className="relative pt-32 pb-12 md:pt-40 md:pb-16 lg:pt-44">
        {/* The headline paints at once (LCP); only a short un-blur runs on it. */}
        <div className="max-w-[880px]">
          <h1 id="hero-title" className="hero-in text-display-xl-m text-white md:text-display-xl">
            Talk. Watch it{" "}
            <span className="bg-linear-to-r from-[#8fb0ff] to-accent bg-clip-text font-serif font-normal tracking-normal text-transparent italic">
              build.
            </span>
          </h1>
          <p className="hero-in mt-6 max-w-[560px] text-body-lg text-text-soft [animation-delay:80ms]">
            Tell Forma about you and your work. It builds your portfolio while you watch, then
            gives you one link to share.
          </p>
        </div>

        <div className="hero-in mt-10 flex flex-col gap-6 [animation-delay:160ms] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <a href="#waitlist">Join the waitlist</a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-text-soft hover:text-text">
              <a href="#demo">
                See it build
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>
          <Link
            href="/templates"
            className="group inline-flex items-center gap-2 self-start text-body-sm text-text-muted transition-colors hover:text-text md:self-auto"
          >
            <span className="text-text">New:</span> {templateCount()} templates for {NICHES.length} fields
            <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="hero-in mt-14 [animation-delay:260ms] md:mt-20">
          <HeroStage />
        </div>
      </Container>
    </section>
  );
}
