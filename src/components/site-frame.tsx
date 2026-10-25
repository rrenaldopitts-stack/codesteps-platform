"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The landing page has its own dark navigation and footer. Keep the existing
  // learning workspace layout unchanged on every other route.
  if (pathname === "/") return children;
  return <>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="logo" aria-label="LearnFlow AI home"><span className="logo-mark" aria-hidden="true">{"</>"}</span><span>LearnFlow AI</span></Link>
      <nav aria-label="Main navigation" className="nav">
        <Link href="/courses">My courses</Link><Link href="/playground">Terminal</Link><Link href="/challenges">Practice</Link>
        <Link href="/dashboard" className="button primary small">Start learning <span aria-hidden="true">↗</span></Link>
      </nav>
    </div></header>
    {children}
    <footer className="site-footer"><div className="container footer-inner">
      <Link href="/" className="logo">LearnFlow AI</Link><p>Built for curious minds. One small step at a time.</p>
      <Link href="/dashboard" className="text-link">Keep learning <span aria-hidden="true">↗</span></Link>
    </div></footer>
  </>;
}
