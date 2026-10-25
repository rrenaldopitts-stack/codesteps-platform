import type { Metadata } from "next";
import Link from "next/link";
import { PracticeCourses } from "@/components/practice-courses";

export const metadata: Metadata = { title: "My notes-based courses" };

export default function CoursesPage() {
  return <main id="main-content" className="workspace container"><div className="page-heading"><span className="eyebrow">LEARN FROM YOUR OWN NOTES</span><h1>Make your notes work harder.</h1><p>Your notes → clear explanations → real-world connections → practice → reflection.</p><Link href="/courses/new" className="button primary">Create a course <span aria-hidden="true">↗</span></Link></div><div className="demo-banner">Courses are saved on this server for your browser session. <Link href="/account" className="text-link">Create an account or sign in</Link> to keep access across browsers. Cookies must be enabled. Don’t store sensitive information.</div><PracticeCourses /></main>;
}
