"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { Challenge, Progress } from "@/lib/types";

export function ChallengeWorkspace({ challenge }: { challenge: Challenge }) {
  const [code, setCode] = useState(challenge.starterCode);
  const [checked, setChecked] = useState<string[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api<Progress>("/api/progress").then((value) => { if (active) { setProgress(value); setError(""); } })
      .catch(() => { if (active) setError("Could not load progress. Please retry."); });
    return () => { active = false; };
  }, [attempt]);
  const complete = progress?.completedChallengeIds.includes(challenge.id) ?? false;
  async function toggleComplete() {
    setBusy(true); setError(""); setMessage("");
    try {
      setProgress(await api<Progress>("/api/progress", "PATCH", { kind: "challenge", id: challenge.id, complete: !complete }));
      setMessage(complete ? "Challenge marked incomplete." : "Challenge completed. Take a moment to celebrate what you understand now!");
    } catch { setError("Could not save completion. Your work is still here; please retry."); }
    finally { setBusy(false); }
  }
  return <div className="learning-grid">
    <section className="panel"><h2>Your independent attempt</h2><p>{challenge.description}</p><label className="field-label" htmlFor="challenge-code">Your solution scratchpad</label><textarea className="code-editor" id="challenge-code" value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} /><p className="field-help">Code stays in this tab and is not saved or executed. Use your own editor or browser tools to test it. Copy your work before leaving.</p></section>
    <section className="panel"><span className="eyebrow">UNDERSTANDING &gt; PERFECT CODE</span><h2>Check your work</h2><p>This is a self-assessment, not an automated grader. Check each item after testing your solution.</p><ul className="rubric">{challenge.rubric.map((item) => <li key={item}><label><input type="checkbox" checked={checked.includes(item)} onChange={(event) => setChecked(event.target.checked ? [...checked, item] : checked.filter((entry) => entry !== item))} /><span>{item}</span></label></li>)}</ul>
      <div className="completion-panel"><p>{checked.length} of {challenge.rubric.length} quality checks reviewed. Checks reset on reload; completion is stored for your demo session.</p><button className={`button ${complete ? "secondary" : "primary"}`} disabled={!progress || busy || (!complete && checked.length !== challenge.rubric.length)} onClick={toggleComplete}>{busy ? "Saving…" : complete ? "✓ Complete · Mark incomplete" : "Mark challenge complete"}</button>
        {error && <p className="error-message" role="alert">{error} {!progress && <button className="button secondary small" onClick={() => setAttempt(attempt + 1)}>Retry</button>}</p>}<p role="status" className="feedback">{message}</p>
      </div>
    </section>
  </div>;
}
