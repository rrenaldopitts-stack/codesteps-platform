import type { SVGProps } from "react";

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.55.1.75-.24.75-.53v-2.1c-3.06.66-3.7-1.3-3.7-1.3-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.1.08 1.69 1.13 1.69 1.13.98 1.68 2.58 1.2 3.21.92.1-.71.39-1.2.7-1.48-2.45-.28-5.03-1.23-5.03-5.45 0-1.2.43-2.18 1.13-2.95-.12-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.55 0c2.12-1.43 3.05-1.13 3.05-1.13.6 1.52.23 2.64.11 2.92.71.77 1.13 1.75 1.13 2.95 0 4.23-2.59 5.17-5.05 5.44.4.35.75 1.02.75 2.06v3.07c0 .3.2.64.76.53A11.1 11.1 0 0 0 12 .9Z" /></svg>;
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><rect x="2" y="8" width="4" height="14" rx=".5" /><circle cx="4" cy="3.5" r="2.2" /><path d="M9 8h3.8v1.9c.9-1.4 2.2-2.2 4.1-2.2 4 0 5.1 2.5 5.1 6V22h-4v-7.3c0-1.8-.2-3.4-2.4-3.4s-2.6 1.6-2.6 3.3V22H9V8Z" /></svg>;
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><path d="m3 3 14 18h4L7 3H3Z" /><path d="m3 21 7-8m4-2 7-8" /></svg>;
}
