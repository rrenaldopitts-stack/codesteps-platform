import Link from "next/link";
import { notFound } from "next/navigation";
import { challenges } from "@/lib/curriculum";
import { ChallengeWorkspace } from "@/components/challenge-workspace";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: challenges.find((challenge) => challenge.id === id)?.title ?? "Challenge not found" };
}

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) notFound();
  return <main id="main-content" className="workspace container"><Link href={`/lessons/${challenge.lessonId}`} className="breadcrumb">← Revisit the lesson</Link><div className="page-heading"><span className="eyebrow">YOUR PRACTICE CHALLENGE</span><h1>{challenge.title}</h1><p>You’ve learned the idea. Now make something of your own.</p></div><ChallengeWorkspace key={challenge.id} challenge={challenge} /></main>;
}
