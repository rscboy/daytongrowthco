# DaytonGrowthCo Design System

This is the working design standard for DaytonGrowthCo. Use it when designing a page, product surface, sales asset, or marketing touchpoint. It documents the visual decisions already expressed in the site and turns them into repeatable rules.

## 1. Brand in one sentence

DaytonGrowthCo builds useful digital infrastructure around the way a business actually works. The design should make custom software feel tangible, trustworthy, and worth the investment to a practical business owner.

### Audience and job to be done

We serve owners and operators of small and midsized businesses, especially service businesses, contractors, professional offices, and owner-run teams in Dayton and the Miami Valley. Many are evaluating a custom tool between jobs, often on a phone. They need to understand quickly that DaytonGrowthCo can solve a specific operational problem, explain the work plainly, and offer a credible path to action.

### Personality

**Premium, practical, precise.**

The visual experience should feel custom-built and polished, but the language should sound like an honest operator. Confidence comes from specificity, clear process, real interfaces, and practical cost framing, never hype.

## 2. Logo system

### Primary wordmark

The primary logo is the text wordmark **“DaytonGrowthCo.”** set as a single unit. In the live site, “Dayton” carries the indigo accent and “GrowthCo.” uses near-black. Use the existing `BrandWordmark` component whenever the application is available:

```tsx
import { BrandWordmark } from "@/src/brand-wordmark";

<BrandWordmark />
```

Source: `src/brand-wordmark.tsx` and `src/brand-wordmark.module.css`.

Wordmark rules:

- Keep the capitalization and terminal period: `DaytonGrowthCo.`
- Keep it on one line and preserve its tight editorial letter spacing.
- Do not redraw it in a substitute typeface, stretch it, outline it, shadow it, or place it inside a badge.
- Use the standard light-surface version by default. On a very dark surface, use the existing `onDark` treatment or a high-contrast approved lockup.
- The hover-only `DGC` condensation is a small desktop interaction, not a replacement logo. Never make the abbreviated form the only way to identify the company.

### Icon mark

The icon is a dimensional white **D** with a rising blue-to-violet checkmark on a deep indigo circular field. It communicates completion, forward movement, and dependable systems.

Approved source assets:

- `favicon.png` and `public/favicon.png`, 1254 × 1254 PNG
- `siteicon.png` and `public/siteicon.png`, 1024 × 1024 PNG
- `logo_zoomedout.jpg` and `public/logo_zoomedout.jpg`, 1254 × 1254 JPG

Use the icon for favicons, app icons, social avatars, compact product contexts, and small brand moments. Keep the supplied circular silhouette and generous breathing room. Do not crop into the D, recolor the checkmark, flatten it into a generic checkbox, add text inside it, or use it as a repeated decorative pattern.

### Clear space and minimum size

- Wordmark clear space: at least the height of the capital `D` on every side.
- Icon clear space: at least 15% of the icon diameter on every side.
- Do not use the wordmark below 120 px wide in raster use or 14 px text size in UI.
- Do not use the icon below 16 px. Prefer 24 px or larger when it must be recognizable.

## 3. Color system

The canonical public-site palette is defined in `src/index.css`. Use semantic tokens instead of introducing one-off hex values.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Primary accent | `--brand-indigo` | `#18174D` | Key emphasis, hero action, active states, wordmark accent |
| Accent hover | `--brand-indigo-hover` | `#262587` | Hover and editorial emphasis |
| Supporting blue | `--brand-blue` | `#5796C8` | Gradient midpoint, diagrams, restrained secondary emphasis |
| Pale blue | `--brand-paleblue` | `#DDE9FC` | Soft washes, secondary hover fill, light UI accents |
| Charcoal | `--brand-charcoal` | `#1F211F` | Default primary buttons and dark text |
| Near-black | `--brand-near-black` | `#05070C` | Footer and deepest dark surfaces |
| Main surface | `--brand-surface` | `#FBFBF9` | Default warm-white page surface |
| Muted surface | `--brand-surface-muted` | `#F7F6F1` | Alternate sections and subdued panels |
| Border | `--brand-border` | `#EDEDEB` | Light dividers and control outlines |
| Muted text | `--brand-text-muted` | `#5F5C56` | Supporting copy on light surfaces |
| Success | `--brand-success` | `#1F7A52` | Positive status only |
| Danger | `--brand-danger` | `#B42318` | Errors and destructive actions only |

