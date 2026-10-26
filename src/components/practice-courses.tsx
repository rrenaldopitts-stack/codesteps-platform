"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { PracticeSummary } from "@/lib/practice-types";

export function PracticeCourses() {
  const [courses, setCourses] = useState<PracticeSummary[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api<PracticeSummary[]>("/api/courses").then((result) => { if (active) { setCourses(result); setError(""); } })
      .catch(() => { if (active) setError("Could not load saved courses. Please retry."); });
    return () => { active = false; };
  }, [attempt]);

  if (error) return <div className="panel"><p className="error-message" role="alert">{error}</p><button className="button secondary" onClick={() => setAttempt(attempt + 1)}>Retry loading courses</button></div>;
  if (!courses) return <p role="status">Loading your courses…</p>;
  if (!courses.length) return <section className="panel"><span className="eyebrow">START WITH WHAT YOU KNOW</span><h2>Your notes are the starting point.</h2><p>Create a course from your notes, or try our sample. Each matched concept becomes a short lesson with added explanations, a real-world example, an exercise, and a quiz.</p><Link className="button primary" href="/courses/new">Create your first course <span aria-hidden="true">↗</span></Link></section>;
  return <div className="challenge-list">{courses.map((course) => <article key={course.id} className="panel">
    <span className="eyebrow">{course.topic} · FROM YOUR NOTES</span><h2 className="course-title">{course.title}</h2>
    <p>{course.completedCount} of {course.lessonCount} lessons complete</p>
    <progress value={course.completedCount} max={course.lessonCount} aria-label={`${course.topic} course progress`} />
    <div className="save-row"><Link className="button primary small" href={`/courses/${course.id}`}>Open course <span aria-hidden="true">↗</span></Link><Link className="text-link" href={`/courses/${course.id}/notes`}>Add more notes</Link></div>
  </article>)}</div>;
}
