"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { modules } from "@/lib/curriculum";
import { api } from "@/lib/client-api";
import type { Progress } from "@/lib/types";

export function Dashboard() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api<Progress>("/api/progress").then((value) => { if (active) { setProgress(value); setError(""); } })
      .catch(() => { if (active) setError("Could not load your progress. Please try again."); });
    return () => { active = false; };
  }, [attempt]);
  const completed = progress?.completedLessonIds.length ?? 0;
  const nextModule = modules.find((module) => !module.lessonIds.every((id) => progress?.completedLessonIds.includes(id)));
  return (
    <>
      <div className="stats-grid">
        <div className="stat"><strong>{progress ? completed : "—"} / 4</strong><span>Lessons completed</span></div>
        <div className="stat"><strong>{progress ? progress.completedChallengeIds.length : "—"} / 4</strong><span>Challenges completed</span></div>
        <div className="stat"><strong>{progress ? Math.round(completed / 4 * 100) : "—"}%</strong><span>Learning path progress</span></div>
      </div>
      {error && <p role="alert" className="error-message">{error} <button className="button secondary small" onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
      {!progress && !error && <p role="status">Loading your learning path…</p>}
      <div className="section-heading"><h2>Your learning path</h2>{progress && <p>{nextModule ? "One small step is enough for today." : "You did it! Revisit a lesson or try another challenge."}</p>}</div>
      <div className="module-grid dashboard-grid">{modules.map((module) => {
        const count = module.lessonIds.filter((id) => progress?.completedLessonIds.includes(id)).length;
        const percent = count / module.lessonIds.length * 100;
        return <article key={module.id} className="module-card">
          <div className="card-top"><span className="module-icon" aria-hidden="true">{module.icon}</span><span className="muted">STEP {module.level} · {module.duration}</span></div>
          <h3>{module.title}</h3><p>{module.description}</p>
          <div className="progress-label"><span>{progress ? `${count} of ${module.lessonIds.length} lessons` : "Loading progress"}</span><span>{progress ? `${percent}%` : "—"}</span></div>
          <progress value={percent} max="100" aria-label={`${module.title} progress`} />
          <Link className={`button ${count ? "secondary" : "primary"}`} href={`/lessons/${module.lessonIds.find((id) => !progress?.completedLessonIds.includes(id)) ?? module.lessonIds[0]}`}>{count ? "Revisit lesson" : nextModule?.id === module.id ? "Continue lesson" : "Start lesson"} <span aria-hidden="true">↗</span></Link>
        </article>;
      })}</div>
    </>
  );
}
