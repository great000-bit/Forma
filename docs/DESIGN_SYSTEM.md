# FORMA: UI/UX + BRAND DESIGN SYSTEM

The single source of truth for how Forma looks, feels and behaves. Brand files live in `/brand` (logo SVGs, PNGs, tokens.css). Follow this exactly. Everything must look premium and clean, like it was designed by a senior product designer.

---

## 1. BRAND SUMMARY

- **Name:** Forma
- **Idea:** things take shape. An AI talks to you and builds your portfolio live.
- **Tagline:** Talk. Watch it build.
- **Personality:** calm, confident, precise, human. Quiet luxury, not loud tech.
- **Logo:** lowercase f made of three rounded blocks (top arm in Signal purple, stem and crossbar in Ink). Wordmark "forma" in Inter Display Medium, lowercase, tight tracking.
- **Logo files (in /brand/logo):** forma-logo.svg, forma-logo-white.svg, forma-logo-black.svg, forma-mark.svg, forma-mark-white.svg, forma-mark-black.svg, forma-app-icon.svg, forma-app-icon-light.svg, favicon.svg, forma-avatar.svg
- **Logo rules:** clear space equals the height of the top arm on all sides. Minimum size: mark 20px, lockup 88px wide. Never stretch, rotate, recolor, add shadows or gradients. On photos use the white or black one-color version.
- **Voice:** short, human, no hype, no buzzwords, no AI-sounding phrases. Yes: "Talk. We build. You share." No: "Unlock the power of AI-driven portfolio solutions."

---

## 2. COLOR SYSTEM

### 2.1 Core palette
| Token | Hex | Use |
|---|---|---|
| Ink | #0E0E10 | Text, dark background |
| Paper | #F7F6F3 | Light background |
| Signal | #5B4DFF | The one accent |
| Mist | #E7E5E0 | Borders, dividers |
| Slate | #6B6B76 | Secondary text |
| Success | #1F9D6B | Success |
| Warning | #C98A1B | Warning |
| Error | #D64545 | Error |

### 2.2 Signal scale (for hover, pressed, tints)
- signal-50: #F0EEFF
- signal-100: #E3E0FF
- signal-200: #C9C3FF
- signal-300: #A79EFF
- signal-400: #8478FF
- signal-500: #5B4DFF (base)
- signal-600: #4A3BE6 (hover)
- signal-700: #3B2DC4 (pressed)
- signal-800: #2D2299
- signal-900: #1F1770

### 2.3 Neutral scale (warm)
- neutral-0: #FFFFFF
- neutral-50: #F7F6F3
- neutral-100: #EFEDE8
- neutral-200: #E7E5E0
- neutral-300: #D3D0C9
- neutral-400: #A9A7A0
- neutral-500: #6B6B76
- neutral-600: #4A4A52
- neutral-700: #2F2F35
- neutral-800: #17171A
- neutral-900: #0E0E10

### 2.4 Semantic tokens (use these in components, never raw hex)
| Token | Light | Dark |
|---|---|---|
| --bg | #F7F6F3 | #0E0E10 |
| --surface | #FFFFFF | #17171A |
| --surface-raised | #FFFFFF | #1F1F23 |
| --text | #0E0E10 | #F7F6F3 |
| --text-soft | #4A4A52 | #C4C4CC |
| --text-muted | #6B6B76 | #8E8E99 |
| --border | #E7E5E0 | #26262B |
| --border-strong | #D3D0C9 | #3A3A41 |
| --accent | #5B4DFF | #7A6EFF |
| --accent-hover | #4A3BE6 | #8E84FF |
| --accent-soft | #F0EEFF | #1E1A4D |
| --accent-text | #FFFFFF | #FFFFFF |
| --success | #1F9D6B | #34C48A |
| --warning | #C98A1B | #E0A73A |
| --error | #D64545 | #EF6A6A |

### 2.5 Rules
- Signal covers no more than 10% of any screen. It marks the primary action, links, active states and the AI.
- Never pure black on pure white. Body text is --text-soft.
- WCAG AA contrast minimum on all text. Large text AA at 3:1.
- No random gradients. Allowed: a very subtle Signal glow behind the hero and the AI build panel (radial, under 12% opacity).
- Full light and dark mode through CSS variables. Respect system preference and offer a manual toggle.

---

## 3. TYPOGRAPHY

