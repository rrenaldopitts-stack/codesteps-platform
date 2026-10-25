// The opaque-origin iframe owns the worker and timeout. Learner code runs only
// inside that worker: no DOM, app cookies, storage, or network permissions.
export const terminalFrame = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; connect-src 'none'; base-uri 'none'; form-action 'none'">
</head><body><script>
let worker;
let timer;
let token;
let count = 0;
function stop() {
  if (worker) worker.terminate();
  clearTimeout(timer);
  worker = null;
}
function send(kind, text) {
  parent.postMessage({ terminal: true, token, kind, text: String(text).slice(0, 3000) }, "*");
}
addEventListener("message", (event) => {
  if (event.source !== parent || !event.data) return;
  if (event.data.type === "INIT") { parent.postMessage({ terminalReady: true }, "*"); return; }
  if (typeof event.data.token !== "string") return;
  if (event.data.type === "STOP") { stop(); return; }
  if (event.data.type !== "RUN" || typeof event.data.code !== "string" || event.data.code.length > 8000) return;
  stop();
  token = event.data.token;
  count = 0;
  const prefix = \`
    const display = (value) => {
      if (typeof value === "string") return value;
      if (value === undefined) return "undefined";
      try { return JSON.stringify(value, (_, v) => typeof v === "bigint" ? String(v) + "n" : v); }
      catch { return String(value); }
    };
    const emit = (kind, values) => self.postMessage({ kind, text: values.map(display).join(" ").slice(0, 3000) });
    console.log = (...values) => emit("log", values);
    console.info = (...values) => emit("log", values);
    console.warn = (...values) => emit("warn", values);
    console.error = (...values) => emit("console-error", values);
    (async () => {
  \`;
  const suffix = \`
    })().then(
      () => self.postMessage({ kind: "done", text: "Run finished." }),
      (error) => self.postMessage({ kind: "fatal", text: String(error && error.message || error) })
    );
  \`;
  const url = URL.createObjectURL(new Blob([prefix, event.data.code, suffix], { type: "text/javascript" }));
  try {
    worker = new Worker(url);
    worker.onmessage = (message) => {
      const data = message.data;
      if (!data || !["log", "warn", "console-error", "fatal", "done"].includes(data.kind) || typeof data.text !== "string") return;
      count++;
      if (count > 100) { send("fatal", "Output limit reached (100 lines)."); stop(); return; }
      send(data.kind, data.text);
      if (data.kind === "done" || data.kind === "fatal") stop();
    };
    worker.onerror = (error) => { error.preventDefault(); send("fatal", error.message || "JavaScript could not run. Check syntax."); stop(); };
    timer = setTimeout(() => { send("fatal", "Stopped after 3 seconds. Check for an infinite loop or pending work."); stop(); }, 3000);
  } catch {
    send("fatal", "This browser could not start the isolated runner.");
    stop();
  } finally { URL.revokeObjectURL(url); }
});
</script></body></html>`;
