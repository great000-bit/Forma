import type { CSSProperties, ReactNode } from "react";
import {
  AboutSection,
  ContactSection,
  ExperienceSection,
  ProfileSection,
  ProjectsSection,
  SkillsSection,
} from "@/components/sections/sections";
import { onAccent, safeAccent } from "@/lib/portfolio/accent";
import type { Portfolio, SectionId } from "@/lib/portfolio/schema";
import { cn } from "@/lib/utils";
import { getTemplate, type PresetId } from "@/templates/catalog";

/**
 * Renders any portfolio with any template. Server-safe (no hooks), so it is
 * used for published sites, previews and the live build. `renderSection`
 * lets the builder wrap each section with skeleton and reveal states.
 */
export type SectionWrapper = (id: SectionId, node: ReactNode) => ReactNode;

const fontClass = { sans: "", serif: "[&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif", mono: "[&_h1]:font-mono [&_h2]:font-mono" };

export function PortfolioView({
  portfolio,
  renderSection,
  showBadge = false,
  className,
}: {
  portfolio: Portfolio;
  renderSection?: SectionWrapper;
  showBadge?: boolean;
  className?: string;
}) {
  const template = getTemplate(portfolio.templateId);
  const preset: PresetId = template.preset;
  const { sections, layout, theme } = portfolio;
  const accent = safeAccent(theme.accent, theme.mode);
  const numbered = preset === "dark-editorial";

  const visible = layout.order.filter((id) => !layout.hidden.includes(id));
  const wrap: SectionWrapper = renderSection ?? ((_, node) => node);

  let n = 0;
  const section = (id: SectionId): ReactNode => {
    const num = numbered && id !== "profile" ? ++n : undefined;
    switch (id) {
      case "profile":
        return (
          <ProfileSection
            data={sections.profile}
            variant={preset === "split" ? "split" : preset === "sidebar" ? "compact" : "left"}
          />
        );
      case "about":
        return <AboutSection data={sections.about} number={num} />;
      case "skills":
        return <SkillsSection data={sections.skills} number={num} />;
      case "projects":
        return <ProjectsSection data={sections.projects} variant={preset === "index" ? "index" : "cards"} number={num} />;
      case "experience":
        return <ExperienceSection data={sections.experience} number={num} />;
      case "contact":
        return <ContactSection data={sections.contact} name={sections.profile.name} number={num} />;
    }
  };

  const style = { "--pf-accent": accent, "--pf-on-accent": onAccent(accent) } as CSSProperties;
  const rootClass = cn(
    "bg-bg text-text-soft",
    theme.mode === "dark" && "dark",
    fontClass[theme.font],
    className,
  );

  const body =
    preset === "sidebar" ? (
      <div className="mx-auto grid max-w-page gap-12 px-6 py-12 md:px-8 lg:grid-cols-[320px_1fr] lg:gap-16 lg:px-12 lg:py-24">
        <aside className="lg:sticky lg:top-12 lg:self-start">{visible.includes("profile") ? wrap("profile", section("profile")) : null}</aside>
        <main className="flex flex-col gap-16">
          {visible.filter((id) => id !== "profile").map((id) => (
            <section key={id} aria-label={id}>{wrap(id, section(id))}</section>
          ))}
        </main>
      </div>
    ) : (
      <main className={cn("mx-auto flex flex-col gap-16 px-6 py-12 md:gap-24 md:px-8 lg:py-24", preset === "index" ? "max-w-[880px]" : "max-w-page lg:px-12")}>
        {visible.map((id) => (
          <section key={id} aria-label={id}>{wrap(id, section(id))}</section>
        ))}
      </main>
    );

  return (
    <div className={rootClass} style={style} data-template={template.id}>
      {body}
      {showBadge ? (
        <footer className="pb-8 text-center">
          <a href="https://forma.app" className="text-caption text-text-muted hover:text-text">Built with Forma</a>
        </footer>
      ) : null}
    </div>
  );
}
