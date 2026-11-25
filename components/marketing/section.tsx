import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/reveal";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-page px-6 md:px-8 lg:px-12", className)} {...props} />;
}

/** Vertical rhythm: 48 mobile, 64 tablet, 96 desktop, 128 large desktop. */
export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-12 md:py-16 lg:py-24 2xl:py-32", className)} {...props} />;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mx-auto mb-12 max-w-prose text-center md:mb-16", className)}>
      {eyebrow ? (
        <p className="mb-4 text-caption tracking-[0.08em] text-accent uppercase">{eyebrow}</p>
      ) : null}
      <h2 id={id} className="text-h2-m md:text-h2">
        {title}
      </h2>
      {description ? <p className="mt-4 text-body-lg text-text-soft">{description}</p> : null}
    </Reveal>
  );
}
