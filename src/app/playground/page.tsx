import type { Metadata } from "next";
import Link from "next/link";
import { CodeTerminal } from "@/components/code-terminal";

export const metadata: Metadata = { title: "JavaScript practice terminal" };

export default function PlaygroundPage() {
  return <main id="main-content" className="workspace container"><Link className="breadcrumb" href="/courses">← My courses</Link><div className="page-heading"><span className="eyebrow">EXPERIMENT WITH ONE SMALL IDEA</span><h1>Your code practice terminal.</h1><p>Predict the output, run a small example, then explain why it happened.</p></div><CodeTerminal /></main>;
}
