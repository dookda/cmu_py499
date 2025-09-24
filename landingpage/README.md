# py499 / geodev.fun Landing Page

This repository now also contains the **geodev.fun** production‑ready landing page built with Vite + React + TypeScript + Tailwind CSS + Framer Motion + lucide-react.

## Features
- Hero section with clear value proposition & CTAs
- Feature trio highlighting strengths
- Exactly 7 data‑driven project cards (title, blurb, up to 4 tech badges, Demo + optional Repo buttons)
- CTA band + accessible footer
- Dark mode (class strategy + system preference fallback)
- Accessibility: keyboard focus styles, aria labels, WCAG AA contrast mindful
- Mobile‑first responsive layout
- Configured ESLint + TypeScript strict mode

## Tech Stack
React 18, Vite 5, TypeScript 5, Tailwind 3, Framer Motion 11, lucide-react icons

## Getting Started
```bash
pnpm install
pnpm dev
```
Open: http://localhost:5173

### Type Checking & Linting
```bash
pnpm typecheck
pnpm lint
```

### Production Build
```bash
pnpm build
pnpm preview
```

## Structure
```
index.html
vite.config.ts
tailwind.config.cjs
postcss.config.cjs
src/
	main.tsx
	App.tsx
	styles.css
	components/
		Feature.tsx
		ProjectCard.tsx
	data/
		projects.ts
```

## Projects Data
`src/data/projects.ts` exports exactly 7 projects with shape:
```ts
interface Project {
	id: string;
	title: string;
	description: string; // 1–2 sentences
	tech: string[];      // up to 4 displayed
	demoUrl: string;     // required
	repoUrl?: string;    // optional
}
```

## Accessibility Notes
- Visible focus outline ring
- Semantic sections (`header`, `nav`, `section`, `footer`)
- `aria-label` where context improves clarity
- Color contrast checked for light/dark themes

## Dark Mode
- Persists preference via `localStorage`
- Falls back to `prefers-color-scheme`
- Toggle in header

## Lighthouse Targets (Desktop)
Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO ≥95 (meta description present)

## License
MIT (add LICENSE file if distribution requires).

---
Legacy academic materials remain in their original folders.