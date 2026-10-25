import { ArrowUpRight, Check, CircleCheck, CodeXml, Sparkles, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CodePreview() {
  return <div className="lf-code-scene relative min-w-0 pt-5 pb-8 lg:pl-3" aria-label="Illustrative JavaScript lesson preview">
    <div className="lf-code-window relative overflow-hidden rounded-xl border">
      <div className="lf-code-titlebar flex items-center justify-between border-b px-5 py-4">
        <span className="flex gap-1.5" aria-hidden="true"><i className="size-2.5 rounded-full bg-rose-400/80" /><i className="size-2.5 rounded-full bg-amber-300/80" /><i className="size-2.5 rounded-full bg-emerald-400/80" /></span>
        <span className="flex items-center gap-2 text-[10px] text-slate-300"><CodeXml className="size-3.5" aria-hidden="true" /> your-next-breakthrough.js</span>
        <span className="text-[9px] text-slate-400">JS</span>
      </div>
      <div className="flex items-center gap-2 px-5 pt-5 text-[10px] text-slate-400"><span className="lf-code-language">JavaScript</span><span>/</span><span>Your first function</span><Badge className="ml-auto lf-demo-badge">DEMO</Badge></div>
      <div className="lf-preview-code overflow-x-auto px-5 py-6 font-mono text-[11px] leading-[2.15] sm:text-xs">
        <div><span className="lf-line-number">1</span><span className="text-slate-400">{"// Big things start with a little curiosity."}</span></div>
        <div><span className="lf-line-number">2</span></div>
        <div><span className="lf-line-number">3</span><span className="text-violet-300">const</span>{" learner = {"}</div>
        <div><span className="lf-line-number">4</span>{"  name: "}<span className="text-emerald-300">&quot;Future developer&quot;</span>,</div>
        <div><span className="lf-line-number">5</span>{"  curiosity: "}<span className="text-amber-200">Infinity</span>,</div>
        <div><span className="lf-line-number">6</span>{"  readyToBuild: "}<span className="text-violet-300">true</span></div>
        <div><span className="lf-line-number">7</span>{"};"}</div>
        <div><span className="lf-line-number">8</span></div>
        <div><span className="lf-line-number">9</span><span className="text-sky-300">startLearning</span>(learner); <span className="text-slate-400">{"// Let’s do this. ↗"}</span></div>
      </div>
      <div className="lf-code-output mx-5 border-t py-4 text-xs"><span className="flex items-center gap-2 text-[9px] tracking-widest text-slate-400"><Terminal className="size-3" aria-hidden="true" /> OUTPUT PREVIEW</span><p className="mt-3 flex items-center gap-2 text-emerald-300"><Check className="size-3.5" aria-hidden="true" /> Your learning journey starts here.</p></div>
    </div>
    <div className="lf-preview-hint relative mx-4 -mt-0.5 flex gap-3 rounded-b-xl border p-5 sm:mr-9 sm:ml-7">
      <span className="lf-icon-box mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg"><Sparkles className="size-4" aria-hidden="true" /></span>
      <div><div className="mb-1 flex items-center justify-between gap-4"><strong className="text-xs">A learning partner, not a shortcut.</strong><ArrowUpRight className="lf-muted size-3.5 shrink-0" aria-hidden="true" /></div><p className="lf-muted text-xs leading-6">Understand the why. Try it yourself. Ask for a nudge when you need one.</p><span className="lf-kicker mt-2 inline-block !text-[8px]">THINK FIRST. BUILD WITH CONFIDENCE.</span></div>
    </div>
    <div className="lf-unlocked absolute right-0 bottom-2 flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] shadow-lg sm:right-1"><CircleCheck className="size-3.5" aria-hidden="true" /> One step closer to “I built that.”</div>
  </div>;
}
