import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import Link from "next/link";

export const metadata: Metadata = { title: "Your learning dashboard" };

export default function DashboardPage() {
  return <main id="main-content" className="workspace container">
    <div className="page-heading"><span className="eyebrow">YOUR PERSONAL LAUNCHPAD</span><h1>Hey, learner. Let’s build something.</h1><p>Start small, stay curious, and make a little progress today.</p></div>
    <section className="panel"><span className="eyebrow">MAKE IT PERSONAL</span><h2>Build a course from your notes.</h2><p>Paste study notes or import a text file. Turn supported concepts into explanations, real-world examples, exercises, and quizzes. Add more notes as you learn.</p><div className="button-row"><Link className="button primary" href="/courses/new">Create from notes <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="/courses">My saved courses</Link></div></section>
    <div className="demo-banner"><strong>Your learning workspace</strong> · Work is saved on this server. <Link className="text-link" href="/account">Create an account or sign in</Link> to keep access across browsers. Guest access depends on your browser cookie.</div>
    <Dashboard />
  </main>;
}
