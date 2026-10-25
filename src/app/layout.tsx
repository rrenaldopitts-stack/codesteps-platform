import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CodeSteps — Learn to code alongside AI", template: "%s | CodeSteps" },
  description: "Small steps. Real skills. Learn coding foundations, practice with thoughtful AI-guided hints, and build understanding that lasts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <header className="site-header"><div className="container header-inner">
          <Link href="/" className="logo" aria-label="CodeSteps home"><span className="logo-mark" aria-hidden="true">{"</>"}</span><span>codeSteps<span className="logo-dot">.</span></span></Link>
          <nav aria-label="Main navigation" className="nav">
            <Link href="/courses">My courses</Link>
            <Link href="/playground">Terminal</Link>
            <Link href="/challenges">Practice</Link>
            <Link href="/dashboard" className="button primary small">Start learning <span aria-hidden="true">↗</span></Link>
          </nav>
        </div></header>
        {children}
        <footer className="site-footer"><div className="container footer-inner">
          <Link href="/" className="logo">codeSteps<span className="logo-dot">.</span></Link>
          <p>Built for curious minds. One small step at a time.</p>
          <Link href="/dashboard" className="text-link">Keep learning <span aria-hidden="true">↗</span></Link>
        </div></footer>
      </body>
    </html>
  );
}
