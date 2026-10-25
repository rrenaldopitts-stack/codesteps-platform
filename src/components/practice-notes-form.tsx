"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-api";
import { practiceLimits, practiceTopics, type PracticeCourse, type PracticeTopic } from "@/lib/practice-types";

const samples: Record<PracticeTopic, string> = {
  JavaScript: "Arrays\nTo modify an array element, assign a new value using its index.\nNested arrays use chained bracket notation: nestedArr[1][0].\nArray methods: push, pop, shift, unshift, splice, slice, concat, join, includes, indexOf, lastIndexOf.\nsort(): sorts numbers from lowest to highest.\nmap(callback): creates a new array; changes the original array.\nfilter creates a new array with matching items. reduce combines values.\nIterating: for loops, forEach(item, index), for...of, while, do...while, break.\nStrings are immutable. split(separator, limit), trim, replace, replaceAll, and template literals.\nArrow functions take parameters and return results.\nBlocks and scope: let and const can be declared inside a block.\nObjects store key-value pairs. Use dot or bracket notation. Methods can use the this keyword.",
  "HTML & CSS": "Semantic HTML gives a page structure. Headings and links should describe their content.\nCSS padding adds space inside a border. Responsive layouts need flexible widths.",
  React: "React components return JSX. Props pass information from a parent to a child.\nI want to reuse one component with different product names.",
  APIs: "An API lets programs exchange data. fetch returns a promise.\nUse async and await to read JSON. HTTP errors need a response.ok check.",
};

const supported: Record<PracticeTopic, string> = {
  JavaScript: "variables, array indexing and nesting, mutation/copying/searching/sorting, map/filter/reduce, loops, strings, functions, scope, objects, and this",
  "HTML & CSS": "semantic HTML (headings/links/buttons), CSS box model and responsive sizing (padding/margin)",
  React: "components, props, JSX",
  APIs: "fetch, async/await, HTTP requests, JSON",
};

export function PracticeNotesForm({ course, onUpdated }: { course?: PracticeCourse; onUpdated?: (course: PracticeCourse) => void }) {
  const router = useRouter();
  const [topic, setTopic] = useState<PracticeTopic>(course?.topic ?? "JavaScript");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(""); setMessage("");
    if (!/\.(txt|md)$/i.test(file.name) || file.size > practiceLimits.submissionBytes) {
      setError("Choose a plain-text .txt or Markdown .md file up to 100 KB. Copy text from PDFs or Word documents instead."); return;
    }
    setReading(true);
    try {
      const text = await file.text();
      const combined = notes ? `${notes}\n\n${text}` : text;
      if (combined.length > practiceLimits.submissionCharacters || new TextEncoder().encode(combined).length > practiceLimits.submissionBytes || text.includes("\0")) {
        setError("Imported text must fit within 25,000 characters and 100 KB. Split a large file into smaller sections."); return;
      }
      setNotes(combined);
      setMessage(`Text from ${file.name} added to the box. Review it before saving.`);
    } catch { setError("Could not read this file. Try pasting the text instead."); }
    finally { setReading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      const result = course
        ? await api<PracticeCourse>(`/api/courses/${course.id}`, "PATCH", { additionalNotes: notes })
        : await api<PracticeCourse>("/api/courses", "POST", { topic, notes });
      if (course) {
        const added = result.lessons.length - course.lessons.length;
        onUpdated?.(result); setNotes("");
        setMessage(added ? `Notes saved. Added ${added} new ${added === 1 ? "lesson" : "lessons"}; your earlier work is unchanged.` :
          "Notes saved. No new supported concepts were found, so existing lessons and saved work are unchanged.");
      } else router.push(`/courses/${result.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create your practice course. Please retry."); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="panel notes-builder">
    <h2>{course ? "Add more notes" : "Turn your notes into practice"}</h2>
    <p>{course ? "New supported concepts add lessons. Existing lessons, exercise drafts, completion, and reflections stay intact. Repeated concepts do not create duplicate lessons." :
      "Choose what you’re studying, then paste your notes or import a file. We match mentioned concepts to beginner-friendly teaching templates—not a live AI model."}</p>
    <label className="field-label" htmlFor="course-topic">Topic</label>
    <select id="course-topic" className="notes-input compact-input" value={topic} disabled={Boolean(course) || busy || reading} onChange={(event) => setTopic(event.target.value as PracticeTopic)}>
      {practiceTopics.map((value) => <option key={value}>{value}</option>)}
    </select>
    <p className="field-help" id="supported-concepts"><strong>Supported concepts:</strong> {supported[topic]}. Mentions choose the lessons; this tool does not verify your notes or explain every possible topic.</p>
    <label htmlFor="notes-file" className="field-label">Import a notes file (.txt or .md)</label>
    <input id="notes-file" type="file" accept=".txt,.md,text/plain,text/markdown" disabled={busy || reading} onChange={importFile} aria-describedby="file-help" />
    <p id="file-help" className="field-help">Up to 100 KB. Imported text is added below for review. For PDFs or Word files, copy and paste the text. Nothing is shared with an external AI provider.</p>
    <label htmlFor="source-notes" className="field-label">{course ? "Additional notes" : "Your study notes"}</label>
    <textarea id="source-notes" className="notes-input source-notes" value={notes} required minLength={20} maxLength={practiceLimits.submissionCharacters} disabled={busy || reading} aria-describedby="supported-concepts notes-help" onChange={(event) => { setNotes(event.target.value); setMessage(""); }} placeholder="For example: Arrays store an ordered list. map makes a new array…" />
    <p id="notes-help" className="field-help">{notes.length}/25,000 characters per submission. {course ? `${course.sourceNotes.length}/100,000 saved characters. ` : ""}Keep passwords, private code, and personal information out of your notes.</p>
    {!course && topic === "JavaScript" && <p className="field-help">The JavaScript sample is a condensed version of the supplied study notes, including claims to compare with the clearly labeled clarifications.</p>}
    <div className="button-row">
      <button className="button primary" type="submit" disabled={busy || reading || notes.trim().length < 20}>{reading ? "Reading file…" : busy ? "Saving…" : course ? "Save notes & adapt course" : "Create practice course"} <span aria-hidden="true">↗</span></button>
      {!course && <button type="button" className="button secondary" disabled={busy || reading} onClick={() => { setNotes(samples[topic]); setMessage("Sample notes loaded. You can edit them before creating your course."); setError(""); }}>Try sample notes</button>}
    </div>
    <p role="status" className="feedback">{message}</p>
    {error && <p role="alert" className="error-message">{error}</p>}
  </form>;
}
