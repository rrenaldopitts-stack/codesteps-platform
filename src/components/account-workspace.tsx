"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { ApiResponse, User } from "@/lib/types";

type Session = { user: User; isGuest: boolean };

async function fetchSession(): Promise<Session> {
  const response = await fetch("/api/auth", { cache: "no-store" });
  const result: ApiResponse<Session> = await response.json();
  if (!response.ok || !result.data) throw new Error(result.error || "Unable to load your account.");
  return result.data;
}

export function AccountWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadSession() {
    try {
      setSession(await fetchSession());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load your account.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchSession().then((value) => { if (!cancelled) setSession(value); })
      .catch(() => { if (!cancelled) setError("Unable to load your account. Please try again."); });
    return () => { cancelled = true; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result: ApiResponse<Session> = await response.json();
      if (!response.ok || !result.data) throw new Error(result.error || "Unable to sign in.");
      window.location.assign(new URL("/dashboard", window.location.origin).href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      window.location.assign(new URL("/account", window.location.origin).href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign out.");
      setBusy(false);
    }
  }

  return <section className="panel account-panel" aria-label="Account">
    {error && <p role="alert" className="error-message">{error}</p>}
    {!session ? <><p role="status">Loading your account…</p>{error && <button type="button" className="button button-secondary" onClick={() => void loadSession()}>Try again</button>}</> :
      !session.isGuest ? <>
        <h2>Signed in as {session.user.name}</h2>
        <p>Your progress and notes are saved to your account on this server.</p>
        <div className="button-row"><Link className="button button-primary" href="/dashboard">Open dashboard</Link><button className="button button-secondary" type="button" disabled={busy} onClick={signOut}>Sign out</button></div>
      </> : <>
        <div className="demo-banner"><strong>Guest workspace</strong><p>You are not signed in. Guest progress is saved in this browser’s session for up to 30 days. Register or sign in to merge it into your account. Existing account notes are kept.</p></div>
        <div className="button-row" aria-label="Account action">
          <button type="button" className={`button ${mode === "login" ? "button-primary" : "button-secondary"}`} aria-pressed={mode === "login"} disabled={busy} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
          <button type="button" className={`button ${mode === "register" ? "button-primary" : "button-secondary"}`} aria-pressed={mode === "register"} disabled={busy} onClick={() => { setMode("register"); setError(""); }}>Create account</button>
        </div>
        <h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2>
        <form onSubmit={submit} className="account-form">
          <label htmlFor="account-username">Username</label>
          <input id="account-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} pattern="[a-zA-Z0-9_]{3,32}" minLength={3} maxLength={32} required value={username} onChange={(event) => setUsername(event.target.value)} aria-describedby="username-help" />
          <p id="username-help">3–32 letters, numbers, or underscores. Not case-sensitive.</p>
          <label htmlFor="account-password">Password</label>
          <input id="account-password" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="password-help" />
          <p id="password-help">12–128 characters. Save it securely: there is no email or password reset.</p>
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
        </form>
        <p><Link href="/dashboard">Continue as a guest</Link></p>
        <button type="button" className="button button-secondary" disabled={busy} onClick={signOut}>Clear guest workspace</button>
      </>}
  </section>;
}