### 3.1 Families
- **Inter** (UI and body): weights 400, 500, 600
- **Inter Display** (headings, 24px and above): weights 500, 600
- **Instrument Serif Italic** (accent only): one highlighted word in a large headline, max once per page
- **JetBrains Mono** (only for code or the build log): weight 400

Load with `next/font` (self-hosted, `display: swap`). Do not use more than three weights per page.

### 3.2 Type scale
| Style | Size / Line height | Weight | Tracking | Use |
|---|---|---|---|---|
| display-xl | 72 / 72 | 600 | -3% | Landing hero (desktop) |
| display | 56 / 58 | 600 | -2.5% | Section heroes |
| h1 | 44 / 48 | 600 | -2% | Page titles |
| h2 | 32 / 38 | 600 | -1.5% | Section titles |
| h3 | 24 / 30 | 600 | -1% | Card titles |
| h4 | 20 / 28 | 500 | -0.5% | Subsections |
| body-lg | 18 / 30 | 400 | 0 | Intro text |
| body | 16 / 26 | 400 | 0 | Default |
| body-sm | 14 / 22 | 400 | 0 | Secondary |
| label | 14 / 20 | 500 | 0 | Form labels, buttons |
| caption | 12 / 16 | 500 | +2% | Meta, badges |

Mobile scaling: display-xl 44/46, display 38/42, h1 34/38, h2 28/34, h3 22/28.

### 3.3 Rules
- Headings use Inter Display, tight tracking, balanced wrapping (`text-wrap: balance`). Body uses `text-wrap: pretty`.
- Reading text max width 720px (about 65 characters).
- Left align text by default. Center only hero, section intros and CTAs.
- Lowercase "forma" only in the logo. In copy, write "Forma".
- Numbers in dashboards use tabular figures (`font-variant-numeric: tabular-nums`).

---

## 4. SPACING, GRID AND LAYOUT

- 8px base grid. Allowed values: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Page max width 1200px. Reading width 720px. Dashboard sidebar 260px.
- Page side padding: 24px mobile, 32px tablet, 48px desktop.
- 12-column grid, 24px gutters desktop, 16px mobile.
- Section vertical padding: 128px large desktop, 96px desktop, 64px tablet, 48px mobile.
- Card padding: 24px (compact) or 32px (default). Gap between cards: 24px.
- Stack rhythm: label to input 8px, input to input 20px, heading to paragraph 16px, paragraph to button 32px.
- Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Mobile first. Test at 375, 768, 1024, 1440.
- No horizontal scroll, ever. No element touches a screen edge.

---

## 5. SHAPE, ELEVATION, BORDERS

- Radius: card 20px, control (button, input, select) 12px, small chips 8px, pill 999px, dialog 24px.
- One radius system everywhere. Never mix sharp and round.
- Borders: 1px solid --border. Strong border for hover and focus context.
- Shadows (soft, low opacity, large blur):
  - shadow-sm: `0 1px 2px rgba(14,14,16,.04)`
  - shadow-card: `0 1px 2px rgba(14,14,16,.04), 0 12px 32px -12px rgba(14,14,16,.10)`
  - shadow-pop: `0 2px 4px rgba(14,14,16,.04), 0 24px 56px -16px rgba(14,14,16,.18)`
  - Dark mode: replace shadows with a 1px border plus a faint inner highlight `inset 0 1px 0 rgba(255,255,255,.04)`.
- Surfaces layer: bg, then surface (cards), then surface-raised (menus, dialogs). Contrast between layers stays subtle.
- Focus ring: 2px Signal at 40% opacity with 2px offset, on every interactive element.

---

## 6. COMPONENT SPECS

Build on shadcn/ui, customized once, reused everywhere. No one-off styling in pages.

**Button**
- Heights: sm 36, md 44 (default), lg 52. Radius 12. Padding 0 20px (md). Label weight 500.
- Primary: Signal background, white text. Hover signal-600, pressed signal-700, translateY(-1px) on hover.
- Secondary: surface background, 1px border, text color. Hover border-strong.
- Ghost: transparent, hover accent-soft.
- Destructive: error background, white text.
- Disabled: 50% opacity, no pointer. Loading: spinner replaces icon, width stays fixed.
- Icon left or right 16px, gap 8px.

