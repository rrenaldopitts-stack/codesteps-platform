"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { Challenge, Lesson, Note, Progress } from "@/lib/types";

const prompts = [
  "Give me a hint, not the answer.",
  "Explain this error in simple terms.",
  "Review my code and suggest improvements.",
];

export function LearningWorkspace({ lesson, challenge }: { lesson: Lesson; challenge: Challenge }) {
  const [code, setCode] = useState(lesson.starterCode);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [errorText, setErrorText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    let active = true;
    // Establish the demo session before fetching notes so both use one identity.
    api<Progress>("/api/progress")
      .then(async (value) => {
        const existing = await api<Note | null>(`/api/notes?lessonId=${lesson.id}`);
        if (active) {
          setProgress(value); setNote(existing?.content ?? ""); setSavedNote(existing?.content ?? "");
          setLoaded(true); setLoadError("");
        }
      })
      .catch(() => { if (active) setLoadError("Could not load your saved work. Retry before editing your reflection."); });
    return () => { active = false; };
  }, [lesson.id, attempt]);

  async function saveNote() {
    setSaving(true); setNoteMessage("");
    try {
      const saved = await api<Note>("/api/notes", "PUT", { lessonId: lesson.id, content: note });
      setSavedNote(saved.content); setNoteMessage("Reflection saved for this demo session.");
    } catch { setNoteMessage("Could not save your reflection. Your text is still here—please retry."); }
    finally { setSaving(false); }
  }

  const complete = progress?.completedLessonIds.includes(lesson.id) ?? false;
  async function toggleComplete() {
    setUpdating(true); setProgressMessage("");
    try {
      setProgress(await api<Progress>("/api/progress", "PATCH", { kind: "lesson", id: lesson.id, complete: !complete }));
      setProgressMessage(complete ? "Lesson marked incomplete." : "Nice work! Lesson completed. Try the independent challenge next.");
    } catch { setProgressMessage("Could not update your progress. Please retry."); }
    finally { setUpdating(false); }
  }

  function askHelper(index: number) {
    setSelectedPrompt(index);
    if (index === 0) setResponse(lesson.hint);
    if (index === 1) {
      const error = errorText.toLowerCase();
      setResponse(!error.trim() ? "Paste the error message above first. Read the first line and the line number: what did the program expect, and what did it find?"
        : error.includes("syntax") ? "A syntax error means the program cannot read the code’s structure. Look just before the reported line for a missing bracket, quote, or comma. Change one thing at a time."
        : error.includes("not defined") || error.includes("referenceerror") ? "The program is looking for a name it cannot find. Check spelling, capitalization, and whether you declared that variable in the same scope before using it."
        : error.includes("typeerror") ? "A value is being used in a way its type does not support. Check the value just before the failing line. Is it undefined, null, or a different type than you expected?"
        : "Start with the first error, not the whole stack trace. Find the named line, describe what it should do, then inspect each input. This demo recognizes only a few error patterns; use the prompt with your preferred AI for a deeper explanation.");
    }
    if (index === 2) setResponse(code.trim() === lesson.starterCode.trim()
      ? "Make a small change to the starter code first. Even one line gives you something to reason about. Then use this review checklist."
      : `Self-review checklist (not an automated code assessment): ${lesson.review}`);
  }

  return <div className="learning-grid">
    <div>
      <section className="panel"><h2>The idea</h2><p>{lesson.introduction}</p><ol>{lesson.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section className="panel task-panel"><span className="eyebrow">YOUR TURN</span><h2>A small task, all yours.</h2><p>{lesson.task}</p><label className="field-label" htmlFor="lesson-code">Your practice code</label><textarea id="lesson-code" className="code-editor" value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} /><p className="field-help">Scratchpad only: code is not run, uploaded, or saved. Copy it into your local editor to test it. Don’t paste secrets.</p></section>
      <section className="panel"><h2>Pause and reflect</h2><p>What did you build? What broke? How did you fix it? What clicked? What will you try next?</p>
        {loadError && <p className="error-message" role="alert">{loadError} <button className="button secondary small" onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
        <label htmlFor="reflection" className="field-label">Your reflection notes</label>
        <textarea id="reflection" className="notes-input" maxLength={5000} disabled={!loaded || saving} placeholder="Today I learned…" value={note} onChange={(event) => { setNote(event.target.value); setNoteMessage(""); }} />
        <div className="save-row"><button className="button primary small" disabled={!loaded || saving} onClick={saveNote}>{saving ? "Saving…" : "Save reflection"}</button><span className="field-help">{note.length}/5,000 {note !== savedNote ? "· Unsaved changes" : ""}</span></div>
        <p className="feedback" role="status">{noteMessage}</p>
      </section>
      <div className="button-row"><button className={`button ${complete ? "secondary" : "primary"}`} disabled={!loaded || updating} onClick={toggleComplete}>{updating ? "Updating…" : complete ? "✓ Completed · Mark incomplete" : "Mark lesson complete"}</button><Link href={`/challenges/${challenge.id}`} className="button secondary">Try the challenge <span aria-hidden="true">↗</span></Link></div>
      <p role="status" className="feedback">{progressMessage}</p>
    </div>
    <aside className="panel ai-panel" aria-label="AI learning helper"><span className="eyebrow">✧ ASK AI · DEMO HELPER</span><h2>A nudge in the right direction.</h2><p>Try on your own first. Then choose a prompt to get unstuck without skipping the learning.</p><p className="field-help">This is a local, scripted helper—not a live AI model. Code and error text stay in this tab. You can also copy these prompts into your preferred AI tool.</p>
      <label htmlFor="error-text" className="field-label">Error message (optional)</label><textarea id="error-text" className="notes-input" style={{ minHeight: 85 }} maxLength={2000} placeholder="Paste an error you want to understand…" value={errorText} onChange={(event) => setErrorText(event.target.value)} />
      {prompts.map((prompt, index) => <button key={prompt} className="prompt-button" aria-pressed={selectedPrompt === index} onClick={() => askHelper(index)}>{prompt} <span aria-hidden="true">↗</span></button>)}
      <div className="ai-response" role="status" aria-live="polite"><h3>{selectedPrompt === null ? "You’re in the driver’s seat." : "Let’s think it through."}</h3><p>{response || "Before asking: What have you tried? What did you expect? What actually happened? Good questions build good developers."}</p></div>
    </aside>
  </div>;
}
