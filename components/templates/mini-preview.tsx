import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { samplePortfolio } from "@/lib/portfolio/sample";

/**
 * A real render of the template with sample content, scaled to a quarter.
 * Hidden from assistive tech and not focusable: the card link is the control.
 */
export function MiniPreview({ niche, templateId }: { niche: string; templateId: string }) {
  return (
    <div className="pointer-events-none relative aspect-[4/3] overflow-hidden select-none" aria-hidden="true" inert>
      <div className="absolute top-0 left-0 w-[400%] origin-top-left scale-25">
        <PortfolioView portfolio={samplePortfolio(niche, templateId)} />
      </div>
    </div>
  );
}
