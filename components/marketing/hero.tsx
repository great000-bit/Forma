import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildPreview } from "@/components/marketing/build-preview";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/marketing/section";

export function Hero() {
  return (
    <section className="relative" aria-labelledby="hero-title">
      <div className="signal-glow pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden="true" />
      <Container className="relative pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-32 lg:pb-24">
        {/* Not wrapped in Reveal: the headline is the LCP element and must paint immediately */}
        <div className="mx-auto max-w-[840px] text-center">
          <h1 id="hero-title" className="text-display-xl-m md:text-display-xl">
            Talk. Watch it{" "}
            <span className="font-serif font-normal tracking-normal italic">build.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-body-lg text-text-soft">
            Tell Forma about you and your work. It builds your portfolio while you watch, then
            gives you one link to share.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="#waitlist">Join the waitlist</a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <a href="#demo">
                See it build
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        <Reveal className="relative mx-auto mt-16 max-w-[960px] md:mt-24">
          <BuildPreview variant="compact" />
        </Reveal>
      </Container>
    </section>
  );
}
