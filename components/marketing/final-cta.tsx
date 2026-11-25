import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { Container, Section } from "@/components/marketing/section";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export function FinalCta() {
  return (
    <Section id="waitlist" aria-labelledby="waitlist-title" className="relative">
      <div
        className="signal-glow pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        aria-hidden="true"
      />
      <Container className="relative">
        <Reveal className="mx-auto max-w-prose text-center">
          <h2 id="waitlist-title" className="text-display-m md:text-display">
            Your work deserves a link.
          </h2>
          <p className="mt-4 text-body-lg text-text-soft">
            Join the waitlist. We&apos;ll let you in before the public launch.
          </p>
        </Reveal>
        <Reveal className="mx-auto mt-12 max-w-[520px]">
          <Card>
            <WaitlistForm />
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}
