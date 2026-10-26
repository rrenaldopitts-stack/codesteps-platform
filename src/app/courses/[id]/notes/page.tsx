import type { Metadata } from "next";
import { PracticeCourseScreen } from "@/components/practice-course-screen";

export const metadata: Metadata = { title: "Manage course notes" };

export default async function CourseNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main id="main-content" className="workspace container"><PracticeCourseScreen key={id} id={id} mode="notes" /></main>;
}
