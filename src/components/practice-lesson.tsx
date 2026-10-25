"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";
import type { PracticeCourse, PracticeEntry, PracticeLesson as Lesson } from "@/lib/practice-types";
import { CodeTerminal } from "./code-terminal";
import { PracticeAiHelp } from "./practice-ai-help";

export function PracticeLesson({ course, lesson, onSaved }: { course: PracticeCourse; lesson: Lesson; onSaved: (course: PracticeCourse) => void }) {
  const [entry, setEntry] = useState<PracticeEntry>(course.entries[lesson.id] ?? { answer: "", quizChoice: null, reflection: "", needsPractice: "", complete: false });
  const [hintCount, setHintCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [checkedQuiz, setCheckedQuiz] = useState(entry.quizChoice !== null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const ready = Boolean(entry.answer.trim() && entry.reflection.trim() && entry.quizChoice === lesson.quiz.answerIndex);

  function edit(update: Partial<PracticeEntry>) {
    setEntry((current) => ({ ...current, ...update, complete: false }));
    setDirty(true); setMessage("");
  }

  async function save(complete: boolean) {
    setBusy(true); setMessage(""); setError("");
    try {
      const updated = await api<PracticeCourse>(`/api/courses/${course.id}`, "PATCH", { lessonId: lesson.id, entry: { ...entry, complete } });
      setEntry(updated.entries[lesson.id]); onSaved(updated); setDirty(false);
      setMessage(complete ? "Lesson complete. Your practice and reflection are saved." : "Practice, quiz choice, and reflection saved.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save. Please retry."); }
    finally { setBusy(false); }
  }

  return <div className="learning-grid">
    <div>
      <section className="panel source-panel"><span className="eyebrow">FROM YOUR NOTES · UNVERIFIED EXCERPT</span><blockquote>{lesson.sourceExcerpt}</blockquote><p className="field-help">This exact excerpt selected the lesson. Your notes may be incomplete or incorrect; compare them with the teaching material below.</p></section>
      <section className="panel"><span className="eyebrow">ADDED TEACHING MATERIAL · CURATED</span><h2>The concept, in plain language</h2><p>{lesson.explanation}</p><h3>Useful terms</h3><dl className="glossary">{lesson.terms.map(({ term, meaning }) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
        {!!lesson.clarifications?.length && <div className="clarifications"><h3>Check your notes: common clarifications</h3><p>These authored reminders are not an automated diagnosis of your notes.</p><ul>{lesson.clarifications.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      </section>
      <section className="panel task-panel"><span className="eyebrow">REAL-WORLD CONNECTION · ADDED EXAMPLE</span><h2>{lesson.realWorld.title}</h2><p>{lesson.realWorld.description}</p></section>
      <section className="panel"><span className="eyebrow">PRACTICE · TRY BEFORE ASKING</span><h2>Build a small piece of it</h2><p>{lesson.exercise}</p>
        <details><summary>View starter code</summary><pre className="practice-code">{lesson.starterCode}</pre></details>
        <label className="field-label" htmlFor="practice-answer">Your solution and reasoning</label><textarea id="practice-answer" className="code-editor" maxLength={8000} value={entry.answer} disabled={busy} onChange={(event) => edit({ answer: event.target.value })} placeholder="Write your attempt and explain your choices…" spellCheck={false} />
        <p className="field-help">Saved only when you choose Save or Complete. Code is never run or sent to an AI provider. Test it in your own editor. Completion is self-assessed, not automated code grading.</p>
        <h3>Review your solution</h3><ul>{lesson.rubric.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      {course.topic === "JavaScript" && <CodeTerminal starterCode={lesson.starterCode} courseId={course.id} lessonId={lesson.id} hint={lesson.hints[0]} />}
      <section className="panel"><span className="eyebrow">QUICK KNOWLEDGE CHECK</span><fieldset className="quiz-fieldset" disabled={busy}><legend>{lesson.quiz.question}</legend>{lesson.quiz.choices.map((choice, index) => <label className="quiz-choice" key={choice}><input type="radio" name={`quiz-${lesson.id}`} value={index} checked={entry.quizChoice === index} onChange={() => { edit({ quizChoice: index }); setCheckedQuiz(false); }} /><span>{choice}</span></label>)}</fieldset>
        <button className="button secondary small" disabled={entry.quizChoice === null || busy} onClick={() => setCheckedQuiz(true)}>Check answer</button>
        <div role="status">{checkedQuiz && <p className="feedback"><strong>{entry.quizChoice === lesson.quiz.answerIndex ? "That’s right. " : "Not quite—think it through. "}</strong>{lesson.quiz.explanation}</p>}</div>
      </section>
      <section className="panel"><span className="eyebrow">MAKE IT STICK</span><h2>Reflect before moving on</h2><label className="field-label" htmlFor="practice-reflection">What did you learn? How does it connect to a real application?</label><textarea id="practice-reflection" className="notes-input" maxLength={3000} disabled={busy} value={entry.reflection} onChange={(event) => edit({ reflection: event.target.value })} />
        <label className="field-label" htmlFor="practice-needs">What needs more practice? (optional)</label><textarea id="practice-needs" className="notes-input compact-input" maxLength={2000} disabled={busy} value={entry.needsPractice} onChange={(event) => edit({ needsPractice: event.target.value })} />
        <div className="save-row"><button className="button secondary" disabled={busy} onClick={() => save(entry.complete)}>Save practice & reflection</button><button className="button primary" disabled={busy || (!entry.complete && !ready)} onClick={() => save(!entry.complete)}>{busy ? "Saving…" : entry.complete ? "✓ Completed · Mark incomplete" : "Complete lesson"}</button></div>
        <p className="field-help">{dirty ? "Unsaved changes. Save before following a link or leaving this page. " : ""}To complete: attempt the exercise, choose the correct quiz answer, and write a reflection. Editing completed work marks it incomplete when saved.</p>
        <p role="status" className="feedback">{message}</p>{error && <p role="alert" className="error-message">{error}</p>}
      </section>
    </div>
    <aside className="panel ai-panel"><span className="eyebrow">GUIDANCE, NOT A SHORTCUT</span><h2>One nudge at a time</h2><p>Hints are local, curated guidance. Try a change and test it before revealing the next one.</p>
      <ol>{lesson.hints.slice(0, hintCount).map((hint) => <li key={hint}>{hint}</li>)}</ol>
      <button className="button secondary small" disabled={hintCount >= lesson.hints.length} onClick={() => setHintCount(hintCount + 1)}>{hintCount ? "Reveal next hint" : "Give me a hint"}</button>
      <p className="field-help">A sample solution becomes available after you write an attempt and reveal both hints.</p>
      <button className="prompt-button" disabled={!entry.answer.trim() || hintCount < lesson.hints.length} aria-expanded={showAnswer} onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? "Hide sample solution" : "Compare with a sample solution"}</button>
      {showAnswer && <div className="ai-response"><pre className="practice-code">{lesson.sampleAnswer}</pre><p>Compare the reasoning, not just the text. Your solution can differ and still be correct.</p></div>}
      {course.topic !== "JavaScript" && <PracticeAiHelp code={entry.answer} courseId={course.id} lessonId={lesson.id} hint={lesson.hints[0]} />}
    </aside>
  </div>;
}