### Color application

- Let warm off-white and charcoal do most of the work. Indigo is the single key accent, not a blanket background.
- Use pale blue as atmosphere, not a body-text color or a substitute for contrast.
- The approved expressive gradient is `linear-gradient(105deg, #2A2880 0%, #4744C4 45%, #DDE9FC 115%)`. Reserve it for a single high-value moment such as a hero keyword, final CTA, or controlled brand flourish.
- Dark sections should use near-black or the dark panel colors (`#0B0B1F`, `#131233`) with pale blue, white, or muted cool-gray text.
- Build depth with very soft indigo-tinted shadows and washes, not generic gray drop shadows.
- The blue/orange values in `daytongrowthco-website-migration-audit/assets/daytongrowthco/brand.json` are specific to that audit tool’s report template. They are not the canonical public-site palette.

## 4. Typography

### Type families

| Role | Family | Use |
| --- | --- | --- |
| Display/editorial | Fraunces Variable | H1s, H2s, major page statements, select italic emphasis |
| UI/body | Hanken Grotesk Variable | Navigation, body copy, buttons, cards, labels, forms |
| Technical/data | Fira Code or system mono fallback | Dashboards, data labels, code-like workflow and metrics |

Fraunces supplies restraint and an editorial point of view. Hanken Grotesk keeps the product and explanatory content direct. Mono is a utility, never a decorative headline font.

### Type hierarchy

Use the existing roles from `src/index.css` rather than creating arbitrary scales.

| Role | Desktop intent | Mobile intent | Weight / leading |
| --- | --- | --- | --- |
| Display | `clamp(4rem, 6vw, 5rem)` | `2.625rem` | 550 / 1.0 |
| Section | `clamp(2.75rem, 4.4vw, 3.625rem)` | `1.875–2.25rem` | 530 / 1.04 |
| Compact section | `clamp(2.125rem, 3.2vw, 2.625rem)` | `1.625–1.875rem` | 530 / 1.06 |
| Card title | `1.125–1.375rem` | `1.0625–1.1875rem` | 700 / 1.15 |
| Body | `1–1.125rem` | `.9375–1rem` | 420 / 1.6 |
| Supporting UI | `.875rem` | `.875rem` | 580 / 1.45 |
| Eyebrow utility | `.72rem` | `.72rem` | 700 / 1.45, tracking `.12em` |

Although an eyebrow utility exists for product metadata, marketing pages should not add eyebrow/kicker labels or uppercase chips above section headings. Lead with the headline.

### Typographic rules

- Headings are sentence case, compact, and usually no more than two to three lines.
- Use tight display tracking, approximately `-0.035em`; do not letter-space body copy for effect.
- Use `text-wrap: balance` for large headlines and `text-wrap: pretty` for paragraphs where supported.
- Use editorial italics sparingly to emphasize one meaningful word or phrase, not entire headlines.
- Keep body copy readable with a 1.6 line height and a bounded text measure, usually 43–60 characters for primary explanatory columns.
- Avoid all-caps paragraph text, novelty fonts, light-gray body copy, and dense blocks of sales language.

## 5. Page design principles

### Show the tool, do not merely describe it

The offering is often invisible software. Make it concrete with interface-style proof: mini dashboards, workflow diagrams, quote rows, pipeline states, clear metrics, document previews, and before/after process examples. The visual should help an owner picture their own business using the outcome.

### Build a deliberate page narrative

A strong page normally follows this order:

1. **Clear value statement:** State what is built, for whom, and why it matters.
2. **Concrete proof:** Show a product-like artifact, capability map, process, example, or cost logic.
3. **Operational relevance:** Connect the system to time saved, revenue captured, fewer misses, or a clearer handoff.
4. **How it works:** Make the engagement feel finite, understandable, and low-risk.
5. **Focused CTA:** Invite one practical next step, such as starting a conversation or discussing a specific workflow.

