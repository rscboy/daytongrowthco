# AI portal — visual design reference

> This document describes the visual system observed in the reference AI workspace. It is intended as a practical guide for bringing another portal closer to this product’s design language; it is not an attempt to copy its content, data, or product behavior.

## Source screens reviewed

This reference is based on visual inspection of the live product at a 1,324 × 768 browser-window capture size, across five distinct application states:

1. **Agents list** — the default workspace shell with the nested “All Agents” panel and a tabular list.
2. **Home / Conductor** — a deliberately quiet, centered conversational assistant view.
3. **Analytics** — metrics, chart cards, tabs, filters, and dashboard controls.
4. **Contacts** — a full-width data table with banner, filters, and row density.
5. **Agent editor** — a focused, distraction-free editor with a compact rail, three vertical work panels, and a dense utility header.

Reference captures live alongside this document in [`portal-reference-screenshots`](/Users/goblu/Documents/Code/Main%20-%20DaytonGrowthCo/portal-reference-screenshots). The visual conclusions below should take precedence over exact pixel measurements, which will naturally shift with browser zoom and viewport size.

## The overall character

The product feels **quiet, professional, and operational**. It does not use large branded hero areas, heavy color blocks, oversized icons, or decorative illustrations. Its confidence comes from strong spatial organization: wide white work surfaces, fine neutral borders, small typography, restrained iconography, and a low-contrast lavender-gray application background.

The system has two especially important qualities worth borrowing:

- **The chrome stays visually light.** Navigation, account information, workspace switching, utility controls, and dividers are all present, but none competes with the active content.
- **Complexity is contained in modules.** The same product supports chat, tables, analytics, long-form configuration, and testing. Instead of changing visual language for each one, it keeps a stable frame and changes only the content region.

There is a useful hierarchy: ink-dark text establishes certainty; muted gray explains or labels; blue-violet marks activity, links, badges, and chart data; and pale lavender/blue surfaces provide low-pressure grouping. There are no large saturated fields except the occasional dark primary action.

## Canvas, background, and enclosure

### Main application canvas

Below the browser chrome, the application occupies a cool off-white/lavender-gray field. Visually it reads close to `#F8F7FC` or `#F7F6FB`, rather than pure white. This background is only lightly tinted; the effect is more “softened desktop software” than obviously purple.

The desktop shell is inset about **8–10 px** from the viewport edge. Large page areas are then contained inside white cards or white panels with a subtle, single-pixel border around `#ECEBF2`. Corners are consistently rounded, generally around **12–16 px** for large panels, **8–10 px** for controls, and fully pill-like only for small tags/status chips.

The page shell uses the full available height. It does not place a page inside a narrow centered max-width column. In most sections, the dominant working region is allowed to extend horizontally; whitespace appears *inside* content modules rather than as huge external gutters.

### Border, shadow, and depth

Depth is intentionally minimal:

- Major cards are white with fine gray/lavender outline borders.
- Many surfaces have no discernible drop shadow at all.
- Selected navigation rows are filled, not elevated.
- Floating/sticky elements use only a faint border and a very soft shadow, if any.

That restraint makes the UI feel more like a well-tuned application canvas than a marketing site. For an implementation, avoid card shadows as a primary separation method. Use background contrast, border lines, and spacing first.

## Typography and font behavior

### Font family

The visible type is a modern neutral sans-serif with a high-x-height, compact spacing, rounded terminals, and very clean digit forms. It reads as an **Inter / Geist / SF Pro–style UI sans**. It is not a serif, grotesque display face, or monospaced system. If matching the feeling rather than the exact proprietary source, use:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

The typography is exceptionally consistent. Small navigation labels, table labels, chart labels, and utility labels all look like the same family, with hierarchy achieved primarily by weight, shade, size, and spacing—not by changing families.

### Approximate type scale

The product favors a small, dense type scale. These estimates were made from the desktop captures:

