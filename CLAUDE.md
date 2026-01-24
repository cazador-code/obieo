# Obieo - Claude Code Instructions

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

## Other Notes

### Environment
- Email sending requires `RESEND_API_KEY` in `.env.local`
- All audit emails go to `hunter@obieo.com`
