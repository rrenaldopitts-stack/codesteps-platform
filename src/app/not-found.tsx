import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="container workspace"><span className="eyebrow">404 · A SMALL DETOUR</span><h1>This step doesn’t exist yet.</h1><p>Head back to your learning path and pick up where you left off.</p><Link className="button primary" href="/dashboard">Back to learning</Link></main>;
}