Not every page needs every module, but every section must advance the decision. Avoid filler, capability laundry lists, repeated card grids, and decorative sections without a job.

### Layout and rhythm

- Use a restrained editorial grid with generous whitespace and visible hierarchy.
- Use the site’s container convention: `max-w-7xl` with `px-5` on small screens and `sm:px-8` where appropriate.
- Alternate warm light surfaces, pale-blue washes, and occasional dark editorial panels to establish rhythm. Do not alternate colors mechanically.
- Use a subtle dot-grid texture or low-opacity glow only to frame a story moment. It should be felt before it is noticed.
- Use thin, quiet borders and soft elevation. Standard panels use `18px` radii; large feature panels can use `28px`; buttons use `10px`. Do not turn every element into a bubble.
- Let a hero breathe. Page heroes use a large top offset for the fixed header and a short, confident lower edge, not a full screen of vague messaging.
- On mobile, preserve the narrative but simplify layout. Stack columns, remove hover-dependent behavior, and prioritize the main proof and CTA.

### Image and illustration direction

- Prefer real proof, product-like UI, diagrams, workflow artifacts, and intentional founder or customer imagery.
- Photography should feel grounded, calm, and useful, never generic agency stock.
- Interface mockups should look plausible: real labels, sensible status states, readable hierarchy, and a limited palette.
- Decorative texture is allowed only when it supports depth, atmosphere, or a section transition. Film grain is very subtle, never visibly noisy.
- Avoid random 3D blobs, generic AI sparkles, unrelated abstract art, loud gradient backgrounds, clip-art icons, and mockups that exist only to fill space.

## 6. Components and interaction patterns

### Header and navigation

- Keep the header fixed, warm, lightly translucent, and quiet. Its job is orientation, not decoration.
- Use the primary navigation labels already established: **What We Build**, **Examples**, **How It Works**, and **About**.
- Keep one clear header CTA, currently **Start a conversation**.
- The mobile menu must have obvious open/close state, Escape support, scroll locking, and page-top reset after navigation.

### Buttons and links

- Primary buttons are charcoal or, in the hero, indigo. Use one primary action per decision area.
- Secondary buttons are white with a thin border and a pale-blue fill on hover.
- Buttons use a 10px radius, a minimum height of 40px, direct verbs, and optional right-arrow motion.
- Links and buttons may lift about 1–2px on fine-pointer hover and press subtly on activation. Do not use large bounces or perpetual motion.
- Never use pill-shaped badges. Avoid pill-shaped controls unless a compact input affordance genuinely requires it.

### Cards and product proof

- Cards are content containers, not a default layout. Use them when a bounded unit needs scanning, comparison, or interaction.
- Give cards a useful internal hierarchy: small context, clear title, concise explanation, evidence or a next action.
- Prefer one stronger feature panel over many identical cards. Vary scale and composition intentionally.
- Use thin borders, warm-white or muted surfaces, and restrained indigo-tinted shadows. Hover should clarify interactivity, not make a static layout jump around.

### Forms and CTAs

- Forms should ask only for information needed to begin a useful conversation.
- Use visible labels, clear helper text, simple input borders, and concise validation messages.
- Place forms in a calm, high-contrast context. The final CTA may be dark and editorial, but the form itself should remain bright and easy to read.
- Explain what happens next in plain language. Reduce uncertainty rather than creating urgency.

### States and accessibility

- Meet WCAG 2.1 AA: 4.5:1 minimum contrast for normal text, 3:1 for large text and relevant UI boundaries.
- All interactive controls need visible `:focus-visible` styling. The current site uses a 2px `#6F90AD` outline with a 3px offset.
- Keep touch targets at least 44 × 44 px where practical, especially in mobile navigation and social controls.
- Use semantic elements first: headings in order, actual buttons for actions, actual links for navigation, labels for inputs, and useful alt text.
- Never rely on color alone to convey a status, selection, or error.
- Ensure hover information is available on touch and keyboard. Fine-pointer hover effects must not change the core content or hide functionality.

