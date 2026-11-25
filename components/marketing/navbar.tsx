"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/marketing/section";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b transition-[background-color,border-color] duration-300 ease-out md:h-18",
        scrolled ? "border-border bg-black/70 backdrop-blur-2xl" : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label="Forma home" className="rounded-chip">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-full px-4 text-body-sm text-text-soft transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="light" className="hidden sm:inline-flex">
            <a href="/#waitlist">Join the waitlist</a>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5!" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <Logo />
              <nav aria-label="Mobile">
                <ul className="flex flex-col">
                  {siteConfig.nav.map((item) => (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className="flex h-12 items-center rounded-control text-body-lg text-text"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-3">
                <SheetClose asChild>
                  <Button asChild size="lg">
                    <a href="/#waitlist">Join the waitlist</a>
                  </Button>
                </SheetClose>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