**Input, Textarea, Select**
- Height 48 (textarea min 120), radius 12, 1px border, surface background, padding 0 16px.
- Placeholder in text-muted. Hover border-strong. Focus: Signal border plus focus ring.
- Error: error border plus helper text 14px in error color, with icon. Label above, 14/500, 8px gap.

**Card**
- Surface background, radius 20, 1px border, shadow-card, padding 32. Hover (if clickable): lift 2px, shadow-pop, border-strong. Transition 200ms ease-out.

**Badge:** radius pill, 12px caption, padding 4px 10px. Variants: neutral, accent (accent-soft background), success, warning.

**Navbar (marketing):** height 72, sticky, blur backdrop (`backdrop-filter: blur(12px)`) with bg at 80% opacity, bottom border appears on scroll. Logo left, links center or right, Sign in (ghost) and primary CTA right. Mobile: sheet menu.

**Dashboard shell:** left sidebar 260px (logo, nav items with icons, plan card at the bottom), top bar 64px (page title, theme toggle, avatar menu). Content max width 1100px, padding 32.

**Dialog:** radius 24, padding 32, max width 480, overlay Ink at 40% with blur. Sheet slides from right on desktop, bottom on mobile.

**Toast:** bottom right, radius 16, surface-raised, icon plus 14px text, auto dismiss 4s.

**Tabs:** underline style, 2px Signal indicator that slides.

**Skeleton:** neutral-100 base with a slow shimmer (1.6s). Used for every loading state.

**Avatar:** circle, initials fallback on accent-soft.

**Empty states:** centered, 48px icon in a 72px accent-soft circle, h3 title, body-sm description, one primary button. Every list and screen has one.

**Icons:** Lucide only. Outline, 1.5px stroke, rounded caps and joins, 20px in UI (16 in buttons, 24 in feature cards). Color: text-muted by default, Signal when active. No filled icons, no emojis anywhere in the product UI.
Core: mic (talk), sparkles (AI), layout-template (templates), pen-line (edit), eye (preview), link (share), globe (domain), bar-chart-3 (analytics), upload, palette, check, x, chevron-right, arrow-up-right, settings.
Niches: pen-tool (UI/UX), database (data), shield (security), clapperboard (video), camera (photography), box (3D), code-2 (dev), file-text (writing), smartphone (mobile), gamepad-2 (games), brain (AI/ML), cloud (cloud/DevOps).

---

## 7. MOTION

- Easing: `cubic-bezier(.22, 1, .36, 1)` (ease-out) for everything. Never bounce or overshoot.
- Durations: hover and press 150ms, small transitions 200ms, panels 300ms, entrances 500 to 600ms.
- Entrance: fade plus 12px upward translate, staggered by 60ms per item, triggered once on scroll into view.
- Hover on cards: translateY(-2px) plus shadow change. Buttons: translateY(-1px).
- Page transitions: 200ms fade.
- Use Framer Motion. Animate `transform` and `opacity` only. Never animate layout properties in a way that causes jank. 60fps.
- Always respect `prefers-reduced-motion`: replace movement with a simple fade.

### Logo animation (splash, loader, build screen)
Blocks assemble in order: stem, crossbar, then the Signal arm drops in last. 600ms total, 8px upward travel with fade.

---

## 8. SIGNATURE UX: THE LIVE BUILD

This is the heart of the product. It must feel like watching an AI write sleek code, but for a portfolio.

**Layout (desktop):** split screen. Left 380px panel, right the live preview in a browser-style frame (rounded 20px, subtle top bar with three muted dots and the URL "name.forma.app").

**Left panel (AI):**
- Top: Forma mark and "Building your portfolio".
- Checklist of steps: Profile, About, Skills, Projects, Experience, Contact. Each shows pending (hollow circle), active (Signal spinner), done (check). Smooth state change.
- Below: a calm status line that updates ("Writing your about section"). A thin Signal progress bar sits at the top of the panel.
- Bottom: voice and text input to talk to the AI during or after the build.

**Right panel (preview):**
- Starts as a skeleton layout (neutral blocks matching the template).
- As streamed JSON arrives, each section resolves from skeleton into real content: fade, 12px rise, text types in at a natural pace (headings first, then body). A soft Signal outline pulses around the section currently being written, then fades.
- Order: skeleton, hero, about, skills, projects, experience, contact.
- Total build feels like 20 to 40 seconds. Never freeze. Always show progress.

**Completion:** progress bar fills, a quiet "Your portfolio is ready" message appears with Edit and Publish buttons. No confetti.

