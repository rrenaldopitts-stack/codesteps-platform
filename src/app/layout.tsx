import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LearnFlow AI — Learn programming, one breakthrough at a time", template: "%s | LearnFlow AI" },
  description: "Small steps. Real skills. Learn coding foundations, practice with thoughtful AI-guided hints, and build understanding that lasts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
