"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LearningJournal() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" className="lf-footer-link" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>Blog</button>
    <dialog ref={dialog} className="lf-journal rounded-2xl border p-6 sm:p-8" aria-labelledby="journal-heading">
      <div className="mb-6 flex items-start justify-between gap-5"><div><span className="lf-kicker">THE LEARNING JOURNAL</span><h2 id="journal-heading" className="lf-section-title mt-2 !text-2xl">A better way to get unstuck.</h2></div><Button variant="ghost" size="icon" aria-label="Close learning journal" onClick={() => dialog.current?.close()}><X aria-hidden="true" /></Button></div>
      <article className="space-y-4"><p className="lf-muted text-sm leading-7">Before asking AI for a solution, write down three things: what you expected, what happened, and the smallest example that shows the problem.</p><h3 className="lf-card-title">Ask for a hint, not a rewrite.</h3><p className="lf-muted text-sm leading-7">Try: “What concept am I missing? Give me one hint without the full solution.” Test the change yourself, then explain why it works in your own words.</p><h3 className="lf-card-title">Keep a five-line recap.</h3><p className="lf-muted text-sm leading-7">What you built. What broke. How you fixed it. One new idea. One question for tomorrow. That reflection turns a working snippet into a skill you can reuse.</p></article>
      <Button className="mt-6" onClick={() => dialog.current?.close()}>Got it. Back to learning.</Button>
    </dialog>
  </>;
}
