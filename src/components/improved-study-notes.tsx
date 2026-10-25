"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";
import type { PracticeCourse } from "@/lib/practice-types";
import { buildStudyGuide } from "@/lib/study-guide";

export function ImprovedStudyNotes({ course, onSaved }: { course: PracticeCourse; onSaved: (course: PracticeCourse) => void }) {
  const generated = buildStudyGuide(course.topic, course.lessons);
  const [draft, setDraft] = useState(course.improvedNotes ?? generated);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const dirty = draft !== course.improvedNotes;

  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      onSaved(await api<PracticeCourse>(`/api/courses/${course.id}`, "PATCH", { improvedNotes: draft }));
      setMessage("Improved notes saved. Your original source notes are unchanged.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save improved notes."); }
    finally { setBusy(false); }
  }

  return <section className="panel notes-builder"><span className="eyebrow">IMPROVE YOUR NOTES · ADDED AND EDITABLE</span><h2>A clearer study guide</h2>
    <p>Review plain-language explanations, corrected concepts, definitions, and real-world uses. This guide uses authored teaching material matched to your notes, not a comprehensive AI correction. Edit it in your own words.</p>
    <label className="field-label" htmlFor="improved-notes">Your improved study notes</label>
    <textarea id="improved-notes" className="notes-input source-notes" maxLength={25000} value={draft} disabled={busy} onChange={(event) => { setDraft(event.target.value); setMessage(""); }} />
    <p className="field-help">{draft.length}/25,000 characters. {dirty ? "Draft not saved. " : "Saved. "}Original notes are never overwritten. Saved edits stay unchanged when more source notes are added; rebuild the draft to include the latest lessons.</p>
    <div className="button-row"><button className="button primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save improved notes"}</button><button className="button secondary" disabled={busy} onClick={() => setConfirmReplace(!confirmReplace)}>Rebuild from current lessons</button></div>
    {confirmReplace && <div className="demo-banner"><p>Replace the text in this draft with a fresh guide for all current lessons? This discards draft edits, but does not change your saved version until you save again.</p><div className="button-row"><button className="button secondary small" disabled={busy} onClick={() => { setDraft(generated); setConfirmReplace(false); setMessage("Fresh draft created. Review and save it when ready."); }}>Replace draft</button><button className="button secondary small" onClick={() => setConfirmReplace(false)}>Keep my draft</button></div></div>}
    <p role="status" className="feedback">{message}</p>{error && <p className="error-message" role="alert">{error}</p>}
  </section>;
}
