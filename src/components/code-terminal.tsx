"use client";

import { useEffect, useRef, useState } from "react";
import { terminalFrame } from "@/lib/terminal-frame";
import { PracticeAiHelp } from "./practice-ai-help";

export function CodeTerminal({ starterCode = 'const prices = [12, 8, 20];\nconsole.log(prices.map((price) => price + 2));', courseId, lessonId, hint }: { starterCode?: string; courseId?: string; lessonId?: string; hint?: string }) {
  const [code, setCode] = useState(starterCode);
  const [lines, setLines] = useState<{ kind: string; text: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const activeToken = useRef("");
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || !event.data) return;
      if (event.data.terminalReady === true) { setReady(true); return; }
      if (event.data.terminal !== true ||
        event.data.token !== activeToken.current || typeof event.data.text !== "string" ||
        !["log", "warn", "console-error", "fatal", "done"].includes(event.data.kind)) return;
      const { kind, text } = event.data;
      setLines((current) => current.length < 102 ? [...current, { kind, text: text.slice(0, 3000) }] : current);
      if (kind === "done" || kind === "fatal") {
        setRunning(false);
        if (watchdog.current) clearTimeout(watchdog.current);
      }
    }
    window.addEventListener("message", receive);
    frame.current?.contentWindow?.postMessage({ type: "INIT" }, "*");
    return () => {
      window.removeEventListener("message", receive);
      if (watchdog.current) clearTimeout(watchdog.current);
    };
  }, []);

  function run() {
    const token = crypto.randomUUID();
    activeToken.current = token;
    setLines([]); setRunning(true);
    frame.current?.contentWindow?.postMessage({ type: "RUN", token, code }, "*");
    if (watchdog.current) clearTimeout(watchdog.current);
    watchdog.current = setTimeout(() => {
      frame.current?.contentWindow?.postMessage({ type: "STOP", token }, "*");
      setRunning(false); setLines((current) => [...current.slice(0, 101), { kind: "fatal", text: "Runner stopped or unavailable. Retry in a browser that supports sandboxed Web Workers." }]);
    }, 5000);
  }

  function stop() {
    frame.current?.contentWindow?.postMessage({ type: "STOP", token: activeToken.current }, "*");
    activeToken.current = "";
    if (watchdog.current) clearTimeout(watchdog.current);
    setRunning(false);
    setLines((current) => [...current.slice(0, 101), { kind: "log", text: "Stopped." }]);
  }

  return <section className="panel terminal-panel"><span className="eyebrow">PRACTICE CODE TERMINAL · JAVASCRIPT</span><h2>Try it and see what happens.</h2>
    <p>Run plain JavaScript and read console output or errors. This isolated browser runner has no network, app cookies, or DOM access. It is not a Node.js shell and does not support React/JSX, TypeScript, imports, or HTML rendering.</p>
    <label className="field-label" htmlFor="terminal-code">JavaScript to run</label><textarea id="terminal-code" className="code-editor" value={code} maxLength={8000} spellCheck={false} disabled={running} onChange={(event) => setCode(event.target.value)} />
    <div className="save-row"><button className="button primary" disabled={!ready || running || !code.trim()} onClick={run}>{running ? "Running…" : "Run JavaScript"}</button><button className="button secondary" disabled={!running} onClick={stop}>Stop</button><button className="button secondary" disabled={running} onClick={() => setLines([])}>Clear output</button><button className="button secondary" disabled={running} onClick={() => setCode(starterCode)}>Reset code</button></div>
    <p className="field-help">Tab-only scratchpad: code is not saved or uploaded. Copy your working solution into your lesson’s saved answer. Runs end after 3 seconds or 100 output lines. Use small inputs; this is a learning aid, not a resource-hardened execution service.</p>
    <div className="terminal-console" role="log" aria-label="JavaScript output" aria-live="polite">{!lines.length ? <p>Output will appear here. Use console.log() to inspect a value.</p> : lines.map((line, index) => <pre className={line.kind === "fatal" || line.kind === "console-error" ? "terminal-error" : ""} key={index}>{line.text}</pre>)}</div>
    <PracticeAiHelp code={code} errorText={lines.filter((line) => line.kind === "fatal" || line.kind === "console-error").at(-1)?.text ?? ""} courseId={courseId} lessonId={lessonId} hint={hint} />
    <iframe ref={frame} title="Isolated JavaScript runner" sandbox="allow-scripts" srcDoc={terminalFrame} onLoad={() => setReady(true)} className="runner-frame" aria-hidden="true" tabIndex={-1} />
  </section>;
}
