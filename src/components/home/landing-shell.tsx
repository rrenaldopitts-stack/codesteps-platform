"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, CodeXml, Menu, Moon, Sparkles, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { label: "Home", href: "/", current: true },
  { label: "Learning Paths", href: "#learning-paths" },
  { label: "Courses", href: "/courses" },
  { label: "Practice", href: "/challenges" },
  { label: "Dashboard", href: "/dashboard" },
];

export function LandingShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  return <div className="learnflow-home min-h-screen" data-theme={dark ? "dark" : "light"}>
    <div className="lf-announcement flex items-center justify-center gap-2 px-5 py-2.5 text-center text-xs">
      <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
      <span>Your next breakthrough starts with a little curiosity.</span>
      <span className="lf-announcement-tag hidden sm:inline">LET&apos;S BUILD SOMETHING</span>
    </div>
    <header className="lf-header">
      <div className="lf-container flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="lf-brand inline-flex shrink-0 items-center gap-2.5" aria-label="LearnFlow AI home">
          <span className="lf-logo-icon grid size-9 place-items-center rounded-lg"><CodeXml className="size-5" aria-hidden="true" /></span>
          <span>LearnFlow<span className="lf-brand-ai ml-1.5">AI</span></span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => <Link className="lf-nav-link" href={item.href} key={item.label} aria-current={item.current ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={!dark}>
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/account">Sign In</Link></Button>
          <Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/courses/new">Get Started <ArrowUpRight aria-hidden="true" /></Link></Button>
          <button ref={menuButton} type="button" className="lf-button lf-button-ghost grid size-10 place-items-center rounded-lg lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="home-mobile-navigation" onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav id="home-mobile-navigation" aria-label="Mobile navigation" hidden={!open} className="lf-mobile-nav lg:hidden">
        <div className="lf-container flex flex-col gap-1 pb-5">
          {navigation.map((item) => <Link className="lf-nav-link rounded-lg px-3 py-3" href={item.href} key={item.label} aria-current={item.current ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <div className="mt-3 flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/account" onClick={() => setOpen(false)}>Sign In</Link></Button><Button asChild><Link href="/courses/new" onClick={() => setOpen(false)}>Get Started <ArrowUpRight aria-hidden="true" /></Link></Button></div>
        </div>
      </nav>
    </header>
    {children}
  </div>;
}
