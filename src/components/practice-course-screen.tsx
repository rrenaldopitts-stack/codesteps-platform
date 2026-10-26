"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { PracticeCourse } from "@/lib/practice-types";
import { PracticeNotesForm } from "./practice-notes-form";
import { PracticeLesson } from "./practice-lesson";
import { ImprovedStudyNotes } from "./improved-study-notes";

export function PracticeCourseScreen({ id, mode = "overview", lessonId }: { id: string; mode?: "overview" | "notes" | "lesson"; lessonId?: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<PracticeCourse | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => {
    let active = true;
    api<PracticeCourse>(`/api/courses/${id}`).then((result) => { if (active) { setCourse(result); setError(""); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load your course."); });
    return () => { active = false; };
  }, [id, attempt]);

  async function deleteCourse() {
    setDeleting(true); setDeleteError("");
    try { await api(`/api/courses/${id}`, "DELETE", { confirm: true }); router.push("/courses"); }
    catch { setDeleteError("Could not delete this course. Please retry."); setDeleting(false); }
  }

  if (error) return <section className="panel"><h1>Course unavailable</h1><p role="alert" className="error-message">{error}</p><div className="button-row"><button className="button secondary" onClick={() => setAttempt(attempt + 1)}>Retry</button><Link className="button primary" href="/courses">My courses</Link></div></section>;
  if (!course) return <p role="status">Loading your saved course…</p>;
  const completed = Object.values(course.entries).filter((entry) => entry.complete).length;
  const lesson = course.lessons.find((item) => item.id === lessonId);
  const review = course.lessons.filter((item) => course.entries[item.id]?.needsPractice.trim());
  const next = review.find((item) => !course.entries[item.id]?.complete) ??
    course.lessons.find((item) => !course.entries[item.id]?.complete) ?? review[0] ?? course.lessons[0];
  return <>
    <nav aria-label="Course navigation" className="course-nav"><Link href="/courses">← My courses</Link><Link href={`/courses/${id}`}>Course overview</Link><Link href={`/courses/${id}/notes`}>Manage notes</Link></nav>
    <div className="page-heading"><span className="eyebrow">{course.topic} · YOUR NOTES, YOUR NEXT STEP</span><h1 className="course-title">{mode === "lesson" ? lesson?.title ?? "Lesson not found" : mode === "notes" ? "Keep your course growing." : course.title}</h1><p>{completed} of {course.lessons.length} lessons complete · Curated explanations matched to concepts mentioned in your notes.</p></div>
    {mode === "overview" && <>
      <section className="panel"><h2>Your practice path</h2><p>Read your excerpt, explore the added explanation and real-world example, attempt the exercise, then quiz yourself and reflect. Add notes any time to discover more supported concepts.</p><progress value={completed} max={course.lessons.length} aria-label="Course completion" /><div className="save-row"><Link className="button primary" href={`/courses/${id}/lessons/${next.id}`}>{completed === course.lessons.length ? "Revisit a lesson" : "Continue practice"} <span aria-hidden="true">↗</span></Link><Link className="button secondary" href={`/courses/${id}/notes`}>Add more notes</Link></div></section>
      {!!review.length && <section className="panel task-panel"><span className="eyebrow">ADAPTED TO YOUR REFLECTIONS</span><h2>Your review queue</h2><p>These are the lessons you marked as needing more practice. Clear that lesson’s practice goal and save when you feel confident.</p><ul>{review.map((item) => <li key={item.id}><Link className="text-link" href={`/courses/${id}/lessons/${item.id}`}>{item.title}</Link><p className="review-note">{course.entries[item.id].needsPractice}</p></li>)}</ul></section>}
      <div className="challenge-list">{course.lessons.map((item, index) => <article className="panel" key={item.id}><span className="eyebrow">LESSON {index + 1} · {course.entries[item.id]?.complete ? "COMPLETE" : "READY TO PRACTICE"}</span><h2>{item.title}</h2><p>{item.realWorld.title}: {item.realWorld.description}</p><Link className="text-link" href={`/courses/${id}/lessons/${item.id}`}>Open lesson <span aria-hidden="true">↗</span></Link></article>)}</div>
    </>}
    {mode === "notes" && <>
      <section className="panel source-panel"><span className="eyebrow">YOUR SAVED SOURCE NOTES</span><details><summary>Read all notes ({course.sourceNotes.length} characters)</summary><pre className="source-text">{course.sourceNotes}</pre></details><p className="field-help">These are your original words, not verified facts. New submissions are appended, never substituted for earlier notes.</p></section>
      <PracticeNotesForm course={course} onUpdated={setCourse} />
      <ImprovedStudyNotes key={id} course={course} onSaved={setCourse} />
      <section className="panel"><h2>Delete this course</h2><p>This permanently deletes this course, its notes, exercise drafts, and reflections. Other courses and the beginner curriculum are unaffected.</p><label className="quiz-choice"><input type="checkbox" checked={confirmed} disabled={deleting} onChange={(event) => setConfirmed(event.target.checked)} />I understand this cannot be undone.</label><button className="button secondary" disabled={!confirmed || deleting} onClick={deleteCourse}>{deleting ? "Deleting…" : "Delete course permanently"}</button>{deleteError && <p role="alert" className="error-message">{deleteError}</p>}</section>
    </>}
    {mode === "lesson" && (lesson ? <>
      <nav aria-label="Lessons in this course" className="course-nav">{course.lessons.map((item, index) => <Link href={`/courses/${id}/lessons/${item.id}`} key={item.id} aria-current={item.id === lesson.id ? "page" : undefined}>{index + 1}. {item.title}</Link>)}</nav>
      <PracticeLesson key={`${id}:${lesson.id}`} course={course} lesson={lesson} onSaved={setCourse} />
    </> : <p role="alert">This lesson is not in your course. Choose a lesson from the <Link className="text-link" href={`/courses/${id}`}>overview</Link>.</p>)}
  </>;
}
