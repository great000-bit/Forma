import { NICHES } from "@/lib/niches";
import { nicheIcons } from "@/components/marketing/niche-icons";
import { Reveal } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

export function Niches() {
  return (
    <Section aria-labelledby="niches-title">
      <Container>
        <SectionHeader
          id="niches-title"
          title="Made for the work you actually do."
          description={`A data scientist's portfolio shouldn't look like a photographer's. Forma has its own templates for ${NICHES.length} fields.`}
        />
        <Reveal>
          <ul className="mx-auto flex max-w-[960px] flex-wrap justify-center gap-3">
            {NICHES.map((niche) => {
              const Icon = nicheIcons[niche.slug];
              return (
                <li
                  key={niche.slug}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/[0.03] px-4 text-body-sm text-text-soft backdrop-blur-xl transition-[transform,box-shadow,border-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/50 hover:text-text hover:shadow-[0_0_24px_-4px_rgba(47,107,255,0.5)]"
                >
                  <Icon className="size-4 text-[#8fb0ff]" strokeWidth={1.5} aria-hidden="true" />
                  {niche.label}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
