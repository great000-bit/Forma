import { Braces, EyeOff, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

const problems = [
  {
    icon: EyeOff,
    title: "No portfolio",
    body: "Your best work sits in a Drive folder, an old Behance draft and a few posts nobody can find.",
  },
  {
    icon: Braces,
    title: "Can't code",
    body: "Website builders still expect you to think like a developer. Hours later, it still looks off.",
  },
  {
    icon: Wallet,
    title: "Can't afford a developer",
    body: "A custom site costs more than most people want to spend before the work starts paying.",
  },
];

export function Problem() {
  return (
    <Section aria-labelledby="problem-title">
      <Container>
        <SectionHeader
          id="problem-title"
          title="Good work. Nowhere to send people."
          description="When someone asks for your portfolio, you shouldn't have to apologise first."
        />
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, body }) => (
            <RevealItem key={title} className="h-full">
              <Card className="h-full">
                <span className="flex size-12 items-center justify-center rounded-control border border-border bg-bg">
                  <Icon className="size-6 text-text-muted" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-h3-m md:text-h3">{title}</h3>
                <p className="mt-3 text-body text-text-soft">{body}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
