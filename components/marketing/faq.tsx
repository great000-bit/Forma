import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/marketing/reveal";
import { Container, Section, SectionHeader } from "@/components/marketing/section";

const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "No. You answer questions, Forma builds the site. You can change any text, colour or section afterwards without seeing a line of code.",
  },
  {
    q: "How long does it take?",
    a: "Most people should go from sign-up to a live link in under ten minutes. The interview is about ten short questions.",
  },
  {
    q: "Will my portfolio look like everyone else's?",
    a: "No. Each field gets its own set of original templates, and your copy is written from your own answers. You can also change fonts, colours and layout.",
  },
  {
    q: "Does Forma make things up about me?",
    a: "No. If it doesn't know something, it leaves that part empty or asks you. Nothing goes on your site that you didn't tell it.",
  },
  {
    q: "Will people find my portfolio on Google?",
    a: "Every portfolio ships with the basics done right, so Google can read it. Pro goes further: Forma checks your site, suggests fixes in plain English and applies them when you say yes. Nobody can promise rankings, but it improves your chances of being found.",
  },
  {
    q: "What if voice doesn't work in my browser?",
    a: "You can type every answer instead. Voice is there if you want it, never required.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes, on Pro. Free portfolios live at yourname.forma.app.",
  },
  {
    q: "When does it launch?",
    a: "We're opening access in waves, starting with Nigeria and the rest of Africa. Join the waitlist and we'll email you when your spot is ready.",
  },
];

export function Faq() {
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <Container>
        <SectionHeader id="faq-title" title="Questions, answered." />
        <Reveal className="mx-auto max-w-prose">
          <Accordion type="single" collapsible className="border-t border-border">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  );
}
