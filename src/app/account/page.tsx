import type { Metadata } from "next";
import { AccountWorkspace } from "@/components/account-workspace";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return <main id="main-content" className="workspace container">
    <div className="page-heading"><span className="eyebrow">YOUR LEARNING, SAVED</span><h1>Your account</h1><p>Keep your progress and reflections across visits with a local account.</p></div>
    <AccountWorkspace />
  </main>;
}