**Mobile:** preview full screen, AI status as a bottom sheet strip.

**Interview UX:**
- One question at a time, large (h2), centered, with a mic button (primary, 64px) and a "type instead" link.
- While listening: a soft waveform (Signal, thin bars) and live transcript in body-lg.
- Show a thin step indicator ("3 of 10"). Allow back, skip and edit any answer.
- Always provide a text fallback if the mic is unsupported or denied.

---

## 9. SCREEN-BY-SCREEN UX

**Landing page**
1. Navbar
2. Hero: display-xl headline ("Talk. Watch it build." with one Instrument Serif Italic word), body-lg subtext, primary CTA (Join the waitlist), secondary CTA (See it build), and a product preview showing the live build animation inside a browser frame with a faint Signal glow.
3. Problem: three short cards (no portfolio, can't code, can't afford a developer).
4. How it works: 3 steps with icons (Talk, Watch it build, Share one link). Numbers in caption style.
5. Live demo: the build animation looping on a sample portfolio.
6. Niches: grid of rounded chips with Lucide icons (hover lift).
7. Templates: horizontal showcase of premium template cards (hover reveals "Preview").
8. Pricing teaser: Free and Pro cards, Pro highlighted with a Signal border.
9. FAQ: accordion, 6 to 8 questions.
10. Final CTA: large centered headline with waitlist form.
11. Footer: logo, links, socials, copyright.

**Auth:** centered card (max width 420) on bg, logo above, Google button, divider "or", email form. Minimal. No marketing clutter.

**Dashboard:** greeting, portfolio card (thumbnail, status badge Published or Draft, link with copy button, Edit, Analytics), "Create portfolio" empty state if none.

**Template gallery:** niche tabs on top, grid of template cards (3 columns desktop, 1 mobile) with preview on hover, full preview in a dialog, "Use this template" primary button.

**Editor:** left sidebar with sections list (drag to reorder, eye to hide), center live preview, right panel with fields for the selected section. Top bar: device toggle (desktop, mobile), Undo, Redo, AI command input ("Tell Forma what to change"), Publish. Autosave with a quiet "Saved" indicator.

**Publish dialog:** shows the link (name.forma.app) with copy, a QR code, share buttons, and "Connect custom domain" (Pro).

**Analytics:** four stat cards (views, unique visitors, link clicks, contact clicks), one clean line chart (Signal line, soft area fill, no gridline clutter), top referrers list.

**Pricing / Billing:** two plans, current plan highlighted, upgrade button.

**Admin:** table-based, dense but with the same tokens.

---

## 10. FORMS, STATES AND FEEDBACK

- Every async action has a loading, success and error state.
- Inline validation on blur with Zod. Never block typing.
- Helpful, human error messages ("That email doesn't look right", not "Invalid input").
- Destructive actions need a confirm dialog.
- Optimistic UI where safe. Undo toasts for deletes.
- Skeletons, not spinners, for page loads. Spinners only inside buttons.

---

## 11. ACCESSIBILITY AND PERFORMANCE

- Semantic HTML, one h1 per page, landmarks, skip link.
- Full keyboard navigation, visible focus on everything, logical tab order.
- Touch targets at least 44px. Alt text on all images. ARIA labels on icon-only buttons.
- Voice features always have a text alternative.
- Lighthouse 90+ for performance, accessibility, best practices and SEO on the landing page and on published portfolios.
- Optimize images (`next/image`, AVIF/WebP), lazy load below the fold, no layout shift.

---

## 12. IMPLEMENTATION: CODE TO USE

