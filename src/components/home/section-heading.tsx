import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="lf-section-heading mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div><span className="lf-kicker">{eyebrow}</span><h2 className="lf-section-title mt-3">{title}</h2>{description && <p className="lf-muted mt-3 max-w-xl text-sm leading-7">{description}</p>}</div>
    {children}
  </div>;
}
