# Obieo - Claude Code Instructions

## Project Overview

**Obieo** is a Next.js marketing website for a solo SEO/AEO (Answer Engine Optimization) agency targeting home service businesses (plumbers, electricians, roofers, etc.).

**Key Features:**
- AI Visibility Quiz (lead capture with scoring)
- ROI Calculator (multi-step with animated widgets)
- Industry landing pages (10+ verticals)
- Blog & Case Studies (Sanity CMS)
- Prospect Audit Tool (Claude Agent SDK)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, PostCSS |
| Animations | Framer Motion, GSAP, Lenis (smooth scroll) |
| CMS | Sanity (headless) |
| Email | Resend API |
| AI | Claude Agent SDK (Anthropic) |
| Database | Vercel KV (Redis) for rate limiting |
| Tracking | GTM, Facebook Pixel + CAPI |
| CRM | GoHighLevel (webhook) |
| Deployment | Vercel |

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (leads, audit)
│   ├── blog/              # Blog pages
│   ├── industries/        # Industry landing pages
│   ├── quiz/              # AI Visibility Quiz
│   ├── roi-calculator/    # ROI Calculator
│   └── studio/            # Sanity Studio
├── components/
│   ├── home/              # Homepage sections
│   ├── quiz/              # Quiz components
│   ├── roi-calculator/    # Calculator components
│   ├── roi-widgets/       # Animated ROI visualizations
│   ├── ui/                # Headless UI primitives
│   └── animations/        # Reusable animations
├── sanity/
│   ├── schemas/           # Content type definitions
│   ├── queries.ts         # GROQ queries
│   └── client.ts          # Sanity client (lazy-loaded)
├── lib/                   # Utilities (rate-limit.ts)
└── hooks/                 # Custom hooks (useGsap.ts)
```

---

## Development Patterns

### Component Organization
- Barrel exports via `index.ts` files
- Small, focused components with clear responsibilities
- Context API for global state (BookingModalContext)

### Sanity CMS
- **Client is lazy-loaded** - returns `[]` if not configured
- GROQ queries in `src/sanity/queries.ts`
- Schemas in `src/sanity/schemas/`
- ISR caching: 0s dev, 60s prod

### Security (Always Follow)
- **HTML escape** user input in emails (use existing `escapeHtml` function)
- **Validate URLs** - no localhost/internal IPs in production
- **Rate limit** API routes using `@/lib/rate-limit`
- **Sanitize** any AI prompt inputs

### Animations
- Framer Motion for component animations
- GSAP via `useGsap` hook for complex sequences
- ROI widgets use custom canvas/SVG animations

---

## Common Tasks

### Adding a New Industry Page
1. Create `src/app/industries/[industry-name]/page.tsx`
2. Follow existing industry page structure (see `/industries/cleaning`)
3. Add to navigation in `Header.tsx` if needed

### Adding ROI Widget
1. Create component in `src/components/roi-widgets/`
2. Export from `roi-widgets/index.ts`
3. Follow existing patterns (PaintFill, PipeFlow, etc.)

### Working with Sanity
```typescript
import { getSanityClient } from '@/sanity/client'
import { groq } from 'next-sanity'

const query = groq`*[_type == "project"] | order(publishedAt desc)`
const data = await getSanityClient().fetch(query)
```

### API Rate Limiting
```typescript
import { rateLimit } from '@/lib/rate-limit'

const { success } = await rateLimit(request, { limit: 5, window: 60 })
if (!success) return new Response('Rate limited', { status: 429 })
```

---

## Environment Variables

**Required for full functionality:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
GHL_WEBHOOK_URL=
```

**AI Visibility Quiz (new):**
```env
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=   # Business name autocomplete
ZEROBOUNCE_API_KEY=                   # Email verification
GOOGLE_PAGESPEED_API_KEY=             # Optional, higher rate limits
```

**Optional:**
```env
FB_CONVERSIONS_API_TOKEN=
NOTIFICATION_EMAIL=hunter@obieo.com
VERCEL_KV_REST_API_URL=
VERCEL_KV_REST_API_TOKEN=
```

---

## Testing

**Note:** No testing framework is configured. If adding tests, recommend Vitest + Testing Library.

---

## MCP Server Setup

These MCP servers are used for marketing, analytics, and automation tasks. They consume significant context, so only add them when needed.

### Always-on (lightweight)
These are managed by plugins or are essential — no action needed:
- `episodic-memory` — plugin-managed
- `superpowers-chrome` — plugin-managed
- `greptile` — plugin-managed

### Project-level (`.mcp.json` in repo root)
Already configured in this repo's `.mcp.json`:
```json
{
  "mcpServers": {
    "gtm": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gtm-mcp.stape.ai/mcp"]
    },
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"]
    }
  }
}
```

### User-level (`~/.mcp.json`)
Google Search Console is configured in `~/.mcp.json`:
```json
{
  "mcpServers": {
    "gsc": {
      "command": "/Users/hunterlapeyre/.mcp-gsc/.venv/bin/python",
      "args": ["/Users/hunterlapeyre/.mcp-gsc/gsc_server.py"]
    }
  }
}
```

### On-demand (add/remove as needed)
These are added via `claude mcp add` and consume heavy context. Add when doing CRM or automation work:

