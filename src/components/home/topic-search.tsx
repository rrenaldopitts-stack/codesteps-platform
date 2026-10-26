"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { topicPreviews, type TopicPreview } from "@/lib/home-content";

export function TopicSearch() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TopicPreview | null>(null);
  const [error, setError] = useState("");

  function choose(topic: TopicPreview) {
    setQuery(topic.name); setSelected(topic); setError("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = query.trim().toLowerCase();
    const match = normalized && topicPreviews.find((topic) =>
      topic.aliases.includes(normalized) || topic.name.toLowerCase().includes(normalized));
    if (match) choose(match);
    else {
      setSelected(null);
      setError(normalized ? "We don’t have a path preview for that topic yet. Choose one of the topics below." : "Enter a programming topic or choose a suggestion below.");
    }
  }

  return <div className="mx-auto max-w-3xl">
    <form onSubmit={submit} role="search" aria-label="Find a programming learning path" className="lf-search-form flex flex-col gap-3 rounded-xl border p-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="lf-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden="true" />
        <label htmlFor="home-topic" className="sr-only">Programming topic</label>
        <Input id="home-topic" type="search" autoComplete="off" maxLength={80} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null); setError(""); }} placeholder="Try “JavaScript” or “AI Engineering”" className="h-12 border-0 bg-transparent pr-3 pl-12 shadow-none" aria-describedby="topic-search-help topic-search-status" aria-invalid={Boolean(error)} />
      </div>
      <Button type="submit" size="lg"><Sparkles aria-hidden="true" /> Generate Learning Path</Button>
    </form>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-label="Suggested topics">
      <span className="lf-muted mr-1 text-xs">Popular:</span>
      {topicPreviews.map((topic) => <button type="button" key={topic.name} className="lf-topic-chip rounded-md border px-3 py-1.5 text-xs transition-colors" aria-pressed={selected?.name === topic.name} onClick={() => choose(topic)}>{topic.name}</button>)}
    </div>
    <p id="topic-search-help" className="lf-muted mt-4 text-center text-xs">Instant curated previews. Notes-based courses and optional live AI help are available in your workspace.</p>
    <p id="topic-search-status" role="status" className={error ? "lf-search-error mt-4 text-center text-sm" : "sr-only"}>{error || (selected ? `${selected.name} learning path preview is ready below.` : "")}</p>
    {selected && <section className="lf-search-result mt-7 rounded-xl border p-6 text-left" aria-labelledby="selected-topic-title">
      <span className="lf-kicker">CURATED PATH PREVIEW · NOT LIVE AI GENERATION</span>
      <h3 id="selected-topic-title" className="lf-card-title mt-3">{selected.name}: your first steps</h3>
      <p className="lf-muted mt-2 text-sm leading-7">{selected.description}</p>
      <ol className="my-5 grid gap-3 sm:grid-cols-2">{selected.steps.map((step, index) => <li key={step} className="flex items-center gap-2 text-sm"><span className="lf-step-dot grid size-6 shrink-0 place-items-center rounded-full text-xs">{index + 1}</span>{step}</li>)}</ol>
      <Button asChild size="sm"><Link href={selected.href} {...(selected.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{selected.action}<ArrowRight aria-hidden="true" /><span className="sr-only">{selected.href.startsWith("https:") ? " (opens external resource in a new tab)" : ""}</span></Link></Button>
      <span className="lf-muted mt-3 flex items-center gap-1.5 text-xs"><Check className="size-3.5" aria-hidden="true" /> Start with the foundations. Build understanding as you go.</span>
    </section>}
  </div>;
}
