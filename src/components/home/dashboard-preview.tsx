import Link from "next/link";
import { ArrowRight, BookOpen, Check, Flame, LayoutDashboard, Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardPreview() {
  return <div className="lf-dashboard-preview overflow-hidden rounded-2xl border shadow-2xl" aria-label="Demo learning dashboard with sample data">
    <div className="lf-preview-top flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"><span className="flex items-center gap-2 text-xs font-semibold"><LayoutDashboard className="lf-accent size-4" aria-hidden="true" /> Your learning workspace</span><Badge>SAMPLE DATA · NOT YOUR ACCOUNT</Badge></div>
    <div className="grid lg:grid-cols-[180px_1fr]">
      <aside className="lf-preview-sidebar hidden border-r px-4 py-6 lg:block" aria-hidden="true">
        <div className="lf-kicker mb-5 !text-[9px]">YOUR WORKSPACE</div>
        <div className="lf-sidebar-active mb-2 flex items-center gap-2 rounded-md px-3 py-2.5 text-xs"><LayoutDashboard className="size-3.5" /> Overview</div>
        <div className="lf-muted mb-2 flex items-center gap-2 px-3 py-2.5 text-xs"><BookOpen className="size-3.5" /> My courses</div>
        <div className="lf-muted flex items-center gap-2 px-3 py-2.5 text-xs"><Trophy className="size-3.5" /> Achievements</div>
        <div className="lf-sidebar-tip mt-12 rounded-lg border p-3"><Zap className="lf-accent mb-2 size-4" /><strong className="text-[11px]">A little every day.</strong><p className="lf-muted mt-1 text-[10px] leading-5">Small steps add up to real skills.</p></div>
      </aside>
      <div className="min-w-0 p-5 sm:p-7">
        <div className="mb-6"><h3 className="lf-card-title">Keep the momentum going.</h3><p className="lf-muted mt-1 text-xs">Here’s what a learning journey could look like.</p></div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[{ icon: Zap, label: "XP points", value: "1,250", tone: "violet" }, { icon: BookOpen, label: "Lessons completed", value: "12", tone: "cyan" }, { icon: Flame, label: "Current streak", value: "7 days", tone: "orange" }].map(({ icon: Icon, label, value, tone }) => <div className="lf-metric rounded-lg border p-3 sm:p-4" key={label}><Icon className={`lf-tone-${tone} mb-3 size-4`} aria-hidden="true" /><strong className="block text-lg font-semibold sm:text-2xl">{value}</strong><span className="lf-muted mt-1 block text-[10px]">{label}</span></div>)}
        </div>
        <div className="grid gap-5 md:grid-cols-[1.15fr_1fr]">
          <div className="lf-metric rounded-lg border p-4">
            <span className="lf-kicker !text-[9px]">CONTINUE LEARNING</span><h4 className="mt-3 text-sm font-semibold">JavaScript essentials</h4><p className="lf-muted mt-1 text-xs">Functions, arrays & a few lightbulb moments.</p>
            <div className="lf-muted mt-5 mb-2 flex justify-between text-[10px]"><span>Course progress</span><span>65%</span></div><Progress value={65} aria-label="Sample JavaScript course progress" />
            <Button asChild size="sm" variant="outline" className="mt-5 w-full"><Link href="/lessons/friendly-functions">Try a real lesson <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
          <div><h4 className="mb-3 text-xs font-semibold">Recent activity <span className="lf-muted font-normal">· sample</span></h4><ul className="space-y-4">
            {[["Completed “Your first function”", "+50 XP · Today"], ["Practiced array methods", "+30 XP · Yesterday"], ["Finished a mini challenge", "+100 XP · Yesterday"]].map(([activity, detail]) => <li className="flex gap-2.5" key={activity}><span className="lf-activity-check mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"><Check className="size-3" aria-hidden="true" /></span><div><span className="block text-[11px]">{activity}</span><span className="lf-muted mt-1 block text-[10px]">{detail}</span></div></li>)}
          </ul></div>
        </div>
      </div>
    </div>
  </div>;
}
