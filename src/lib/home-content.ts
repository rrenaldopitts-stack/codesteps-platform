export type TopicName = "JavaScript" | "Python" | "React" | "SQL" | "TypeScript" | "Node.js" | "AI Engineering";
export type RoadmapId = "frontend" | "backend" | "ai";

export interface TopicPreview {
  name: TopicName;
  aliases: string[];
  description: string;
  steps: string[];
  href: string;
  action: string;
}

export interface LearningRoadmap {
  id: RoadmapId;
  title: string;
  description: string;
  difficulty: "Beginner friendly" | "Intermediate";
  topics: string[];
  firstStep: string;
  href: string;
}

export const topicPreviews: TopicPreview[] = [
  { name: "JavaScript", aliases: ["js", "javascript"], description: "Turn small ideas into interactive experiences, one function at a time.", steps: ["Variables & types", "Arrays & functions", "DOM & events", "A tiny interactive app"], href: "/lessons/friendly-functions", action: "Start JavaScript basics" },
  { name: "Python", aliases: ["python", "py"], description: "Start with readable code, then explore automation and working with data.", steps: ["Values & variables", "Lists & dictionaries", "Functions & files", "A small automation script"], href: "https://docs.python.org/3/tutorial/", action: "Open the Python tutorial" },
  { name: "React", aliases: ["react", "reactjs", "react.js"], description: "Compose reusable UI and learn how data flows through an application.", steps: ["JSX", "Components & props", "State & events", "A reusable card project"], href: "/lessons/your-first-component", action: "Start React basics" },
  { name: "SQL", aliases: ["sql", "database", "databases", "postgresql", "postgres"], description: "Ask useful questions of your data with clear, structured queries.", steps: ["Tables & rows", "SELECT & WHERE", "JOIN & GROUP BY", "A sales-report query"], href: "https://www.postgresql.org/docs/current/tutorial.html", action: "Open the PostgreSQL tutorial" },
  { name: "TypeScript", aliases: ["typescript", "ts"], description: "Make JavaScript easier to reason about with explicit types and helpful feedback.", steps: ["JavaScript foundations", "Types & interfaces", "Unions & narrowing", "Type a small application"], href: "https://www.typescriptlang.org/docs/handbook/intro.html", action: "Open the TypeScript handbook" },
  { name: "Node.js", aliases: ["node.js", "node", "nodejs"], description: "Take JavaScript beyond the browser and learn the basics of server-side code.", steps: ["JavaScript fundamentals", "Node runtime", "HTTP & APIs", "A small backend service"], href: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", action: "Read the Node.js introduction" },
  { name: "AI Engineering", aliases: ["ai engineering", "ai", "llm", "machine learning"], description: "Build from programming fundamentals toward thoughtful, testable AI applications.", steps: ["Python foundations", "Data & machine learning", "LLMs & evaluation", "An AI-powered prototype"], href: "https://huggingface.co/learn/llm-course/chapter1/1", action: "Explore the Hugging Face course" },
];

export const learningRoadmaps: LearningRoadmap[] = [
  { id: "frontend", title: "Frontend Development", description: "Bring ideas to life with interfaces people love to use.", difficulty: "Beginner friendly", topics: ["HTML", "CSS", "JavaScript", "React", "Next.js"], firstStep: "Start by building a semantic profile card. Then add style, interaction, reusable components, and routing.", href: "/lessons/your-first-page" },
  { id: "backend", title: "Backend Development", description: "Build the systems that make great applications work.", difficulty: "Intermediate", topics: ["Node.js", "APIs", "Databases", "Authentication"], firstStep: "Understand HTTP requests and responses first. Practice reading an API before building your own service.", href: "/lessons/fetch-your-first-api" },
  { id: "ai", title: "AI Engineering", description: "Go from curious about AI to building useful applications.", difficulty: "Intermediate", topics: ["Python", "Machine Learning", "LLMs", "AI Applications"], firstStep: "Start with Python fundamentals, then learn how to evaluate model outputs before connecting an AI model to an app.", href: "https://huggingface.co/learn/llm-course/chapter1/1" },
];

export interface LearnerStory {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

// Illustrative placeholders, not claims about actual users or outcomes.
export const learnerStories: LearnerStory[] = [
  { quote: "Breaking a big topic into small steps makes starting feel possible. I can focus on one thing, then put it into practice.", name: "Alex Morgan", role: "Frontend learner", initials: "AM" },
  { quote: "The real-world examples help me understand why a concept matters—not just how to write the syntax.", name: "Priya Shah", role: "Career explorer", initials: "PS" },
  { quote: "I like having a hint before the answer. Explaining my own solution is where things finally start to click.", name: "Jordan Lee", role: "Self-taught learner", initials: "JL" },
];
