---
name: portfolio-web-router
description: Mandatory router for ANY request in this project (React + Tailwind academic portfolio landing with Webflow-style animations). Use before designing, building, styling, animating, reviewing, or refactoring any page, section, component, or interaction. Decides which installed design, animation, and React skills to load.
---

# Portfolio Web Router

This project is a landing page for a university course (Multimedia Design) that showcases the course structure and the team's work. Stack: React + Tailwind, with heavy animation inspired by Webflow interactions.

## Rule

Before doing any work here, load the skills below that match the task. Do not skip this because a task looks small. Several skills usually apply at once.

## Routing table

| Task | Load |
|---|---|
| Any new UI, section, layout, or visual direction | `frontend-design`, `design-taste-frontend` |
| Palette, typography, spacing, UX decisions, accessibility, landing structure | `ui-ux-pro-max` |
| Writing or refactoring React components, state, effects, data, bundle size | `vercel-react-best-practices` |
| Scroll-driven animation, pinning, scrub, parallax, timelines, text splitting, Flip | `gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, plus `gsap-plugins` for SplitText, Flip, Observer, ScrollSmoother |
| GSAP jank, FPS, or cleanup problems | `gsap-performance` |
| Number mapping, clamp, snap, interpolation | `gsap-utils` |
| Component-level animation: enter/exit, layout, hover/tap, gestures, shared layout, variants | `motion-framer` |
| Reviewing a finished page for polish | `design-taste-frontend`, `ui-ux-pro-max` |

`gsap-frameworks` is for Vue/Svelte and does not apply to this React project. Skip it.

## Choosing the animation engine

- **GSAP** drives page-level choreography: ScrollTrigger sections, pinned scenes, timelines, SplitText reveals.
- **Motion (Framer)** drives component-level behavior: mount/unmount, hover, tap, layout transitions, `AnimatePresence`.
- Never animate the same element with both engines. Pick one per element and keep each section's choice consistent.
- In React, always clean up GSAP with `useGSAP` or `gsap.context()`.

## Quality bar for every animation

- Animate `transform` and `opacity` only; avoid layout-triggering properties.
- Respect `prefers-reduced-motion` (`gsap.matchMedia()` or Motion's reduced-motion support) and provide a static fallback.
- Check mobile behavior and scroll performance before calling a section done.

## Workflow

1. Identify the task type from the table and load the matching skills.
2. Follow their guidance. If two skills disagree, `design-taste-frontend` wins on visual taste and `vercel-react-best-practices` wins on React code.
3. Verify in the browser (dev server) before reporting done, including a reduced-motion check when animation was touched.

## Scope and content rules

- Work only inside this project folder (`004-Facultad/002-Portfolio/web-portfolio`).
- Do not invent course content, team members, grades, or project details. Ask the user for real content and mark placeholders clearly as placeholders.
- Preserve academic authorship: credit team members and sources as the user provides them.
- UI copy and code identifiers are in English unless the user asks otherwise for the page content.
