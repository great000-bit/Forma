import { Link2, Mic, Sparkles } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

const steps = [
  {
    icon: Mic,
    title: "Talk",
    body: "Answer a few short questions by voice or text. Who you are, what you do, the work you're proud of.",
  },
  {
    icon: Sparkles,
    title: "Watch it build",
    body: "Forma writes your copy and lays out each section in front of you. Change anything after.",
  },
  {
    icon: Link2,
    title: "Share one link",
    body: "Publish to yourname.forma.app and send it to anyone who wants to work with you.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" aria-labelledby="how-title" className="border-y border-border bg-surface">
      <Container>
        <SectionHeader
          id="how-title"
          title="Three steps. About ten minutes."
          description="No templates to wrestle with and no code to touch."
        />
        <RevealGroup className="grid gap-12 md:grid-cols-3 md:gap-6">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <RevealItem key={title}>
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-control bg-accent-soft">
                  <Icon className="size-6 text-accent" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="text-caption text-text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 text-h3-m md:text-h3">{title}</h3>
              <p className="mt-3 max-w-[340px] text-body text-text-soft">{body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