| Role | Approx. size / line height | Weight | Color / behavior |
|---|---:|---:|---|
| Main page title, e.g. “Analytics”, “Contacts” | 18–20 px / 26 px | 600–650 | Near-black charcoal |
| Centered home greeting | 20–22 px / 28 px | 600 | Near-black charcoal |
| Editor title / top-level title | 16–18 px / 24 px | 600 | Near-black charcoal |
| Card title / section heading | 14–16 px / 20–22 px | 550–600 | Charcoal |
| Regular nav, table values, control labels | 13–14 px / 18–20 px | 400–500 | Dark slate-gray |
| Secondary description, dates, placeholder, helper | 12–13 px / 16–18 px | 400–450 | Cool medium gray |
| Sidebar group heading | 10–11 px / 14 px | 500–600 | Muted gray, uppercase |
| Table column heading / small meta label | 11–12 px / 16 px | 450–550 | Gray, not black |
| Tags, counters, statuses | 11–12 px / 16 px | 500–600 | Contextual muted or violet/blue |

Large type is rare. The home greeting is the only explicitly large scale seen, and even it stays restrained. A portal inspired by this should resist typical dashboard habits like 32 px titles or 48 px metric figures everywhere. Let layout and data create the sense of scale.

### Text color hierarchy

Use four clearly separated neutral ink levels:

1. **Primary ink:** nearly black navy-charcoal, approximately `#202634` to `#2A2E3A`. Used for titles, active navigation, major values, and body copy in focused areas.
2. **Standard ink:** slate/charcoal around `#555B68`. Used for normal navigation labels and interactive control text.
3. **Muted ink:** cool gray around `#8B909C` to `#9AA0AC`. Used for placeholders, column labels, timestamps, helper text, and deselected tabs.
4. **Faint ink/border:** cool gray-lavender around `#DCDDE6` to `#EEEEF4`. Used for separators, inactive details, chart grid lines, and strokes.

The contrast is calm but still legible. Avoid using low-opacity black as the default—it tends to look muddy. Use deliberately chosen blue-gray neutrals.

## Logo and workspace treatment

### Logo location and construction

The logo lives alone at the **very top-left of the primary sidebar**, approximately 18–20 px from the left edge and 18–22 px from the top edge of the application. It consists of a compact dotted/radial mark followed by a simple wordmark. The wordmark is dark text, around **16 px**, and set on the same baseline as the mark.

There is no tagline, marketing descriptor, workspace name, or extra text below the logo. That absence is important: the very top of the sidebar looks like a small brand signature, not a header module. The logo area is only about **42–48 px** tall before the workspace switcher begins.

For a similar portal, keep the mark-and-wordmark compact and horizontally aligned. Do not stack a slogan under it. Do not give it a banner background. Do not enlarge it into a hero. The simple top-left signature is part of the product’s calmness.

### Workspace selector

Immediately below the logo is a rounded workspace switcher, about **200 px wide × 50 px high** in the left rail. It has:

- a 32–36 px rounded-square avatar at the left (a blue/violet gradient or branded letter tile),
- a tiny muted “Workspace” eyebrow label,
- a stronger workspace name below it, truncated with ellipsis if needed,
- and small up/down chevrons at the far right.

It is white against the lavender sidebar background, outlined in a hairline gray border. The control reads as an identity/tenant selector without inviting unnecessary attention. The value is two-line; this is a key distinction from a simple dropdown label.

## Primary sidebar: exact organization and placement

### Dimensions and behavior

The full navigation sidebar is roughly **220–228 px wide** at the inspected viewport. It is fixed to the left edge and extends from under the browser toolbar to the bottom of the application. Its right edge is a subtle divider rather than a heavy shadow.

The navigation is vertically scrollable. At the observed height, items through “Analytics” are visible while later monitor/system items are below the fold. The scrollbar is visually subdued and close to the sidebar’s right edge.

Horizontal padding is about **14–18 px**. Individual nav rows are approximately **32–36 px** tall, while section labels have generous vertical gaps around them. The result is compact without being crowded.

### Sequence from top to bottom

The sidebar follows this exact conceptual order:

