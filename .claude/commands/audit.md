# Prospect Audit

Run a comprehensive SEO/AEO/GEO prospect audit for a given website URL.

## Usage

`/audit <website-url>`

## Instructions

When this command is invoked with a URL, follow the Prospect Intel Audit workflow defined in CLAUDE.md:

1. **Extract Company Info** from the URL (company name, industry, location)
2. **Run Discovery** - WebFetch the homepage, WebSearch for reviews/directories/competitors
3. **Technical SEO Audit** (score 1-10) - title tags, meta descriptions, H1s, header hierarchy, mobile, speed, schema
4. **Content Quality Audit** - UVP, trust signals, CTAs, local optimization, content depth
5. **GEO Readiness Audit** - quotable definitions, factual density, Q&A format, authority signals
6. **Competitive Position** - search "[service] + [location]", identify who ranks above them and why
7. **Generate the full report** in the exact markdown format specified in CLAUDE.md
8. **Save** to `.claude/audit-report-{company-slug}.md`
9. **Send email** via `node scripts/send-audit-email.mjs`

Do NOT ask clarifying questions. Do NOT skip the email step. Run the full workflow automatically.
