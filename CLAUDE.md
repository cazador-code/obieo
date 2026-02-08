# Obieo - Claude Code Instructions

## Project Overview

**Obieo** is a Next.js marketing website for a solo SEO/AEO (Answer Engine Optimization) agency targeting home service businesses (plumbers, electricians, roofers, etc.).

**Business Lines:**
1. **Obieo SEO/AEO Agency** — Core service. Website, content, and AI visibility optimization for home service businesses.
2. **Obieo Lead Generation** — Recently acquired. Done-for-you SMS-based lead gen for roofing contractors (not on website yet, internal ops only). See [Obieo Lead Generation](#obieo-lead-generation-acquired-business) section below.

**Website Features:**
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

### Development tools (always-on, project-level)
Configured via `claude mcp add` for this project:

- **`next-devtools`** — Next.js 16 runtime diagnostics, build errors, route inspection, upgrade tooling
- **`context7`** — Up-to-date, version-specific docs for any library (Next.js, React, Tailwind, etc.)
- **`lighthouse`** — Google Lighthouse audits (Core Web Vitals, accessibility, SEO, security) with 13+ tools

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

### Auto-invoke Rules
- Use **Context7** for any library/framework documentation lookups (append `use context7` to queries about Next.js, React, Tailwind, Framer Motion, GSAP, or Sanity APIs)
- Use **Lighthouse MCP** during prospect audits for Technical SEO scoring (replaces manual WebFetch-based speed analysis)
- Use **Next DevTools** `init` at the start of development sessions when the dev server is running

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
- Run **Lighthouse MCP** audit on the URL (mobile + desktop) for Core Web Vitals, performance, accessibility, and SEO scores
- Title Tag optimization
- Meta Description (150-160 chars)
- H1 Tag quality
- Header hierarchy (H1-H6)
- Mobile friendliness signals
- Page speed indicators (use Lighthouse data)
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

## Obieo Lead Generation (Acquired Business)

Obieo Lead Generation is a sub-service providing done-for-you, SMS-based homeowner lead generation exclusively for **roofing contractors** across the United States. Recently acquired and operated under the Obieo brand. **Not currently on the website** — internal operations only for now.

### Business Model
- **Pricing:** Pay-per-lead packages. 40 leads for $1,600 ($40/lead). No monthly retainer.
- **Payment:** Half up front ($800), auto-bill after fulfillment via Ignition payment processor.
- **Price flexibility:** Hold firm at $40/lead. May drop to $39 to close. No deeper discounting.
- **Upsell path:** After ~180 leads delivered (response rates degrade), upsell into Obieo SEO services and/or managed Meta advertising. The 180-lead cap is a feature, not a bug — it's the designed upsell trigger.
- **Upsell expectation set during initial sales call** — transition to SEO/Meta framed as natural next step from day one.

### Acquisition Funnel (B2B)
1. Meta ad on a **separate Facebook page** (protects brand, prevents funnel hacking)
2. Ad → GHL landing page → prospect books discovery call
3. Sales call (owner) → close → sign T&C → payment via Ignition → onboarding form → Airtable sync

**Metrics:** CPB appointment $20–$30 | Show rate 48% | Close rate 37% (of shows) | Avg ticket $1,600 | CAC ~$140

### Backend Fulfillment Flow
1. Onboarding answers sync to **Airtable** (central ops database)
2. Backend employee assigns customer to a GHL sub-account (max 5 seats per sub-account)
3. Homeowner data sourced via **DealMachine** ($149/month)
4. Data filtered through **Landline Remover** (~$0.0022/contact) — hit rate ~40–50%
5. A2P texting campaign launched through **Sendivo** (sendivo.io/marketing)
6. GHL automations filter responses (opt-outs, irrelevant, non-qualified)
7. Qualified leads routed to contractor (email + phone)
8. ~180 lead cap per customer before response rates degrade

### Technology Stack
| Tool | Purpose |
|------|---------|
| GoHighLevel (GHL) | CRM, automations, landing pages, calendar, lead routing, sub-accounts |
| Meta Ads | B2B acquisition (separate page from Obieo) |
| Airtable | Customer tracking, seat assignments, campaign status |
| DealMachine | Homeowner data sourcing ($149/month) |
| Landline Remover | Mobile-only filtering (~$0.0022/contact) |
| Ignition | Payment processing (auto-charge capable) |
| Sendivo (sendivo.io/marketing) | A2P texting platform ($0.004/text excl. variable carrier fees) |

### GHL Sub-Account Architecture
- Max 5 customer seats per sub-account (A2P throughput / carrier flagging limits)
- New sub-accounts provisioned as customer count grows
- Airtable tracks seat availability across all sub-accounts

### Compliance (TCPA)
- Operating under **informational exception** of TCPA
- DNC registry scrubbing on all lists
- Landline Remover filters non-mobile numbers
- Attorney has reviewed texting methodology
- All messages include opt-out instructions; GHL auto-suppresses opt-outs
- Geographic exclusivity enforced by ZIP code (hard policy, no overlapping service areas)

### Team
- **Owner/Operator:** Strategy, sales calls, pricing, upsell, P&L
- **Backend Operations Contractor:** $800/month. Manages GHL, Airtable, data scraping, sub-account assignment, campaign launches. Came with acquisition — primary holder of operational knowledge. **SOPs need urgent documentation.**

### Key Strategic Priorities
1. Document all SOPs from backend contractor immediately (screen recordings + written procedures)
2. Determine actual text-to-qualified-lead conversion rate to nail down true fulfillment cost
3. Improve show rate (48%) through better reminder sequences — highest-leverage profitability improvement
4. Understand close rate objections (63% don't close) to optimize sales process
5. Build toward upselling lead gen customers into Obieo SEO and Meta ads services

### Known Constraints & Risks
- ~180 lead ceiling per customer (by design — upsell trigger)
- Single backend contractor = critical bottleneck with no redundancy
- A2P texting in legal gray area despite attorney review + DNC scrubbing
- Variable carrier fees not fully predictable
- Full GHL platform dependency

### When Helping With Lead Gen
- This is a **lead generation business for roofing contractors**, not SaaS
- Revenue is per-package ($1,600/40 leads), not subscription/MRR
- Always consider TCPA compliance when discussing messaging strategy
- Backend contractor at $800/month is underpaid relative to importance — factor into scaling/hiring discussions
- Geographic exclusivity by ZIP code is non-negotiable

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