1. Compact product logo.
2. Workspace selector card.
3. A single **Home** row.
4. Uppercase group heading: **BUILD**.
5. Build links: **Agents**, **Knowledge Base**.
6. Uppercase group heading: **DEPLOY**.
7. Deploy links: **Phone Numbers**, **Batch Call**.
8. Uppercase group heading: **DATA**.
9. Data links: **Call History**, **Chat History**, **Contacts**.
10. Uppercase group heading: **MONITOR**.
11. Monitor links: **Analytics**, **Live Monitoring**, **AI Quality Assurance**, **Alerting**.
12. Uppercase group heading: **SYSTEM**.
13. System links: **Integrations**, **Billing**, **Settings**.
14. Bottom-docked utility stack: plan/billing, usage/concurrency, account, then Help and Updates.

The group labels are not tabs or cards. They are small, uppercase, muted text with approximately 14–20 px of breathing room above and 8–10 px below. They provide scanning landmarks while remaining visually subordinate to the clickable rows.

### Navigation row styling

Each navigation row pairs a **14–16 px thin-stroke line icon** with a text label. Icon and text are left-aligned; label begins approximately 10–12 px after the icon. Rows do not show chevrons by default. Icon stroke and label text share the same muted gray when inactive.

The active row uses a very pale lavender-blue fill—roughly `#EDECF7` / `#EFEEF8`—with a **6–8 px** radius. The active icon changes to a stronger indigo/blue and the label becomes dark charcoal with medium/semibold weight. The row does not use a colored left bar, underline, or strong filled button.

This is a good pattern to replicate: selection should be visible at a glance, but it should not make the sidebar feel busy. One pale rounded rectangle is enough.

### Bottom utilities, account access, and help

The lower sidebar has a clearly separated fixed utility zone that begins around 95–125 px from the bottom, depending on content and scroll. This area is not simply another item in the scrolling nav.

1. **Plan button.** A white, outlined rounded rectangle about 200 px × 34 px. It contains a small card/billing icon, the plan label (“Pay As You Go”), and a far-right chevron. It sits above the account control.
2. **Usage snippet.** In some screens, a tiny line between plan and account reports remaining balance and concurrency. It is small muted text with a subtle expandable affordance.
3. **Account control.** Another white, outlined rounded rectangle, approximately the same width and height. It includes a small circular user avatar, truncated email/name, and chevrons at the far right. This is where personal account access lives; it is placed **near the bottom left**, not top-right.
4. **Help and Updates.** A final small horizontal row along the bottom. “Help” sits at the left with a compact outline icon; “Updates” sits to its right with a megaphone/speaker-like icon and an unread red dot visible near the far right. A very fine vertical divider separates the two segments.

The low placement makes help and account access persistent but peripheral. Replicate the priority: top = product/workspace; middle = work navigation; bottom = subscription, account, support, updates.

## Agents list: nested navigation plus data table

The Agents page demonstrates how the product manages a screen that needs a second navigational layer.

### Second rail

To the immediate right of the global sidebar is a **~260 px white subpanel** with a rounded outer edge. It begins at the top of the main application content, almost flush with the viewport’s 8 px outer inset.

At its top is a pale lavender selected row with a small agents icon and the label “All Agents.” Near the boundary between this rail and the main area is a small circular collapse control with a left chevron. Below, the panel has:

- an uppercase muted “FOLDERS” label,
- a tiny plus icon aligned to the right to add a folder,
- a folder row with a line folder icon and “Template Agents,”
- large remaining whitespace.

This subrail uses the same language as the primary nav but is more card-like: white surface, defined rounded container, and a very simple internal hierarchy.

### Main list panel

The main content begins with “All Agents” at the upper-left, around 18 px, and actions at the upper-right. The top control row includes:

- a long search input with a search icon and muted “Search…” placeholder,
- a small neutral outlined “Import” button,
- a dark charcoal primary “Create an Agent” button with a dropdown chevron.

The content table begins only about **12–16 px** below this row. Its header is a pale gray/lavender strip, about **46 px high**, and contains labels such as Agent Name, Agent Type, Voice, Phone, and Edited by. Header labels are 12–13 px and muted gray.

Rows are compact (approximately 52–56 px each), separated by very fine horizontal rules. The first column pairs a square/rounded-square application icon with the boldish agent name. “Single Prompt” is rendered as a tiny neutral lavender pill. Phone data appears as an outlined rounded chip. Avatar and name form the voice value. The final row action is just a vertical ellipsis—never a large labeled button.

