import { BuildPreview } from "@/components/marketing/build-preview";
import { Reveal } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

export function LiveDemo() {
  return (
    <Section id="demo" aria-labelledby="demo-title">
      <Container>
        <SectionHeader
          id="demo-title"
          title="This is what building looks like."
          description="Every line comes from your answers. If Forma doesn't know something, it leaves it out instead of guessing."
        />
        <Reveal>
          <BuildPreview variant="full" />
        </Reveal>
      </Container>
    </Section>
  );
}
