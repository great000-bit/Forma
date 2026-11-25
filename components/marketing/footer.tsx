import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/marketing/section";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-12 py-12 md:py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-[320px]">
            <Link href="/" aria-label="Forma home" className="inline-block rounded-chip">
              <Logo />
            </Link>
            <p className="mt-4 text-body-sm text-text-muted">{siteConfig.tagline}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <p className="text-label text-text">Product</p>
              <ul className="mt-4 flex flex-col gap-3">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="rounded-chip text-body-sm text-text-soft transition-colors duration-150 ease-out hover:text-text"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {siteConfig.socials.length > 0 ? (
              <div>
                <p className="text-label text-text">Follow</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {siteConfig.socials.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-chip text-body-sm text-text-soft transition-colors duration-150 ease-out hover:text-text"
                      >
                        {s.label}
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </nav>
        </div>

        <p className="text-caption text-text-muted">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
