# LinkedIn Outreach Campaign - Session Progress

**Date:** 2026-01-25
**Status:** Complete - emails sent, first reply received

---

## What Was Done

- Fixed GoHighLevel MCP server connection (required adding `locationId` parameter to API calls)
- Processed 2 CSV files from ZeroBounce email validation (~44 emails)
- Filtered for home services ICP - identified 18 qualified prospects
- Cross-referenced with LinkedIn data to get full names and profile URLs
- Created all 18 contacts in GoHighLevel with:
  - Source: LinkedIn
  - Tags: Industry tag + "LinkedIn AI Post"
  - Custom field: LinkedIn Profile URL (field ID: YTAwXVtQvnDsCLg96pe5)
- Researched all 18 companies via web search
- Drafted personalized outreach emails (multiple iterations to refine copy)
- Final email template (Variant 1 - short and direct):
  ```
  Subject: 👋 [Name]

  Hey [Name],

  We get home service companies recommended by ChatGPT, Google AI, and Perplexity.

  Interested in learning more?
  - Hunter
  ```
- User sent all 18 emails via Gmail
- Received first reply from Dustin Marx (Call Mother) - "How?"
- Drafted follow-up response options with "sell the vacation, not the trip" approach

## The 18 Prospects

**Hot Prospects:**
1. Sean Laux - KND Landscaping (Technology & Innovation Manager)
2. Dustin Marx - Call Mother (Serial entrepreneur, tech-forward) ← REPLIED
3. Savier Caballero - Trust Concrete Bros (New company 2024, hungry)

**Big Fish:**
4. Gus Antos - Milestone Service ($150M revenue, 500+ employees)
5. Chad Cunningham - Elite Floor ($100M company)
6. Jeff Cantor - Flooring Memphis (PE-backed, expansion mode)

**Strong Fits:**
7. Grant Tonick - Pearson Air (40+ years, multifamily HVAC)
8. Isaac Turner - Champion Landscapes NC (VP, family business since 2001)
9. Ryan Kizer - Outdoor Elements TX (President, 35+ awards)
10. Jesse Spain - Great Lakes Roof (President, Chicago/Indiana)
11. Jim Heroux - Security Luebke Roofing (90 years in business)
12. Adam Gray - Quality Plumbing (President, Kansas City since 1983)
13. Mike Ambrose - Aztec Plumbing (COO, Florida since 1991)

**Solid Prospects:**
14. Dave Swanson - Fort Construction (COO, Fort Worth)
15. Andre Calixto - A1 Contracting (GM, Austin)
16. Michael Lusky - The Contractor Guys AZ (Owner, Phoenix)
17. Matthew Dravis - Trinity Restore TX (Procurement, Houston)
18. Megan Elbert - Build with Eagan (Project Assistant, St. Louis)

## Key Decisions

- Used short, direct email copy (Variant 1) instead of longer personalized versions
- Sent via Gmail instead of GHL due to email routing concerns with msgsndr domain
- User plans to set up dedicated sending domain in GHL later

## Technical Notes

- GHL Location ID: uYeEUrkrjlAgGnhEu9Ts
- LinkedIn Profile custom field ID: YTAwXVtQvnDsCLg96pe5
- GHL MCP requires `query_locationId` parameter on contact operations

## Next Steps

- Follow up with Dustin Marx (already replied)
- Monitor for additional replies
- Set up dedicated sending domain in GHL for future campaigns
- Prepare call talking points using research when prospects book