The table has no dominant enclosing card perimeter inside the already-white panel. It feels like a native continuation of the workspace surface. Use that choice for dense admin data: once the page panel is already well framed, avoid nesting another heavy card around the table.

## Home / Conductor: using whitespace as a feature

The Home screen uses a three-zone arrangement:

1. Global sidebar at left (~220 px).
2. A **~210 px** Conductor History panel.
3. A very large white conversation canvas occupying all remaining width.

The History panel is an independent white rounded panel. It has a top title line with a small headset-like icon and “Conductor History,” a full-width 32–36 px search field, a simple “+ New chat” text action, then compact conversation rows. Each row is a truncated single-line title with a small muted time stamp beneath. No conversation row has a big card treatment or picture.

The large conversation area is intentionally almost empty. A small purple sparkle icon and “Conductor” label sit at its top-left. The welcome title is positioned visually close to the center of the open field—slightly below the true vertical center—rather than pinned at the top. Beneath it sits a large prompt composer about **490–540 px wide** and **80–88 px high**.

The composer is a white rounded rectangle with a thin **violet focus border**, radius around 12 px. Its placeholder sits in the upper-left, while the attachment/plus controls sit on the bottom-left and send arrow on the bottom-right. A small greenish model/credit indicator appears among the lower-left controls. This is a good model for an AI feature: centered intention, generous space, minimal decoration, and one obvious input.

## Analytics: dashboard density without visual heaviness

### Header and controls

The Analytics page uses a wide white panel with about **14–20 px** internal padding. “Analytics” appears top-left around 18 px / 600 weight. Directly below is a tab row: “Call Dashboard” is active with dark text and a thin dark underline; “Chat Dashboard” is gray/inactive. A square plus button sits next to tabs to create a new dashboard.

The next row is a horizontal toolbar. On the left: a date-range button with calendar icon, Filter, and Breakdown. On the right: “+ Add Chart” and a small rounded-square ellipsis button. Controls are compact outline buttons, about **30–32 px tall**, all visually in the same family. They use white backgrounds, pale borders, small 13 px labels, and 14–16 px icons.

### Metric cards and charts

The first row contains three equal metric cards, with roughly **10–12 px gaps**, spanning the content width. At the reference viewport they are each around **345 px wide × 200 px high**. Each card has:

- white surface, 12–14 px radius, very subtle border;
- 14–15 px title near top-left;
- a very pale internal data area (not always necessary, but visible here);
- a centered value in 30–34 px dark type.

The chart row combines a wider card (about two-thirds of the available width) with a narrower card (about one-third). Charts use fine dotted gray grid lines, light blue-violet strokes, and an extremely soft translucent blue area fill. Legends are tiny, anchored toward the lower left, using a 9–10 px colored square plus muted label.

This is notable: the charts are informative but not visually loud. Do not use thick axes, bold graph backgrounds, strongly saturated fills, or huge numerical labels. The chart data itself should be the strongest color in the card, and even that remains gentle.

## Contacts: data-heavy but spacious

The Contacts view is the clearest reference for a high-volume table.

### Announcement strip

At the very top, inside the page panel, is a full-width, short, pale periwinkle-blue announcement bar. It is about **40 px high** with 10–12 px rounded corners. At the left is a small bright-blue “New” badge, then regular dark text; a simple “Connect” action sits flush to the far right. This banner is intentionally one line tall and not a large alert module.

### Title and table tools

Below the banner, a “Contacts” title sits at left. On the right, there is a compact Feedback button with a speech/comment icon. The next control row spreads intentionally: Filter is left; Search is centered/right; a tiny table-settings icon button follows; a dark “Actions” dropdown sits at the far right.

This pattern uses **spatial distribution rather than control grouping boxes**. Items sit in a clean line with large white gaps between functional clusters. It feels organized without additional dividers.

### Table details

The table header is a very light gray/lavender band about **30–34 px** high. The header is smaller and lower-contrast than table data. The rows are approximately **46–48 px high**, each with a hairline separator. There are no zebra stripes. Long IDs are muted gray instead of primary black, ensuring the phone number and more useful values are read first.

