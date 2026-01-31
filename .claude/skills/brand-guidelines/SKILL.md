---
name: brand-guidelines
description: Applies Obieo's official brand colors, typography, and design tokens to any artifact. Use when brand colors or style guidelines, visual formatting, or design consistency applies.
license: Complete terms in LICENSE.txt
---

# Obieo Brand Styling

## Overview

Obieo is a solo SEO/AEO agency targeting home service businesses. The brand personality is **warm, professional, and craft-focused** — terracotta tones evoke the trades, cream backgrounds feel inviting, and modern typography keeps it sharp.

**Keywords**: branding, visual identity, styling, brand colors, typography, Obieo brand, visual formatting, design tokens, theming

## Brand Guidelines

### Colors

**Primary Accent (Terracotta):**

- Terracotta 300: `#f2b094` - Light variant, icon backgrounds, overlays
- Terracotta 400: `#e8916b` - Secondary accent, dark mode primary
- Terracotta 500: `#d97650` - **Primary brand color** — buttons, links, accents
- Terracotta 600: `#c4613c` - Hover states, emphasis

**Backgrounds (Cream):**

- Cream 50: `#fdfcfa` - Primary background (light mode)
- Cream 100: `#f5f2ed` - Secondary background (light mode)
- Card/Elevated: `#ffffff` - Card and elevated surfaces

**Text:**

- Primary: `#1a1612` - Main body text (dark brown)
- Secondary: `#5c5549` - Descriptive text (mid brown)
- Muted: `#8a8279` - Subtle/disabled text (light brown)

**Borders:**

- Border: `#e8e4dc` - Standard borders
- Border Light: `#f0ece4` - Subtle borders

**Dark Mode Overrides:**

- Background Primary: `#0f0d0b`
- Background Secondary: `#1a1714`
- Card: `#242019`
- Elevated: `#2d2922`
- Text Primary: `#f5f2ed`
- Text Secondary: `#a39e94`
- Text Muted: `#6b665e`
- Accent: `#e8916b` (lighter terracotta for contrast)
- Accent Hover: `#f2b094`
- Border: `#2d2922`
- Border Light: `#3d3830`

### Typography

- **Display/Headings**: Outfit (via `--font-outfit`)
- **Body Text**: DM Sans (via `--font-dm-sans`)
- Both loaded via Next.js `next/font/google` in `layout.tsx`

### CSS Variable System

All colors are applied via CSS custom properties in `globals.css`:

```css
var(--accent)          /* Primary terracotta */
var(--accent-hover)    /* Hover state */
var(--accent-light)    /* Light variant */
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Secondary background */
var(--bg-card)         /* Card background */
var(--text-primary)    /* Main text */
var(--text-secondary)  /* Secondary text */
var(--text-muted)      /* Muted text */
var(--border)          /* Borders */
var(--font-display)    /* Outfit */
var(--font-body)       /* DM Sans */
```

### Tailwind Theme Tokens

Defined in `globals.css` via `@theme`:

```css
--color-terracotta-300: #f2b094;
--color-terracotta-400: #e8916b;
--color-terracotta-500: #d97650;
--color-terracotta-600: #c4613c;
--color-cream-50: #fdfcfa;
--color-cream-100: #f5f2ed;
```

Use as: `bg-terracotta-500`, `text-cream-50`, etc.

## Application Rules

### Buttons

- Primary: `bg-[var(--accent)]` with white text, hover `bg-[var(--accent-hover)]`
- Secondary: `bg-[var(--bg-card)]` with border
- Outline: `border-2 border-[var(--accent)]` with accent text
- Ghost: `text-[var(--text-primary)]` with hover background

### Text Hierarchy

- H1/H2/Logo: Outfit (`font-[family-name:var(--font-display)]`)
- Body/UI: DM Sans (default via body class)
- Primary text: `text-[var(--text-primary)]`
- Secondary text: `text-[var(--text-secondary)]`
- Muted text: `text-[var(--text-muted)]`
- Accent emphasis: `text-[var(--accent)]`

### Interactive States

- Focus: `outline: 2px solid var(--accent)` with `outline-offset: 2px`
- Selection: `background-color: var(--accent)`, `color: var(--bg-primary)`
- Theme transitions: `0.2s ease` on color, background, and border changes

### Dark Mode

Applied via `[data-theme="dark"]` selector. All CSS variables automatically swap. No additional classes needed — the variable system handles it.

## Do's and Don'ts

**Do:**
- Use CSS variables (`var(--accent)`) rather than hardcoded hex values
- Use Tailwind theme tokens (`bg-terracotta-500`) for Tailwind classes
- Maintain warm, earthy tone — terracotta + cream is the core palette
- Keep dark mode contrast accessible

**Don't:**
- Use cold blues or grays as primary colors (save for ROI widget accents only)
- Hardcode hex values — always use the variable/token system
- Mix font families beyond Outfit (display) and DM Sans (body)
- Skip hover/focus states on interactive elements