## 7. Motion

Motion should communicate polish, hierarchy, and cause-and-effect, never spectacle for its own sake.

- Use short, soft transitions: roughly 150–240ms for UI feedback and up to 340ms for a deliberate reveal.
- Preferred easing is a smooth deceleration, such as `cubic-bezier(0.16, 1, 0.3, 1)` or the existing `--ease-emil-out` token.
- Appropriate motion: a 1–2px button lift, arrow movement, a short menu sequence, a card’s subtle elevation, or a very slow atmospheric hero field.
- Avoid auto-playing ornamental motion that competes with copy, scroll-jacking, heavy parallax, bounce effects, and animation that changes layout unexpectedly.
- `prefers-reduced-motion` is mandatory. Remove or make instantaneous all nonessential transforms, loops, reveals, and staggered animation. Content must remain fully visible and usable with motion reduced.

## 8. Voice and content design

### Write like a practical expert

- Lead with a concrete outcome, process, or business problem.
- Use plain words, short sentences, specific examples, and honest ranges or numbers when useful.
- Explain the so-what: feature → operational change → business value.
- Use familiar operational language such as quote, handoff, missed follow-up, dashboard, intake, customer portal, and time saved.
- Use commas, colons, periods, or “to” for ranges. Do not use em dashes.

### Avoid

- Generic agency language: “digital solutions,” “full-service,” or vague capability claims.
- Hype: “revolutionary,” “transformative,” “game-changing,” “cutting-edge,” or manufactured urgency.
- AI jargon when a business outcome says more.
- Corporate filler, dense text walls, unexplained acronyms, and clever headlines that hide the offer.
- Uppercase section chips, arbitrary status pills, and claims the page cannot substantiate.

## 9. Design QA checklist

Before shipping a page or asset, verify the following.

### Brand

- [ ] Uses the DaytonGrowthCo. wordmark or approved icon asset correctly.
- [ ] Uses the canonical indigo, ice-blue, charcoal, and warm-surface system.
- [ ] Has one clear visual idea, not several competing styles.
- [ ] Feels premium through restraint, specificity, spacing, and craft.

### Content and conversion

- [ ] The first viewport states a concrete value proposition.
- [ ] The page shows tangible proof of the system or outcome.
- [ ] Each section advances the decision or is removed.
- [ ] CTAs are direct, consistent, and not overly repeated.
- [ ] Copy is plainspoken, specific, and free of banned hype.

### Visual and interaction quality

- [ ] Hierarchy is clear at a glance, especially on a phone.
- [ ] Headings, body text, cards, buttons, and spacing follow the shared roles and tokens.
- [ ] Hover, active, focus, loading, empty, error, and success states are considered where applicable.
- [ ] Motion is subtle and has a reduced-motion path.
- [ ] The page uses no pill badges, generic stock filler, gradient overload, or template-like repeated sections.

### Accessibility and technical quality

- [ ] Keyboard navigation works from header through CTA.
- [ ] Focus is visible, labels and semantics are correct, and contrast meets AA.
- [ ] Touch targets and mobile spacing are comfortable.
- [ ] Images have meaningful alternative text or are correctly marked decorative.
- [ ] Page performance is protected: optimize media, avoid needless animation, and do not ship decorative weight without a purpose.

## 10. Source of truth

The living implementation is the authority when this document and a component differ. Start here:

- `src/index.css` for design tokens, typography, components, motion, focus, and responsive behavior
- `src/brand-wordmark.tsx` and `src/brand-wordmark.module.css` for the wordmark
- `src/site-header.tsx` for navigation and the header CTA
- `app/page.tsx`, `app/what-we-build/page.tsx`, `app/how-it-works/page.tsx`, and `app/examples/page.tsx` for page composition patterns
- `PRODUCT.md` for product positioning, audience, and non-negotiable brand constraints

When extending the system, add or refine a shared token or component before introducing a one-off style. The goal is not to make every page look identical. It is to make every page unmistakably DaytonGrowthCo.
