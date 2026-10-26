"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { challenges, lessons, modules } from "@/lib/curriculum";
import { api } from "@/lib/client-api";
import type { Progress } from "@/lib/types";
import type { PracticeSummary } from "@/lib/practice-types";

export function Dashboard() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [courses, setCourses] = useState<PracticeSummary[] | null>(null);
  const [error, setError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    // Establish one session before requesting its courses.
    api<Progress>("/api/progress").then(async (value) => {
      if (!active) return;
      setProgress(value); setError("");
      try {
        const saved = await api<PracticeSummary[]>("/api/courses");
        if (active) { setCourses(saved); setCourseError(""); }
      } catch {
        if (active) setCourseError("Could not load your saved-course progress. Please retry.");
      }
    })
      .catch(() => { if (active) setError("Could not load your progress. Please try again."); });
    return () => { active = false; };
  }, [attempt]);
  const curriculumCompleted = lessons.filter((lesson) => progress?.completedLessonIds.includes(lesson.id)).length;
  const challengeCompleted = challenges.filter((challenge) => progress?.completedChallengeIds.includes(challenge.id)).length;
  const completed = curriculumCompleted + (courses?.reduce((sum, course) => sum + course.completedCount, 0) ?? 0);
  const total = lessons.length + (courses?.reduce((sum, course) => sum + course.lessonCount, 0) ?? 0);
  const loaded = progress !== null && courses !== null;
  const percent = Math.round(completed / total * 100);
  const xp = completed * 25 + challengeCompleted * 50;
  const nextModule = modules.find((module) => !module.lessonIds.every((id) => progress?.completedLessonIds.includes(id)));
  return (
    <>
      <div className="stats-grid">
        <div className="stat"><strong>{loaded ? `${completed} / ${total}` : "—"}</strong><span>Lessons completed · all courses</span></div>
        <div className="stat"><strong>{progress ? `${challengeCompleted} / ${challenges.length}` : "—"}</strong><span>Challenges completed</span></div>
        <div className="stat"><strong>{loaded ? xp.toLocaleString() : "—"}</strong><span>XP earned from current completions</span></div>
      </div>
      <section className="panel" aria-labelledby="overall-progress-title">
        <h2 id="overall-progress-title">Your overall progress</h2>
        <p>Earn 25 XP per completed lesson and 50 XP per challenge. XP is calculated from your saved work; undoing completion or deleting a course updates your total.</p>
        <div className="progress-label"><span>Starter curriculum and saved courses</span><span>{loaded ? `${percent}%` : "Loading"}</span></div>
        <progress value={loaded ? percent : undefined} max="100" aria-label="Overall lesson progress" />
      </section>
      {error && <p role="alert" className="error-message">{error} <button className="button secondary small" onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
      {courseError && <p role="alert" className="error-message">{courseError} <button className="button secondary small" onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
      {!loaded && !error && !courseError && <p role="status">Loading your learning path…</p>}
      {courses && courses.length > 0 && <>
        <div className="section-heading"><h2>Your notes-based courses</h2><Link href="/courses/new" className="text-link">Create another course</Link></div>
        <div className="module-grid dashboard-grid">{courses.map((course) => <article key={course.id} className="module-card">
          <span className="eyebrow">{course.topic}</span><h3>{course.title}</h3>
          <div className="progress-label"><span>{course.completedCount} of {course.lessonCount} lessons</span><span>{Math.round(course.completedCount / course.lessonCount * 100)}%</span></div>
          <progress value={course.completedCount} max={course.lessonCount} aria-label={`${course.title} progress`} />
          <Link className="button secondary" href={`/courses/${course.id}`}>{course.completedCount === course.lessonCount ? "Revisit course" : "Continue course"} <span aria-hidden="true">↗</span></Link>
        </article>)}</div>
      </>}
      <div className="section-heading"><h2>Your learning path</h2>{progress && <p>{nextModule ? "One small step is enough for today." : "You did it! Revisit a lesson or try another challenge."}</p>}</div>
      <div className="module-grid dashboard-grid">{modules.map((module) => {
        const count = module.lessonIds.filter((id) => progress?.completedLessonIds.includes(id)).length;
        const percent = count / module.lessonIds.length * 100;
        return <article key={module.id} className="module-card">
          <div className="card-top"><span className="module-icon" aria-hidden="true">{module.icon}</span><span className="muted">STEP {module.level} · {module.duration}</span></div>
          <h3>{module.title}</h3><p>{module.description}</p>
          <div className="progress-label"><span>{progress ? `${count} of ${module.lessonIds.length} lessons` : "Loading progress"}</span><span>{progress ? `${percent}%` : "—"}</span></div>
          <progress value={percent} max="100" aria-label={`${module.title} progress`} />
          <Link className={`button ${count ? "secondary" : "primary"}`} href={`/lessons/${module.lessonIds.find((id) => !progress?.completedLessonIds.includes(id)) ?? module.lessonIds[0]}`}>{count === module.lessonIds.length ? "Revisit lesson" : count || nextModule?.id === module.id ? "Continue lesson" : "Start lesson"} <span aria-hidden="true">↗</span></Link>
        </article>;
      })}</div>
    </>
  );
}
