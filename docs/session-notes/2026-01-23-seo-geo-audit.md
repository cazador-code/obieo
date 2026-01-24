# SEO/GEO Audit - Session Progress

**Date:** 2026-01-23
**Status:** Complete

---

## What Was Done

### Schema Markup (JSON-LD)
- Added JSON-LD schema to **35 indexable pages** (up from 31)
- New schemas added to:
  - `/ai-privacy-policy` - WebPage schema
  - `/disclaimer` - WebPage schema
  - `/fulfillment-policy` - WebPage schema
  - `/blog/[slug]` - Dynamic Article schema with E-E-A-T signals (author, publisher, dates)

### Sitemap Fix
- Fixed robots.txt pointing to wrong sitemap URL (`obieo.com` → `www.obieo.com`)
- Sitemap now properly serves 32+ pages
- Removed duplicate non-www sitemap from Google Search Console

### Files Modified
- 50 files changed, +4,357 lines
- New industry page layouts with proper metadata
- New GBP optimization service page
- RelatedIndustries component for internal linking

## Key Decisions

- **Canonical domain:** www.obieo.com (non-www redirects via Vercel)
- **Schema types used:** Article (blog), WebPage (legal), ProfessionalService (services), LocalBusiness (industry pages)
- **Pages without schema:** Thank-you pages, internal tools, Sanity Studio (correctly excluded)

## Google Search Console Status

| Sitemap | Status | Pages |
|---------|--------|-------|
| www.obieo.com/sitemap.xml | Success | 32 |

## Next Steps

- Monitor GSC for indexing progress (1-7 days for schema recognition)
- Watch for rich result eligibility (1-2 weeks)
- Track GEO/AI visibility improvements (2-4 weeks)
- Consider requesting indexing for high-priority blog posts

## Commit

```
9aaba02 feat: comprehensive SEO/GEO audit with schema markup
```
