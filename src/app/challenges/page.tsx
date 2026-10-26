import Link from "next/link";
import type { Metadata } from "next";
import { challenges } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Practice challenges" };

export default function ChallengesPage() {
  return <main id="main-content" className="workspace container"><Link href="/dashboard" className="breadcrumb">← Back to your learning path</Link><div className="page-heading"><span className="eyebrow">MAKE IT STICK</span><h1>Small challenges. Real confidence.</h1><p>Try without hints first. Test your work, check the rubric, then explain your choices.</p></div><div className="challenge-list">{challenges.map((challenge, index) => <article className="panel" key={challenge.id}><span className="eyebrow">CHALLENGE 0{index + 1}</span><h2>{challenge.title}</h2><p>{challenge.description}</p><Link className="button primary small" href={`/challenges/${challenge.id}`}>Take the challenge <span aria-hidden="true">↗</span></Link></article>)}</div></main>;
}
