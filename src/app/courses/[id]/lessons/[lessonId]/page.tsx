import type { Metadata } from "next";
import { PracticeCourseScreen } from "@/components/practice-course-screen";

export const metadata: Metadata = { title: "Practice and reflect" };

export default async function PracticeLessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  return <main id="main-content" className="workspace container"><PracticeCourseScreen key={`${id}:${lessonId}`} id={id} lessonId={lessonId} mode="lesson" /></main>;
}
