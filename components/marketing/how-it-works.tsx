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
    <Section id="how-it-works" aria-labelledby="how-title" className="relative">
      <Container>
        <SectionHeader
          id="how-title"
          title="Three steps. About ten minutes."
          description="No templates to wrestle with and no code to touch."
        />
        <RevealGroup className="grid gap-4 md:grid-cols-3 md:gap-5">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <RevealItem key={title} className="h-full">
              <div className="glass group relative h-full overflow-hidden rounded-card p-8 transition-transform duration-300 ease-out hover:-translate-y-1">
                <span
                  className="pointer-events-none absolute -right-2 -bottom-10 font-display text-[160px] leading-none font-semibold text-white/[0.04] tabular-nums transition-colors duration-500 group-hover:text-accent/15"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="relative flex size-12 items-center justify-center rounded-full bg-accent-soft ring-1 ring-accent/40">
                  <Icon className="size-5 text-[#8fb0ff]" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="relative mt-8 text-h3-m md:text-h3">{title}</h3>
                <p className="relative mt-3 max-w-[340px] text-body text-text-soft">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
