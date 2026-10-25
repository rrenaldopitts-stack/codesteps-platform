import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BrainCircuit, Check,
  ChevronRight, CodeXml, Compass, Globe2, GraduationCap,
  Layers3, MessageCircle, Play, Rocket, Route, Server,
  ShieldCheck, Sparkles, Star, TrendingUp, WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingShell } from "@/components/home/landing-shell";
import { CodePreview } from "@/components/home/code-preview";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { LearningJournal } from "@/components/home/learning-journal";
import { SectionHeading } from "@/components/home/section-heading";
import { TopicSearch } from "@/components/home/topic-search";
import { GitHubIcon, LinkedInIcon, TwitterIcon } from "@/components/home/social-icons";
import { learnerStories, learningRoadmaps, type RoadmapId } from "@/lib/home-content";
import "./home.css";

export const metadata: Metadata = {
  title: "LearnFlow AI — Master programming through AI-powered learning",
  description: "Find your next programming topic, explore learning roadmaps, and practice with guided lessons, quizzes, and real-world examples. Build understanding, not just working code.",
};

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "violet" | "cyan" | "orange" | "green" | "pink" | "blue";
  label: string;
  href: string;
}

const features: Feature[] = [
  { title: "AI Course Generator", description: "Generate custom programming courses from your notes. Local templates work now; live AI guidance is optional.", icon: WandSparkles, tone: "violet", label: "Create a course", href: "/courses/new" },
  { title: "Learning Roadmaps", description: "Find a clear direction, from your first line of code to the bigger ideas you want to explore.", icon: Route, tone: "cyan", label: "Find your path", href: "#learning-paths" },
  { title: "Practice Challenges", description: "Put concepts to work with small coding exercises, thoughtful hints, and solutions to compare.", icon: CodeXml, tone: "orange", label: "Try a challenge", href: "/challenges" },
  { title: "Real-World Examples", description: "Connect the dots between a coding concept and the products and experiences it can power.", icon: Globe2, tone: "green", label: "Explore a lesson", href: "/lessons/your-first-page" },
  { title: "AI Tutor", description: "Ask questions, untangle errors, and get beginner-friendly guidance that helps you think for yourself.", icon: MessageCircle, tone: "pink", label: "Meet your coding coach", href: "/playground" },
  { title: "Progress Tracking", description: "Track saved-course lessons, challenges, earned XP, and reflections. Streaks and badges remain design previews.", icon: TrendingUp, tone: "blue", label: "See your progress", href: "/dashboard" },
];

const roadmapIcons: Record<RoadmapId, LucideIcon> = { frontend: Layers3, backend: Server, ai: BrainCircuit };
const roadmapTones: Record<RoadmapId, string> = { frontend: "violet", backend: "cyan", ai: "pink" };

function HeroSection() {
  return <section className="lf-hero relative overflow-hidden" aria-labelledby="hero-title">
    <div className="lf-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div className="lf-container relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-24">
      <div>
        <Badge className="lf-hero-badge mb-6 gap-2"><span className="lf-live-dot size-1.5 rounded-full" aria-hidden="true" /> LESS OVERWHELM. MORE “I BUILT THAT.”</Badge>
        <h1 id="hero-title" className="lf-hero-title">Master Programming<br className="hidden xl:block" /> Through <span className="lf-gradient-text">AI-Powered</span><br className="hidden xl:block" /> Learning</h1>
        <p className="lf-muted mt-6 max-w-xl text-base leading-8">Generate personalized learning paths, practice challenges, quizzes, and real-world coding projects tailored to your goals.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link href="/courses/new">Start Learning <ArrowRight aria-hidden="true" /></Link></Button>
          <Button asChild variant="outline" size="lg"><a href="#learning-paths"><Compass aria-hidden="true" /> Explore Roadmaps</a></Button>
        </div>
        <div className="lf-muted mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px]">
          <span className="flex items-center gap-1.5"><Check className="lf-accent size-3.5" aria-hidden="true" /> Free to explore</span>
          <span className="flex items-center gap-1.5"><Check className="lf-accent size-3.5" aria-hidden="true" /> Beginner friendly</span>
          <span className="flex items-center gap-1.5"><Check className="lf-accent size-3.5" aria-hidden="true" /> Your pace, your path</span>
        </div>
        <div className="lf-hero-note mt-8 flex items-center gap-3 border-t pt-5">
          <div className="lf-icon-box grid size-9 shrink-0 place-items-center rounded-full"><GraduationCap className="size-4" aria-hidden="true" /></div>
          <p className="lf-muted text-xs leading-6">Built for curious minds, not perfect coders.<br /><span className="lf-text">Bring your questions. We’ll help with the next step.</span></p>
        </div>
      </div>
      <CodePreview />
    </div>
    <div className="lf-principles border-y">
      <div className="lf-container grid grid-cols-2 gap-5 py-6 text-[11px] sm:grid-cols-4">
        {[{ icon: Sparkles, text: "Guided by AI. Driven by you." }, { icon: CodeXml, text: "Learn by actually building." }, { icon: ShieldCheck, text: "Understanding over copy-paste." }, { icon: TrendingUp, text: "Small steps. Lasting skills." }].map(({ icon: Icon, text }) => <span className="flex items-center justify-center gap-2.5" key={text}><Icon className="lf-accent size-4 shrink-0" aria-hidden="true" />{text}</span>)}
      </div>
    </div>
  </section>;
}