Column widths are purposeful and fixed-looking: phone number (moderate), first/last name (short), contact ID (wide), related conversations (moderate), latest conversation (wide), do-not-call (moderate), external ID (moderate). This provides a precise, operational rhythm rather than auto-sizing every column to content.

## Agent editor: focused three-panel workbench

The agent editor deliberately drops the global sidebar and replaces it with an extremely slim vertical rail. This signals a change from browsing the product to working inside a focused object.

### Top header

The editor top bar is about **40–44 px high** and spans the full content width. From left to right it has:

- a compact “go back” icon button;
- three small tabs (Agent, Workflow, Simulation) near the left, with Agent selected;
- the agent title, followed by a compact Environment tag;
- an ellipsis/overflow button;
- a share icon button;
- compact version pill/button (for example “V37”);
- Test button with play icon;
- white outlined “Create new version” button;
- a rightmost Conductor button, distinguished by a small violet sparkle.

The header prioritizes context and actions, but each control is kept short. It does not use a huge page title with a big action row below. Instead, the object title and its actions share a single narrow, dense toolbar.

### Slim vertical rail

Along the left edge, a rail of roughly **50–56 px** contains centered stacked icon+label destinations: Agent, Workflow, Simulation. The active item has a pale blue/lavender background/indicator and strong indigo icon. The label is tiny, about 10 px, placed below its icon. This rail is distinct from the primary sidebar because the context is local to the editor.

### Three work columns

Below the header, the editor uses three vertical panels with 6–10 px gutters:

- **Left configuration/content panel:** approximately 48–50% of the width.
- **Middle settings accordion panel:** approximately 25–26%.
- **Right testing panel:** approximately 25–26%.

Each panel is white, lightly bordered, rounded at 12–14 px, and fills most of the viewport height. They feel like coordinated panes rather than three separate cards.

The left panel starts with a tight metadata strip (“Agent Details,” cost, latency, tokens, ID). Then compact selector buttons for model, voice, and language, followed by the large textarea/configuration document. The textarea is visually the dominant working object: light border, rounded corners, substantial internal padding, normal small body text, and a real document-like scrollable block. Below it are smaller configuration blocks and headings.

The middle panel is an accordion stack. Each item is around 45–48 px tall, with a left line icon, left-aligned boldish title, and far-right downward chevron. The rows are separated by thin dividers; no cards are nested inside. Accordion naming is clear, compact, and mechanically scannable.

The right panel begins with a compact tab strip (Test Audio selected, Test LLM inactive) and a code-like icon. Its empty state centers a very large pale microphone icon vertically, with a soft lavender informational strip lower in the panel and a centered outline “Run Test” button beneath. The action is intentionally modest until the user is ready to test.

## Color tokens to emulate

The following are visual approximations, not extracted source tokens. Use them as a starting palette and tune from your own screenshots.

```css
:root {
  --app-bg: #f8f7fc;
  --panel: #ffffff;
  --panel-subtle: #fbfaff;
  --border: #e8e7ef;
  --border-strong: #dedde8;

  --ink: #242936;
  --ink-secondary: #5f6573;
  --ink-muted: #9298a5;
  --ink-faint: #b7bac5;

  --selection: #efeff9;
  --selection-strong: #e9eaff;
  --accent: #6378d8;
  --accent-deep: #4f63c6;
  --accent-soft: #eef1ff;
  --banner: #edf3ff;

  --primary-button: #303a50;
  --primary-button-hover: #252e42;
  --success-soft: #eaf7e9;
  --danger-dot: #eb7786;
}
```

The accent color is more blue-violet/periwinkle than royal blue, and the main action color is a deep slate rather than a pure black. Keep the blue accent selective: active icons, focused composer border, badges, chart marks, and a few small highlight states. Never make it the dominant screen background.

## Component recipe for a similar portal

### Suggested spatial constants

```css
:root {
  --sidebar-width: 224px;
  --sidebar-padding-x: 14px;
  --outer-gutter: 8px;
  --content-padding: 14px;
  --row-height: 34px;
  --control-height: 32px;
  --radius-panel: 14px;
  --radius-control: 9px;
  --radius-chip: 999px;
  --hairline: 1px;
}
```

