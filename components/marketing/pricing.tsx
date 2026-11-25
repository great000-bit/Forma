import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

const plans = [
  {
    name: "Free",
    price: "Free",
    note: "For getting your work online",
    features: [
      "One portfolio on yourname.forma.app",
      "SEO basics handled for you",
      "WhatsApp button, contact form and QR code",
      "Import your CV to skip questions",
      "Basic analytics",
      "Some AI edits each month",
      "Small Forma badge on your site",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Price at launch",
    note: "For people who send their link a lot",
    features: [
      "Everything in Free",
      "Forma SEO: we help people find you on Google",
      "Your own domain, no Forma badge",
      "Unlimited AI edits and case studies",
      "A portfolio coach that suggests what to improve",
      "Tailored links for each job or client",
      "Full analytics and priority support",
    ],
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <Section id="pricing" aria-labelledby="pricing-title">
      <Container>
        <SectionHeader
          id="pricing-title"
          title="Start free. Upgrade when it pays."
          description="Naira prices in Nigeria, dollars everywhere else. Everyone on the waitlist gets in before the public launch."
        />
        <RevealGroup className="mx-auto grid max-w-[880px] gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <RevealItem key={plan.name} className="h-full">
              <Card
                className={cn(
                  "flex h-full flex-col",
                  plan.highlighted && "glow-edge border-transparent",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-h3-m md:text-h3">{plan.name}</h3>
                  {plan.highlighted ? <Badge variant="accent">Most complete</Badge> : null}
                </div>
                <p className="mt-2 text-body-sm text-text-muted">{plan.note}</p>
                <p className="mt-6 font-display text-h2-m text-text md:text-h2">{plan.price}</p>
                <ul className="mt-8 mb-8 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-body text-text-soft">
                      <Check
                        className={cn("mt-1 size-4 shrink-0", plan.highlighted ? "text-accent" : "text-text-muted")}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="mt-auto w-full"
                >
                  <Link href="/#waitlist">Join the waitlist</Link>
                </Button>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