### 12.1 `app/globals.css`
```css
@import "tailwindcss";

:root {
  --bg: #F7F6F3; --surface: #FFFFFF; --surface-raised: #FFFFFF;
  --text: #0E0E10; --text-soft: #4A4A52; --text-muted: #6B6B76;
  --border: #E7E5E0; --border-strong: #D3D0C9;
  --accent: #5B4DFF; --accent-hover: #4A3BE6; --accent-soft: #F0EEFF; --accent-text: #FFFFFF;
  --success: #1F9D6B; --warning: #C98A1B; --error: #D64545;
  --radius-card: 20px; --radius-control: 12px; --radius-dialog: 24px;
  --shadow-sm: 0 1px 2px rgba(14,14,16,.04);
  --shadow-card: 0 1px 2px rgba(14,14,16,.04), 0 12px 32px -12px rgba(14,14,16,.10);
  --shadow-pop: 0 2px 4px rgba(14,14,16,.04), 0 24px 56px -16px rgba(14,14,16,.18);
  --ease-out: cubic-bezier(.22, 1, .36, 1);
}
.dark {
  --bg: #0E0E10; --surface: #17171A; --surface-raised: #1F1F23;
  --text: #F7F6F3; --text-soft: #C4C4CC; --text-muted: #8E8E99;
  --border: #26262B; --border-strong: #3A3A41;
  --accent: #7A6EFF; --accent-hover: #8E84FF; --accent-soft: #1E1A4D;
  --success: #34C48A; --warning: #E0A73A; --error: #EF6A6A;
  --shadow-card: inset 0 1px 0 rgba(255,255,255,.04);
  --shadow-pop: 0 24px 56px -16px rgba(0,0,0,.6);
}
html { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
body { font-family: var(--font-sans); font-size: 16px; line-height: 1.6; text-wrap: pretty; }
h1,h2,h3,h4 { font-family: var(--font-display); text-wrap: balance; letter-spacing: -0.02em; }
:focus-visible { outline: 2px solid color-mix(in srgb, var(--accent) 40%, transparent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
```

### 12.2 `tailwind.config.ts` (extend)
```ts
theme: {
  extend: {
    colors: {
      bg: "var(--bg)", surface: "var(--surface)", "surface-raised": "var(--surface-raised)",
      text: "var(--text)", "text-soft": "var(--text-soft)", "text-muted": "var(--text-muted)",
      border: "var(--border)", "border-strong": "var(--border-strong)",
      accent: { DEFAULT: "var(--accent)", hover: "var(--accent-hover)", soft: "var(--accent-soft)" },
      success: "var(--success)", warning: "var(--warning)", error: "var(--error)",
    },
    borderRadius: { card: "20px", control: "12px", dialog: "24px" },
    boxShadow: { sm: "var(--shadow-sm)", card: "var(--shadow-card)", pop: "var(--shadow-pop)" },
    fontFamily: {
      sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      display: ["var(--font-inter-display)", "var(--font-inter)", "ui-sans-serif"],
      serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      mono: ["var(--font-jetbrains-mono)", "ui-monospace"],
    },
    transitionTimingFunction: { out: "cubic-bezier(.22,1,.36,1)" },
    maxWidth: { page: "1200px", prose: "720px" },
  },
}
```

### 12.3 Framer Motion presets (`lib/motion.ts`)
```ts
export const ease = [0.22, 1, 0.36, 1] as const;
export const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
export const stagger = { show: { transition: { staggerChildren: 0.06 } } };
export const buildSection = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
```

### 12.4 Theme
Use `next-themes` with `attribute="class"`, `defaultTheme="system"`. Add a theme toggle (sun and moon icons, Lucide) in the navbar and dashboard top bar.

---

## 13. PORTFOLIO TEMPLATE DESIGN RULES (for the 20 templates per niche)

- Every template uses the same schema-driven components but has its own personality per niche (a data scientist's portfolio feels different from a motion designer's).
- Same quality bar as the app: generous spacing, strong hierarchy, premium typography, no clutter.
- Each template ships light and dark variants, a mobile layout, and an accent color the user can change.
- Required in all: hero with name and role, about, work or projects, skills, experience, contact with clear buttons (email, WhatsApp, LinkedIn, etc.), footer. Niche-specific sections per research.
- Published portfolios show a small "Built with Forma" badge on the Free plan (bottom, subtle, links to Forma).
- Originality is mandatory. Use scouted portfolios as inspiration for structure only. Never copy anyone's design, code, images or text.

---

## 14. QUALITY CHECKLIST (run before every commit that touches UI)

- [ ] Uses semantic tokens only, no raw hex in components
- [ ] Spacing on the 8px scale, nothing crowded, nothing touching edges
- [ ] Radius and shadows match the system
- [ ] Light and dark mode both checked
- [ ] Responsive at 375, 768, 1024, 1440, no horizontal scroll
- [ ] Hover, focus, active, disabled, loading, empty and error states exist
- [ ] Keyboard navigable, focus visible, contrast AA
- [ ] Motion uses the defined easing, respects reduced motion
- [ ] Copy is short, human, no AI-sounding phrases
- [ ] Lint, type check and build pass