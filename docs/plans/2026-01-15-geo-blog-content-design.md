# GEO Blog Content Strategy

## Overview

Two-piece content system for Generative Engine Optimization (GEO):

1. **Technical Hub** — Comprehensive guide targeting SEO rankings + credibility asset
2. **Contractor Piece** — Accessible entry point driving call bookings

```
┌─────────────────────────────────────────────────────────────┐
│  TECHNICAL HUB                                               │
│  "The Complete Guide to Generative Engine Optimization"      │
│  ~3,300 words | SEO target + sales asset                     │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ "Want the deep dive?"
                          │
┌─────────────────────────────────────────────────────────────┐
│  CONTRACTOR PIECE                                            │
│  "Why Your Competitors Will Be Invisible in 2 Years"         │
│  ~1,200 words | First-mover angle, non-technical             │
│  CTA: Book a strategy call                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Piece 1: Technical Hub

**Title:** The Complete Guide to Generative Engine Optimization (GEO)

**URL:** `/blog/generative-engine-optimization-guide`

**SEO Targets:** "generative engine optimization," "GEO SEO," "AI search optimization," "llms.txt"

**Goal:** Rank for GEO-related terms + serve as credibility asset for proposals/pitches

### Content Outline

| Section | Words | Key Data Points |
|---------|-------|-----------------|
| What is GEO? | 300 | AI Overviews in 52% of searches (Feb 2025), LLM traffic to overtake Google by 2027 |
| How AI Search Works | 400 | RAG pipeline, citation selection vs ranking |
| Citation Landscape | 500 | Wikipedia 47.9% ChatGPT citations, Reddit dominance in Perplexity |
| The llms.txt Protocol | 600 | 0.3% adoption rate, implementation guide, schema examples |
| E-E-A-T for AI | 400 | Trust signal translation, structured data requirements |
| Agentic Commerce | 400 | Google UCP, OpenAI checkout integration |
| Measurement & Tools | 300 | Citation tracking, brand monitoring platforms |
| Implementation Roadmap | 400 | Prioritized checklist |
| **Total** | ~3,300 | |

### Unique Differentiator

Lapeyre Roofing case study woven throughout — real proof of a newer company appearing alongside 40-50 year incumbents in AI recommendations.

### SEO/GEO Optimization Checklist

- [ ] Primary keyword in title, H1, first paragraph, URL
- [ ] Meta description with keyword and compelling hook (150-160 chars)
- [ ] H2/H3 structure with secondary keywords
- [ ] Direct answer to "what is GEO" in first 150 words
- [ ] Specific data points and statistics throughout
- [ ] FAQ section with schema markup
- [ ] Internal links to Lapeyre case study and contractor piece

---

## Piece 2: Contractor Piece

**Title:** Why Your Competitors Will Be Invisible in 2 Years (And How to Get Ahead)

**URL:** `/blog/ai-search-contractors`

**SEO Targets:** "AI search for contractors," "how homeowners find contractors"

**Goal:** Lead generation — drive call bookings

**Angle:** Opportunity/first-mover (not fear-based)

### Content Outline

1. **Hook (100 words)**
   - Direct answer: How homeowners find contractors is shifting from Google to AI
   - Most contractors have no idea — here's your window

2. **The Proof (300 words)**
   - Real example: Asked Gemini for Austin roofers
   - Lapeyre Roofing recommended alongside Kidd Roofing (since 1982), Ja-Mar (50+ years), Wilson Roofing
   - Include Gemini response screenshot/quote

3. **What This Means For You (400 words)**
   - First-mover framing
   - Competitors still fighting over Google Ads
   - The smart play is positioning now before AI search becomes default

4. **Why It Works (300 words)**
   - Non-technical summary: reputation signals, authoritative citations, community discussions
   - Reddit/Nextdoor mentions matter
   - No jargon

5. **The Bottom Line (200 words)**
   - This is complex to implement yourself
   - You need a partner who understands both traditional SEO and AI
   - **CTA: Book a strategy call**
   - Link to technical hub for readers who want depth

### SEO/GEO Optimization Checklist

- [ ] Primary keyword in title, H1, first paragraph, URL
- [ ] Meta description targeting contractor audience (150-160 chars)
- [ ] Lead with direct answer (GEO-optimized)
- [ ] Specific proof (Lapeyre case) for AI citation potential
- [ ] Clear CTA to /call
- [ ] Link to technical hub

---

## Implementation

### File Structure

```
src/app/blog/
├── page.tsx                                    # Blog index (update posts array)
├── [slug]/page.tsx                             # Dynamic route
├── generative-engine-optimization-guide/
│   └── page.tsx                                # Technical hub
└── ai-search-contractors/
    └── page.tsx                                # Contractor piece
```

### Internal Linking

- Contractor piece → Technical hub ("Want the full technical breakdown?")
- Technical hub → Lapeyre case study (`/work/lapeyre-roofing`)
- Both pieces → `/call` CTA

### Writing Order

1. Technical hub first (foundation content)
2. Contractor piece second (references hub concepts)

### Cross-Promotion Uses

- **Technical hub:** LinkedIn posts, proposals, pitch decks, SEO traffic
- **Contractor piece:** Meta ads, email outreach, direct prospect targeting

---

## Source Material

Primary research from: https://github.com/amplifying-ai/awesome-generative-engine-optimization

Key statistics to cite:
- AI Overviews appeared in 52% of tracked searches (Feb 2025), up from 6.49% in January
- LLM traffic predicted to overtake Google search by 2027
- Wikipedia accounts for 47.9% of ChatGPT top citations
- Only 0.3% of top 1,000 websites implement llms.txt