```bash
# GoHighLevel CRM (~25 tools)
claude mcp add gohighlevel --transport http https://services.leadconnectorhq.com/mcp/

# n8n Workflow Automation (~15 tools)
claude mcp add n8n-mcp -- npx n8n-mcp
```

To remove when done:
```bash
claude mcp remove gohighlevel
claude mcp remove n8n-mcp
```

---

## Prospect Intel Audit

When given a URL to audit (or asked to run a prospect audit), follow this workflow **without asking clarifying questions**:

### Automatic Detection
- **You ARE running locally in Claude Code** → Use the workflow below (free, uses Claude Max subscription)
- The Agent SDK script (`run-audit.mjs`) is for the web portal and webhooks only - never run it from Claude Code

### Local Audit Workflow

**Input**: A website URL (e.g., `https://example.com`)

**Step 1: Extract Company Info**
From the URL and initial page fetch, determine:
- Company name (from title, logo, or about page)
- Website URL (as provided)
- Set source as "Claude Code Audit"

**Step 2: Run the Analysis**
Perform a comprehensive SEO/GEO/AEO audit following this structure:

#### Phase 1: Discovery
1. Use WebFetch to analyze the homepage
2. Use WebSearch to find:
   - Google reviews and ratings
   - Local business directory presence
   - News mentions or PR coverage
   - Competitor rankings for their industry + location

#### Phase 2: Technical SEO (Score 1-10)
- Title Tag optimization
- Meta Description (150-160 chars)
- H1 Tag quality
- Header hierarchy (H1-H6)
- Mobile friendliness signals
- Page speed indicators
- Schema markup presence

#### Phase 3: Content Quality
- Unique Value Proposition clarity
- Trust signals (testimonials, certifications, BBB)
- Call-to-Action effectiveness
- Local optimization (service areas)
- Content depth

#### Phase 4: GEO Readiness
- Clear, quotable definitions
- Factual density (specific stats vs vague claims)
- Q&A/FAQ format content
- Authority signals
- Citation quality

#### Phase 5: Competitive Position
Search for "[their service] + [their location]" to understand:
- Who ranks above them
- What competitors do better
- Content gaps

**Step 3: Generate Report**
Output the report in this exact format:

```markdown
# Prospect Intelligence Report

## Company Overview
[Company name, industry, location, years in business if found]

## Quick Assessment
| Area | Score | Priority |
|------|-------|----------|
| Technical SEO | X/10 | Red/Yellow/Green |
| Content Quality | X/10 | Red/Yellow/Green |
| GEO Readiness | X/10 | Red/Yellow/Green |
| Local SEO | X/10 | Red/Yellow/Green |
| **Overall** | X/10 | |

## Key Findings

### Critical Issues (Must Fix)
[Numbered list]

### Important Improvements
[Numbered list]

### Quick Wins
[Easy fixes with high impact]

## Competitive Landscape
[Who's winning and why]

## Sales Talking Points
[3-5 specific observations for demo calls]

## Recommended Obieo Services
- [Service 1]: [Why]
- [Service 2]: [Why]

---

## Sources
1. **Google Business Profile URL** - [exact URL]
2. BBB profile URLs found
3. Review site URLs (Yelp, Angi, etc.)
4. Competitor websites referenced
```

**Step 4: Save and Email**
1. Save the report to `.claude/audit-report-{company-slug}.md`
2. Send via email using:
```bash
node scripts/send-audit-email.mjs \
  -c "Company Name" \
  -w "https://website.com" \
  -r .claude/audit-report-{company-slug}.md \
  -s "Claude Code Audit"
```

### Quick Reference

| Scenario | Action |
|----------|--------|
| User gives URL | Run full audit workflow above |
| User says "audit this" | Run full audit workflow |
| User asks about audit process | Explain this workflow |
| User wants API/webhook audit | Direct to web portal at `/internal/prospect-audit` |

### Do NOT
- Ask "which mode do you want?"
- Ask "should I use local or API?"
- Ask "do you want me to send the email?"
- Run `node scripts/run-audit.mjs` (that uses API credits)
- Skip the email step

### Cost Breakdown
- **This workflow (Claude Code local)**: $0 (uses Max subscription)
- **Agent SDK via run-audit.mjs**: ~$2-3 per audit (API credits)
- **Web portal**: ~$2 per audit (API credits)

---

## Gotchas & Tips

1. **Sanity optional** - App works without Sanity configured (queries return `[]`)
2. **Rate limiting on Vercel KV** - Won't work locally without KV env vars
3. **Facebook CAPI** - Server-side tracking requires `FB_CONVERSIONS_API_TOKEN`
4. **ROI widgets are canvas-heavy** - Test performance on mobile
5. **No tests** - Be extra careful with refactoring
6. **Industry pages are template-based** - Keep structure consistent across all 10+

---

## Security Checklist

**Before completing any task, verify:**

- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] User inputs are validated and sanitized (see Security patterns above)
- [ ] URLs are validated against SSRF (no localhost/internal IPs)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No new security vulnerabilities introduced

### Security Scanning Tools

Run these commands to check for issues:

```bash
# Check for leaked secrets
npx gitleaks detect --source .

# Check for vulnerable dependencies
npm audit

# TypeScript type checking
npx tsc --noEmit

# Lint for code quality issues
npm run lint
```

### Automated PR Reviews (Optional)

To enable automatic security reviews on pull requests, add [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action) to `.github/workflows/`.
