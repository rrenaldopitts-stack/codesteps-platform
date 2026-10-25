import Link from "next/link";
import { notFound } from "next/navigation";
import { challenges, lessons, modules } from "@/lib/curriculum";
import { LearningWorkspace } from "@/components/learning-workspace";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: lessons.find((lesson) => lesson.id === id)?.title ?? "Lesson not found" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = lessons.find((item) => item.id === id);
  const challenge = challenges.find((item) => item.lessonId === id);
  if (!lesson || !challenge) notFound();
  const learningModule = modules.find((item) => item.id === lesson.moduleId)!;
  return <main id="main-content" className="workspace container">
    <Link href="/dashboard" className="breadcrumb">← Back to your learning path</Link>
    <div className="page-heading"><span className="eyebrow">{learningModule.title} · {lesson.duration} · BEGINNER</span><h1>{lesson.title}</h1><p>Understand the idea. Give it a try. Ask for a nudge. Make it yours.</p></div>
    <LearningWorkspace key={lesson.id} lesson={lesson} challenge={challenge} />
  </main>;
}
