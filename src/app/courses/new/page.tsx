import type { Metadata } from "next";
import Link from "next/link";
import { PracticeNotesForm } from "@/components/practice-notes-form";

export const metadata: Metadata = { title: "Create a course from notes" };

export default function NewCoursePage() {
  return <main id="main-content" className="workspace container"><Link className="breadcrumb" href="/courses">← My courses</Link><div className="page-heading"><span className="eyebrow">START WHERE YOU ARE</span><h1>What are you learning?</h1><p>Paste notes, import a text file, or try a sample. Add more notes later to grow your practice course without losing earlier work.</p></div><PracticeNotesForm /></main>;
}