At normal desktop widths, keep shell gutters small. The product earns its spaciousness from the broad white work area, not giant margins. Place the left sidebar at a stable width, let the content grow, and use responsive breakpoints to collapse or hide secondary panels before squeezing all text.

### Buttons

- **Primary:** dark slate fill, white 13 px medium-weight text, 32–34 px high, 8–9 px radius, optional downward chevron aligned 8–10 px after label.
- **Secondary:** white fill, pale border, dark slate text, same height/radius as primary.
- **Icon-only:** small rounded-square white/transparent control with a 14–16 px line icon. Use tiny border or no border depending on surrounding density.
- **Text action:** compact icon + label, no button fill, dark or muted text, e.g. Feedback, New chat.

### Inputs

Search fields are shallow and broad (around 32 px high). They use a leading 14 px search icon, muted placeholder, white fill, a very soft border, 8–9 px radius, and generous horizontal inner padding. Do not use a thick active outline except during actual focus.

Long-form text inputs receive more pronounced rounding and internal padding, but they still use a thin gray border. The violet/blue focus edge on the Conductor composer is an intentional moment of emphasis; do not apply it to every control in the default state.

### Cards and panels

Use a single visual hierarchy:

- Application background: tinted off-white.
- Primary working surface: white rounded panel.
- Nested, low-emphasis region: barely tinted background or divider line—not a darker card.
- Data card: white with hairline boundary and 12–14 px radius.

Avoid: colored header bands on every card, overly large card padding, strong shadows, and multiple unrelated radius values.

## What to preserve when translating the brand

If the goal is to upgrade an existing portal while adopting this brand character, the most important decisions are structural rather than cosmetic:

1. **Give the sidebar a clear three-level priority:** brand/workspace at top, task navigation in the middle, account/help at bottom.
2. **Keep the logo compact and alone.** Mark + wordmark at top-left; no subtitle beneath it.
3. **Use one active-nav treatment:** a pale lavender rounded row plus a slightly more saturated blue-violet icon.
4. **Make labels small and consistent.** Sidebar section labels should be uppercase, tiny, letter-spaced/muted, and never compete with navigation names.
5. **Rely on near-white surfaces and hairline borders.** The product’s polish is primarily quiet contrast and alignment.
6. **Reserve dark fills for primary decisions.** “Create,” “Actions,” and similar decisive actions are dark; almost everything else is neutral outlined or text-only.
7. **Use large whitespace deliberately in assistant/workflow spaces.** The Conductor home screen proves a product can feel premium by withholding visual noise.
8. **Switch the shell when the task changes.** A local object editor can use a slim rail and work panes instead of carrying the entire global navigation into every focused task.

## Implementation cautions

- Do not infer exact font licensing or source CSS from visual inspection. Treat the typeface recommendation as an aesthetic match.
- Do not copy the reference product’s logo, wordmark, proprietary icons, or exact branded assets. Build an equivalent composition with your own brand assets.
- Do not overfit to the captured 1,324 px viewport. The values here are intentionally presented as ranges and proportions where possible.
- Preserve accessibility: muted text needs sufficient contrast, every icon button needs a programmatic label, selection should not rely only on color, and tables should remain usable with keyboard navigation.

## Screenshot index

- [`01-agents.png`](/Users/goblu/Documents/Code/Main%20-%20DaytonGrowthCo/portal-reference-screenshots/01-agents.png) — global sidebar, nested agent rail, table.
- [`02-home.png`](/Users/goblu/Documents/Code/Main%20-%20DaytonGrowthCo/portal-reference-screenshots/02-home.png) — Conductor history and centered chat composition.
- [`03-analytics.png`](/Users/goblu/Documents/Code/Main%20-%20DaytonGrowthCo/portal-reference-screenshots/03-analytics.png) — tabs, controls, metrics, cards, charts.
- [`04-contacts.png`](/Users/goblu/Documents/Code/Main%20-%20DaytonGrowthCo/portal-reference-screenshots/04-contacts.png) — announcement strip and high-density table.
- [`05-agent-editor.png`](/Users/goblu/Documents/Code/Main%20-%20DaytonGrowthCo/portal-reference-screenshots/05-agent-editor.png) — focused editor toolbar, local rail, three-panel workbench.
