import type { Metadata } from "next";
import { PracticeCourseScreen } from "@/components/practice-course-screen";

export const metadata: Metadata = { title: "Your practice course" };

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main id="main-content" className="workspace container"><PracticeCourseScreen key={id} id={id} /></main>;
}
