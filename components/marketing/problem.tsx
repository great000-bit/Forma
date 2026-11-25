import { Braces, EyeOff, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
        <RevealGroup className="grid gap-4 md:grid-cols-6 md:gap-5">
          {problems.map(({ icon: Icon, title, body }, i) => (
            <RevealItem key={title} className={i === 0 ? "h-full md:col-span-3 md:row-span-2" : "h-full md:col-span-3"}>
              <Card interactive className={cn("relative h-full overflow-hidden", i === 0 && "md:flex md:flex-col md:justify-end md:min-h-[360px]")}>
                {i === 0 ? (
                  <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
                ) : null}
                <span className="relative flex size-12 items-center justify-center rounded-full border border-border bg-white/[0.04]">
                  <Icon className="size-5 text-[#8fb0ff]" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="relative mt-6 text-h3-m md:text-h3">{title}</h3>
                <p className="relative mt-3 text-body text-text-soft">{body}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
