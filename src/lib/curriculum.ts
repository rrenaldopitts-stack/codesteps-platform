import type { Challenge, Lesson, Module } from "./types";

export const modules: Module[] = [
  { id: "web-foundations", title: "HTML & CSS", description: "Give your ideas structure, then bring them to life with style.", level: "01", duration: "25 min", icon: "</>", lessonIds: ["your-first-page"] },
  { id: "javascript", title: "JavaScript essentials", description: "Think in variables, functions, and small, useful interactions.", level: "02", duration: "30 min", icon: "JS", lessonIds: ["friendly-functions"] },
  { id: "react", title: "React foundations", description: "Turn reusable components into interfaces people love.", level: "03", duration: "35 min", icon: "⚛", lessonIds: ["your-first-component"] },
  { id: "apis", title: "Working with APIs", description: "Connect your interface to a world of real data.", level: "04", duration: "30 min", icon: "{ }", lessonIds: ["fetch-your-first-api"] },
];

export const lessons: Lesson[] = [
  {
    id: "your-first-page", moduleId: "web-foundations", title: "Build your first profile card", duration: "15 min",
    introduction: "HTML describes what your content means. CSS controls how it looks. Start with a small profile card: a little piece of the web that introduces you.",
    steps: ["Use an <article> to group a self-contained profile.", "Add an <h1> for your name and a <p> for what you want to learn.", "Use a descriptive <a> link to a project. Style the card with padding, a border, and a readable color contrast."],
    task: "Create a profile card with your name, a learning goal, and a project link. Add a CSS class that gives the card breathing room. Explain why you chose each HTML element.",
    starterCode: '<article class="profile">\n  <!-- Add your name, goal, and project link -->\n</article>\n\n<style>\n  .profile {\n    /* Give your content some space */\n  }\n</style>',
    hint: "Think of the card as a container. Which heading tells a reader who you are? Start with that one element, then add a paragraph. Try padding: 1.5rem to create space inside the card.",
    review: "Check that your heading describes the card, your link text makes sense without surrounding words, and your text is readable. Can you explain the difference between padding and margin?",
  },
  {
    id: "friendly-functions", moduleId: "javascript", title: "Write a friendly greeting function", duration: "20 min",
    introduction: "A function packages a small job so you can use it again. Parameters are inputs; a return value is the output. Keep those separate from logging the result.",
    steps: ["Declare a function named greet that takes a name parameter.", "Return a greeting string using the name.", "Call the function with two different names. Decide what should happen for an empty name."],
    task: "Write greet(name) to return a personalized greeting. If the name is empty or only spaces, greet a 'learner' instead.",
    starterCode: 'function greet(name) {\n  // Return a friendly greeting\n}\n\nconsole.log(greet("Ada"));\nconsole.log(greet(""));',
    hint: "Use name.trim() to remove surrounding spaces. An empty string is falsy, so you can choose a fallback with ||. What is the difference between return and console.log?",
    review: "Try a normal name, an empty string, and spaces. Does the function return a string in every case? Keep the input unchanged and choose a name that explains the output.",
  },
  {
    id: "your-first-component", moduleId: "react", title: "Create a reusable learning card", duration: "25 min",
    introduction: "A React component is a function that returns UI. Props let one component display different information without copying its markup.",
    steps: ["Create a LearningCard component with title and description props.", "Return an article with a heading and paragraph.", "Render the component twice with different prop values. Use a type to describe those props."],
    task: "Build a typed LearningCard component and show two cards. Keep the content in props rather than hard-coding it inside the component.",
    starterCode: 'type LearningCardProps = {\n  title: string;\n  description: string;\n};\n\nfunction LearningCard(props: LearningCardProps) {\n  // Return your card markup\n}',
    hint: "JSX uses curly braces to display JavaScript values. Try putting props.title inside a heading. Your function needs to return one parent element.",
    review: "Can the same component show different lessons without changes? Check the prop types, semantic headings, and whether the description is actually rendered.",
  },
  {
    id: "fetch-your-first-api", moduleId: "apis", title: "Read data from an API", duration: "20 min",
    introduction: "An API lets programs exchange data. Fetching is asynchronous: the network may be slow or fail, so handle both success and failure deliberately.",
    steps: ["Use fetch('/api/modules') in an async function.", "Check response.ok before reading JSON.", "Read the data property of the response and display the module titles. Show a helpful message if the request fails."],
    task: "Write an async loadModules function that fetches /api/modules, returns its data array, and handles a non-OK response. Explain where a loading state would belong in a UI.",
    starterCode: 'async function loadModules() {\n  // Fetch, check the response, and read the JSON\n}',
    hint: "await fetch(...) gives you a Response, not the data itself. Check response.ok, then await response.json(). This API wraps successful results in { data: ... }.",
    review: "What happens when the server returns an error or the network is offline? Check that the JSON is awaited and the caller can distinguish failure from an empty list.",
  },
];

export const challenges: Challenge[] = [
  { id: "profile-card", lessonId: "your-first-page", title: "A little card. A big first step.", description: "Make a profile card for a fellow learner. Include their name, one learning goal, and a descriptive project link. Style it to be readable on a narrow screen.", starterCode: '<article class="learner-card">\n  <!-- Your independent attempt starts here -->\n</article>', rubric: ["Use semantic HTML with a meaningful heading.", "Include a goal and a descriptive, keyboard-accessible link.", "Add spacing and readable foreground/background colors.", "Check the layout at a narrow screen width.", "Explain one design choice without asking AI."] },
  { id: "greeting-function", lessonId: "friendly-functions", title: "Make everyone feel welcome", description: "Write a greeting function that trims a name and uses a friendly fallback for empty input. Test it with three different inputs.", starterCode: 'function greet(name) {\n  // Your independent attempt\n}', rubric: ["Return a greeting rather than only logging it.", "Use the provided name in the output.", "Handle empty and whitespace-only names.", "Try at least three inputs.", "Explain your fallback logic in your own words."] },
  { id: "reusable-card", lessonId: "your-first-component", title: "One component, two stories", description: "Create a typed card component and use it for two different learning goals.", starterCode: 'type CardProps = { title: string; goal: string };\n\nfunction Card(props: CardProps) {\n  // Your independent attempt\n}', rubric: ["Define typed props.", "Render the title and goal from props.", "Use semantic markup.", "Show two cards with different content.", "Explain why props are useful."] },
  { id: "module-loader", lessonId: "fetch-your-first-api", title: "Bring your curriculum to life", description: "Fetch the module list from /api/modules and describe how your UI should handle loading, success, and failure.", starterCode: 'async function loadModules() {\n  // Your independent attempt\n}', rubric: ["Fetch the correct endpoint.", "Check the HTTP response status.", "Await the JSON response and read its data array.", "Handle network and server failures.", "Describe a clear loading and error experience."] },
];