function FeatureSection() {
  return <section className="lf-container lf-section" id="features" aria-labelledby="features-title">
    <div className="mb-11 text-center"><span className="lf-kicker">YOUR ENTIRE LEARNING TOOLKIT</span><h2 id="features-title" className="lf-section-title mt-3">Everything you need to move forward.</h2><p className="lf-muted mx-auto mt-4 max-w-xl text-sm leading-7">Less jumping between tabs. More connecting ideas, testing your skills, and building something that&apos;s yours.</p></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map(({ title, description, icon: Icon, tone, label, href }) => <Card key={title} className="lf-feature-card group flex h-full flex-col">
        <CardHeader><span className={`lf-icon-tile lf-tile-${tone} grid size-11 place-items-center rounded-xl transition-transform group-hover:-rotate-6`}><Icon className="size-5" aria-hidden="true" /></span><CardTitle className="mt-3">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
        <CardContent className="mt-auto"><Link className="lf-inline-link inline-flex items-center gap-2 text-xs font-semibold" href={href}>{label}<ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></Link></CardContent>
      </Card>)}
    </div>
  </section>;
}

function LearningPathSection() {
  return <section className="lf-path-section border-y" id="learning-paths">
    <div className="lf-container lf-section">
      <SectionHeading eyebrow="A LITTLE DIRECTION GOES A LONG WAY" title="Big goals. A clear path to get there." description="Pick a direction that excites you. These curated roadmaps show what to learn—and how the pieces fit together.">
        <a href="#topic-search" className="lf-inline-link inline-flex shrink-0 items-center gap-2 text-xs font-semibold">Find a topic <ArrowRight className="size-3.5" aria-hidden="true" /></a>
      </SectionHeading>
      <div className="grid gap-5 lg:grid-cols-3">
        {learningRoadmaps.map((path) => {
          const Icon = roadmapIcons[path.id];
          return <Card key={path.id} className="lf-roadmap-card flex flex-col">
            <CardHeader><div className="flex items-center justify-between gap-3"><span className={`lf-icon-tile lf-tile-${roadmapTones[path.id]} grid size-11 place-items-center rounded-xl`}><Icon className="size-5" aria-hidden="true" /></span><Badge>{path.difficulty}</Badge></div><CardTitle className="mt-3">{path.title}</CardTitle><CardDescription>{path.description}</CardDescription></CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ol className="lf-roadmap-topics mb-6 flex flex-wrap items-center gap-2">{path.topics.map((topic, index) => <li className="flex items-center gap-2" key={topic}><span className="rounded-md border px-2 py-1 text-[10px]">{topic}</span>{index < path.topics.length - 1 && <ChevronRight className="lf-muted size-3" aria-hidden="true" />}</li>)}</ol>
              <details className="lf-roadmap-details mt-auto">
                <summary className="lf-button lf-button-outline flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold">View Roadmap <ArrowRight className="size-3.5" aria-hidden="true" /><span className="sr-only"> for {path.title}</span></summary>
                <div className="mt-5"><ol className="lf-expanded-steps space-y-3">{path.topics.map((topic, index) => <li className="flex items-center gap-3 text-xs" key={topic}><span className="lf-step-dot grid size-6 shrink-0 place-items-center rounded-full text-[10px]">{index + 1}</span>{topic}</li>)}</ol><p className="lf-muted my-4 text-xs leading-6">{path.firstStep}</p><Link className="lf-inline-link inline-flex items-center gap-2 text-xs font-semibold" href={path.href} {...(path.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Take the first step <ArrowUpRight className="size-3.5" aria-hidden="true" />{path.href.startsWith("https:") && <span className="sr-only"> (external resource, opens in a new tab)</span>}</Link></div>
              </details>
            </CardContent>
          </Card>;
        })}
      </div>
      <p className="lf-muted mt-6 text-center text-xs">Start with the foundations. Advanced roadmap topics link to a direction—not a promise of a complete hosted course.</p>
    </div>
  </section>;
}

function HowItWorksSection() {
  return <section id="how-it-works" className="lf-container lf-section">
    <div className="mb-12 text-center"><span className="lf-kicker">FROM “WHERE DO I START?” TO “LOOK WHAT I BUILT.”</span><h2 className="lf-section-title mt-3">A simple loop. A smarter way to learn.</h2></div>
    <ol className="grid gap-8 md:grid-cols-3">
      {[{ icon: Compass, number: "01", title: "Choose a Topic", description: "Select what you want to learn. Start with a familiar idea or explore something entirely new." }, { icon: Sparkles, number: "02", title: "Generate Content", description: "Turn your notes into lessons, quizzes, and exercises. Use local guidance or opt into live AI help when configured." }, { icon: Rocket, number: "03", title: "Build Projects", description: "Apply knowledge through real-world projects. Start with a small challenge, then make it your own." }].map(({ icon: Icon, number, title, description }) => <li className="lf-how-step relative text-center" key={number}><div className="lf-step-icon relative mx-auto mb-6 grid size-16 place-items-center rounded-2xl border"><Icon className="size-6" aria-hidden="true" /><span className="lf-step-label absolute -top-2 -right-2 grid size-6 place-items-center rounded-full text-[9px] font-bold">{number}</span></div><h3 className="lf-card-title">{title}</h3><p className="lf-muted mx-auto mt-3 max-w-xs text-sm leading-7">{description}</p></li>)}
    </ol>
  </section>;
}

function TestimonialSection() {
  return <section className="lf-stories-section border-y"><div className="lf-container lf-section">
    <SectionHeading eyebrow="A LITTLE ENCOURAGEMENT" title="Made for the way you want to learn." description="Illustrative learner stories. These names and quotes are placeholder examples, not verified testimonials." />
    <div className="grid gap-5 md:grid-cols-3">{learnerStories.map((story) => <Card key={story.name} className="flex flex-col p-6"><div className="lf-stars mb-5 flex gap-1" aria-label="Illustrative five-star rating">{Array.from({ length: 5 }, (_, index) => <Star className="size-3.5 fill-current" aria-hidden="true" key={index} />)}</div><blockquote className="mb-6 flex-1 text-sm leading-7">“{story.quote}”</blockquote><div className="lf-story-person flex items-center gap-3 border-t pt-5"><span className="lf-avatar grid size-9 place-items-center rounded-full text-[10px] font-semibold" aria-hidden="true">{story.initials}</span><div><span className="block text-xs font-semibold">{story.name}</span><span className="lf-muted text-[10px]">{story.role} · Placeholder</span></div></div></Card>)}</div>
  </div></section>;
}

function Footer() {
  const repository = "https://github.com/rrenaldopitts-stack/codesteps-platform";
  return <footer className="lf-footer border-t">
    <div className="lf-container flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div><Link href="/" className="lf-brand inline-flex items-center gap-2.5"><span className="lf-logo-icon grid size-8 place-items-center rounded-lg"><CodeXml className="size-4" aria-hidden="true" /></span><span>LearnFlow<span className="lf-brand-ai ml-1">AI</span></span></Link><p className="lf-muted mt-3 max-w-xs text-xs leading-6">A little curiosity. A clear next step.<br />A future you built yourself.</p></div>
      <div className="flex flex-col gap-6 sm:items-end">
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-xs"><a href="#how-it-works" className="lf-footer-link">About</a><LearningJournal /><a className="lf-footer-link" href={`${repository}#readme`} target="_blank" rel="noopener noreferrer">Documentation<span className="sr-only"> (opens GitHub in a new tab)</span></a><a className="lf-footer-link" href={`${repository}/issues/new`} target="_blank" rel="noopener noreferrer">Contact<span className="sr-only"> (opens GitHub issue form in a new tab)</span></a></nav>
        <nav aria-label="Social platforms" className="flex items-center gap-4">
          {[{ icon: GitHubIcon, name: "GitHub repository", href: repository }, { icon: LinkedInIcon, name: "Visit LinkedIn", href: "https://www.linkedin.com/" }, { icon: TwitterIcon, name: "Visit Twitter / X", href: "https://x.com/" }].map(({ icon: Icon, name, href }) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="lf-footer-link rounded-sm" aria-label={`${name} (opens in a new tab)`}><Icon className="size-4" aria-hidden="true" /></a>)}
        </nav>
        <span className="lf-muted text-[10px]">Social icons link to the repository or platform homepages.</span>
      </div>
    </div>
    <div className="lf-container"><div className="lf-footer-bottom flex flex-col justify-between gap-2 border-t py-5 text-[10px] sm:flex-row"><span className="lf-muted">LearnFlow AI · Built for learning, one step at a time.</span><span className="lf-muted">Think for yourself. Build with a little help.</span></div></div>
  </footer>;
}

export default function Home() {
  return <LandingShell>
    <main id="main-content">
      <HeroSection />
      <section id="topic-search" aria-labelledby="topic-search-title" className="lf-container lf-section text-center">
        <span className="lf-kicker">FOLLOW YOUR CURIOSITY</span><h2 id="topic-search-title" className="lf-section-title mt-3 mb-4">What do you want to learn today?</h2><p className="lf-muted mx-auto mb-8 max-w-lg text-sm leading-7">One topic is all it takes to find your next step.</p><TopicSearch />
      </section>
      <div className="lf-container"><div className="lf-section-rule border-t" /></div>
      <FeatureSection />
      <LearningPathSection />
      <HowItWorksSection />
      <TestimonialSection />
      <section className="lf-container lf-section" id="dashboard-demo" aria-labelledby="dashboard-preview-title">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><span className="lf-kicker">EVERY SMALL WIN COUNTS</span><h2 className="lf-section-title mt-3" id="dashboard-preview-title">Progress you can actually see.</h2><p className="lf-muted mt-3 max-w-xl text-sm leading-7">A preview of the bigger picture. The metrics below are illustrative; your actual completed lessons and reflections live in your dashboard.</p></div><Button asChild variant="outline" size="sm"><Link href="/dashboard">Open my dashboard <ArrowUpRight aria-hidden="true" /></Link></Button></div>
        <DashboardPreview />
        <p className="lf-muted mt-5 text-center text-[11px]">These numbers are sample data. Your dashboard calculates actual XP from saved completions; streaks and achievements remain design previews.</p>
      </section>
      <section className="lf-container pb-20">
        <div className="lf-cta relative overflow-hidden rounded-2xl border px-6 py-14 text-center sm:px-12 sm:py-16"><span className="lf-kicker inline-flex items-center gap-2"><Sparkles className="size-3.5" aria-hidden="true" /> YOUR FIRST STEP IS THE MOST IMPORTANT ONE</span><h2 className="lf-section-title mt-5">Start Your Coding Journey Today</h2><p className="lf-muted mx-auto mt-4 max-w-lg text-sm leading-7">Learn faster with AI-powered roadmaps, courses, and projects.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild size="lg"><Link href="/courses/new">Get Started Free <ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" size="lg"><a href="#dashboard-demo"><Play className="size-3.5" aria-hidden="true" /> View Demo</a></Button></div><p className="lf-muted mt-5 text-[11px]">No credit card. No pressure. Just possibility.</p></div>
      </section>
    </main>
    <Footer />
  </LandingShell>;
}
