import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = { title: "Your learning dashboard" };

export default function DashboardPage() {
  return <main id="main-content" className="workspace container">
    <div className="page-heading"><span className="eyebrow">YOUR PERSONAL LAUNCHPAD</span><h1>Hey, learner. Let’s build something.</h1><p>Start small, stay curious, and make a little progress today.</p></div>
    <div className="demo-banner"><strong>Demo workspace</strong> · No sign-in needed. Progress and reflections are temporary, isolated to this browser’s demo session, and may reset when the server restarts.</div>
    <Dashboard />
  </main>;
}
