import Link from "next/link";
import { modules } from "@/lib/curriculum";

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> SMALL STEPS. REAL SKILLS.</span>
          <h1>Learn to code.<br />Think for yourself.<br /><span className="text-teal">Build with AI.</span></h1>
          <p className="lead">Your ideas deserve to become real things. Learn the foundations, practice by building, and make AI your learning partner—not your shortcut.</p>
          <div className="button-row">
            <Link className="button primary" href="/dashboard">Start learning <span aria-hidden="true">↗</span></Link>
            <Link className="button secondary" href="#curriculum">Explore the curriculum <span aria-hidden="true">↓</span></Link>
          </div>
          <p className="microcopy">Free to explore <span>·</span> No experience needed <span>·</span> Learn at your pace</p>
          <div className="hero-proof"><div className="mini-avatars" aria-hidden="true"><b>Y</b><b>AI</b><b>↗</b></div><p>A little curiosity is all you need.<br /><strong>We’ll help you take the first step.</strong></p></div>
        </div>
        <div className="hero-demo">
          <div className="editor-window">
            <div className="editor-bar"><span className="window-dots" aria-hidden="true">● ● ●</span><span>your-first-step.js</span><span className="editor-language">JavaScript</span></div>
            <div className="code-example" aria-label="Example JavaScript greeting function">
              <div><span className="line-number">1</span><span className="code-comment">{"// Every developer starts somewhere."}</span></div>
              <div><span className="line-number">2</span></div>
              <div><span className="line-number">3</span><span className="code-purple">function</span> <span className="code-blue">greet</span>(name) {"{"}</div>
              <div><span className="line-number">4</span>{"  "}<span className="code-purple">return</span> <span className="code-green">`Hello, ${"{name}"}!`</span>;</div>
              <div><span className="line-number">5</span>{"}"}</div>
              <div><span className="line-number">6</span></div>
              <div><span className="line-number">7</span><span className="code-blue">greet</span>(<span className="code-green">&quot;future developer&quot;</span>);</div>
            </div>
            <div className="terminal-output"><span>OUTPUT</span><p><span className="text-teal">→</span> Hello, future developer!</p></div>
          </div>
          <div className="hint-preview"><div className="hint-icon" aria-hidden="true">✧</div><div><strong>A nudge, not the answer.</strong><p>What do you think happens if you change the name? Try it and see.</p><span className="tiny-tag">YOUR AI LEARNING PARTNER</span></div></div>
          <div className="floating-label"><span aria-hidden="true">✓</span> Understanding unlocked</div>
        </div>
      </section>
      <div className="principle-strip"><div className="container"><span>Built for the way you actually learn.</span><strong>✧ Guided, not spoon-fed</strong><strong>⌘ Practice over theory</strong><strong>↗ Progress, not perfection</strong></div></div>
      <section className="section container" id="how-it-works">
        <div className="section-heading"><div><span className="eyebrow">THE CODESTEPS WAY</span><h2>A better loop for learning.</h2></div><p>Less staring at tutorials.<br />More “I built that.”</p></div>
        <div className="three-grid">
          {[["01", "Learn one small thing", "Bite-sized lessons make big ideas feel manageable. Understand the why before you write the how."], ["02", "Try it. Then ask AI.", "Get your hands on the code first. When you’re stuck, use a thoughtful hint to find your own way forward."], ["03", "Reflect. Make it stick.", "Test your understanding with a challenge. Write down what clicked, then take your next step."]].map(([number, title, description]) => (
            <article className="step-card" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>
      <section className="curriculum-section" id="curriculum"><div className="container section">
        <div className="section-heading"><div><span className="eyebrow">YOUR LEARNING PATH</span><h2>From curious to capable.</h2></div><Link className="text-link" href="/dashboard">View your dashboard <span aria-hidden="true">↗</span></Link></div>
        <div className="module-grid">{modules.map((module) => (
          <Link href={`/lessons/${module.lessonIds[0]}`} className="module-card" key={module.id}><div className="card-top"><span className="module-icon">{module.icon}</span><span className="muted">STEP {module.level}</span></div><h3>{module.title}</h3><p>{module.description}</p><div className="card-footer"><span>{module.duration} · Beginner</span><span aria-hidden="true">↗</span></div></Link>
        ))}</div>
      </div></section>
      <section className="section container benefits">
        <div><span className="eyebrow">AI AS A PARTNER, NOT AUTOPILOT</span><h2>Don’t just get the answer.<br />Become the person<br />who understands it.</h2><p className="lead">Build confidence that lasts beyond the chat window.</p></div>
        <ul className="benefit-list"><li><span>✓</span><div><h3>Build real understanding</h3><p>Hints help you connect the dots, not skip them.</p></div></li><li><span>✓</span><div><h3>Make mistakes safely</h3><p>Experiment in your own editor. There’s no timer and no pressure.</p></div></li><li><span>✓</span><div><h3>See how far you’ve come</h3><p>Track completed lessons and capture your lightbulb moments.</p></div></li></ul>
      </section>
      <section className="container"><div className="closing-cta"><span className="eyebrow">YOUR NEXT CHAPTER STARTS WITH ONE LINE.</span><h2>You don’t need to know it all.<br />You just need to start.</h2><Link className="button primary" href="/dashboard">Take your first step <span aria-hidden="true">↗</span></Link><p>No account needed. Just bring your curiosity.</p></div></section>
    </main>
  );
}
