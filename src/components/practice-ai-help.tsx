"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { HintRequest, HintResponse } from "@/lib/types";

export function PracticeAiHelp({ code, errorText = "", courseId, lessonId = "playground", hint }: {
  code: string; errorText?: string; courseId?: string; lessonId?: string; hint?: string;
}) {
  const [available, setAvailable] = useState(false);
  const [live, setLive] = useState(false);
  const [consent, setConsent] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<{ available: boolean }>("/api/ai").then((result) => { if (active) setAvailable(result.available); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function ask(intent: HintRequest["intent"]) {
    setError("");
    if (!live) {
      setSource("LOCAL GUIDANCE · NOT A LIVE AI ANSWER");
      setResponse(intent === "hint"
        ? hint ?? "Predict the output of one line before running it. Log the input and the result separately. What type is each value, and does the operation change the original?"
        : intent === "error"
          ? /syntax|unexpected|missing|invalid/i.test(errorText) ? "The code could not be parsed. Check matching quotes, braces, brackets, and parentheses. JavaScript uses lowercase let and const and case-sensitive names. Try the smallest version of the failing statement."
            : /not defined/i.test(errorText) ? "A name could not be found. Compare the spelling and capitalization of the declaration and use. Check that the variable is available in this scope."
            : /fetch|network|content security|import|document|window/i.test(errorText) ? "This terminal intentionally blocks network requests and has no DOM or Node.js environment. Keep this example to plain JavaScript values, functions, and console output; test browser UI or API requests in your own editor."
            : "Read the first error message and identify the failing value. Log that value before using it. If execution timed out, check that your loop changes its stopping condition. Change one thing and run again."
          : "Self-review: use clear names, check empty inputs, and distinguish methods that mutate values from those returning new ones. Explain each step in your own words. Local guidance does not analyze or grade the code.");
      return;
    }
    if (!consent) { setError("Consent is required before sharing code with live AI."); return; }
    setBusy(true);
    try {
      const result = await api<HintResponse>("/api/ai", "POST", {
        lessonId, ...(courseId ? { courseId } : {}), question, code,
        error: errorText.slice(0, 2000), intent, consent: true,
      });
      setSource("LIVE AI · VERIFY EVERY SUGGESTION"); setResponse(result.text);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reach live AI. Use local guidance instead."); }
    finally { setBusy(false); }
  }

  return <div className="ai-response"><span className="eyebrow">ASK FOR HELP, NOT A SHORTCUT</span><h3>Your coding coach</h3>
    <p className="field-help">{available ? "Live AI is available after sign-in and consent. Local guidance stays in your browser." : "Local guidance is available. The server operator must configure OPENAI_API_KEY to enable live AI."} <Link href="/account" className="text-link">Manage account</Link></p>
    {available && <><label className="option-label"><input type="checkbox" checked={live} disabled={busy} onChange={(event) => { setLive(event.target.checked); setConsent(false); setError(""); }} />Use live AI</label>{live && <>
      <label className="field-label" htmlFor={`coach-question-${lessonId}`}>What did you try? What do you want to understand?</label><textarea id={`coach-question-${lessonId}`} className="notes-input compact-input" maxLength={2000} value={question} disabled={busy} onChange={(event) => setQuestion(event.target.value)} />
      <label className="option-label"><input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} />I agree to send this code, the last error, my question, and the lesson task to OpenAI. I have removed secrets and private information. My notes and reflections are not sent.</label>
    </>}</>}
    <div className="button-row"><button className="button secondary small" disabled={busy || (live && !consent)} onClick={() => ask("hint")}>Give me a hint</button><button className="button secondary small" disabled={busy || !errorText || (live && !consent)} onClick={() => ask("error")}>Explain last error</button><button className="button secondary small" disabled={busy || !code.trim() || (live && !consent)} onClick={() => ask("review")}>Review my code</button></div>
    <div role="status" aria-live="polite">{busy ? <p className="feedback">Thinking through your code…</p> : response && <><span className="tiny-tag">{source}</span><p className="coach-response">{response}</p></>}</div>
    {error && <p role="alert" className="error-message">{error}</p>}
  </div>;
}
