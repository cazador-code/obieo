#!/usr/bin/env node
import { query } from '@anthropic-ai/claude-agent-sdk';
import { Resend } from 'resend';
import { readFileSync } from 'fs';

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const keyTrimmed = key.trim();
    let value = valueParts.join('=').trim();
    // Strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[keyTrimmed] = value;
  }
});

// For local runs, delete ANTHROPIC_API_KEY so Claude CLI uses Max subscription
// The API key is kept in .env.local for the web portal
if (process.argv.includes('--local') || !process.env.VERCEL) {
  delete process.env.ANTHROPIC_API_KEY;
  console.log('Using Claude Max subscription (local mode)');
}

const HUNTER_EMAIL = 'hunter@obieo.com';

const SEO_AUDIT_SYSTEM_PROMPT = `You are an expert SEO/GEO analyst performing a comprehensive website audit for a sales prospect. Your analysis will help the sales team prepare for a demo call.

## Your Mission
Analyze the prospect's website and provide actionable insights across three areas:
1. **Traditional SEO** - Technical health, on-page optimization, content quality
2. **GEO (Generative Engine Optimization)** - How well the site appears in AI responses
3. **AEO (Answer Engine Optimization)** - Featured snippet and voice search optimization

## Audit Process

### Phase 1: Discovery
1. Use WebFetch to load and analyze the homepage
2. Use WebSearch to find:
   - The company's Google reviews and ratings
   - Their presence in local business directories
   - News mentions or PR coverage
   - Competitor rankings for their industry + location

### Phase 2: Technical SEO Analysis
Evaluate and score (1-10):
- **Title Tag**: Is it optimized? Includes keyword + location?
- **Meta Description**: Compelling? Correct length (150-160 chars)?
- **H1 Tag**: Clear, keyword-rich, single H1?
- **Header Structure**: Logical H1-H6 hierarchy?
- **Mobile Friendliness**: Responsive design signals?
- **Page Speed Indicators**: Heavy images, scripts blocking render?
- **Schema Markup**: Is structured data present?

### Phase 3: Content Quality
Evaluate:
- **Unique Value Proposition**: Is it immediately clear what they do?
- **Trust Signals**: Testimonials, certifications, years in business, BBB rating?
- **Call-to-Action**: Clear next steps for visitors?
- **Local Optimization**: Service areas, location-specific content?
- **Content Depth**: Thin content vs comprehensive service pages?

### Phase 4: GEO Readiness
Evaluate how well content would be cited by AI systems:
- **Clear Definitions**: Are services clearly defined in quotable statements?
- **Factual Density**: Specific stats, years, numbers vs vague claims?
- **Q&A Format**: FAQ sections with structured answers?
- **Authority Signals**: Expert quotes, certifications, industry credentials?
- **Citation Quality**: Do they cite sources or provide verifiable claims?

### Phase 5: Competitive Position
Use WebSearch to understand:
- Who ranks for "[their service] + [their location]"?
- What are competitors doing better?
- What content gaps exist?

## Output Format

Structure your analysis as:

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
[Numbered list of critical problems]

### Important Improvements
[Numbered list of medium-priority items]

### Quick Wins
[Easy fixes with high impact]

## Competitive Landscape
[Who's winning in their market and why]

## Sales Talking Points
[3-5 specific observations to mention in the demo call]

## Recommended Obieo Services
Based on this audit, the prospect would benefit from:
- [Service 1]: [Why]
- [Service 2]: [Why]

---

## Sources
Always include at the end:
1. **Google Business Profile URL** - CRITICAL: Always search for and include the exact Google Business Profile / Google Maps URL for this contractor. This helps verify we have the right business. Format: https://www.google.com/maps/place/... or https://g.co/...
2. Any BBB profile URLs found
3. Review site URLs (Yelp, Angi, etc.)
4. Competitor websites referenced
5. Any other sources used

Be thorough but concise. This report will be emailed to the sales team for demo prep.`;

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

async function runAudit(leadInfo) {
  const { name, email, company, website, source } = leadInfo;

  console.log(`Starting audit for ${company} (${website})...`);

  const userPrompt = `Please perform a comprehensive SEO/GEO audit for this prospect:

**Lead Information:**
- Name: ${name}
- Company: ${company}
- Email: ${email}
- Website: ${website}
- Source: ${source}

Start by fetching their homepage, then use web search to gather competitive intelligence. Provide a complete Prospect Intelligence Report.`;

  let reportContent = '';

  for await (const event of query({
    prompt: userPrompt,
    options: {
      model: 'claude-sonnet-4-20250514',
      systemPrompt: SEO_AUDIT_SYSTEM_PROMPT,
      allowedTools: ['WebSearch', 'WebFetch'],
      maxTurns: 15,
      maxBudgetUsd: 3.0,
    },
  })) {
    console.log('Event:', event.type, event.subtype || '');
    if (event.type === 'result') {
      if (event.subtype === 'success') {
        reportContent = event.result;
        console.log(`Audit complete: ${event.usage?.input_tokens || 0} in, ${event.usage?.output_tokens || 0} out`);
        console.log('Report length:', reportContent?.length || 0);
        console.log('Report content:', reportContent);
      } else {
        console.log('Audit failed with subtype:', event.subtype);
        throw new Error(`Audit failed: ${event.subtype}`);
      }
    }
  }

  if (!reportContent) {
    throw new Error('No report generated');
  }

  console.log('Report generated successfully. Length:', reportContent.length);
  console.log('Attempting to send email...');

  // Send email
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Resend API key present:', !!process.env.RESEND_API_KEY);

  const htmlContent = reportContent
    .replace(/^# (.+)$/gm, '<h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 32px 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 28px 0 12px 0;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #334155; font-size: 16px; font-weight: 600; margin: 20px 0 8px 0;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
    .replace(/^(\d+)\. (.+)$/gm, '<p style="margin: 8px 0 8px 16px;">$1. $2</p>')
    .replace(/^- (.+)$/gm, '<p style="margin: 8px 0 8px 16px;">&bull; $1</p>')
    .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
    .replace(/\n/g, '<br>');

  const timestamp = new Date().toISOString();

  try {
    const emailResult = await resend.emails.send({
    from: 'Prospect Intel <noreply@leads.obieo.com>',
    to: HUNTER_EMAIL,
    subject: `Prospect Intel: ${company}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px; margin: 0;">OBIEO</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0;">Prospect Intelligence Report</p>
          </div>

          <!-- Lead Info -->
          <div style="background-color: #f8fafc; padding: 24px 40px; border-bottom: 1px solid #e2e8f0;">
            <table style="width: 100%;">
              <tr>
                <td style="vertical-align: top;">
                  <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Lead</p>
                  <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${name}</p>
                  <a href="mailto:${email}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${email}</a>
                </td>
                <td style="vertical-align: top;">
                  <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Company</p>
                  <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${company}</p>
                  <a href="${website}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${website}</a>
                </td>
                <td style="vertical-align: top;">
                  <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Source</p>
                  <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${source}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Content -->
          <div style="padding: 32px 40px; color: #475569; font-size: 15px; line-height: 1.6;">
            ${htmlContent}
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 4px 0; text-align: center;">
              Report generated ${formatDate(timestamp)}
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 4px 0; text-align: center;">
              <a href="https://obieo.com" style="color: #2563eb; text-decoration: none;">obieo.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

    console.log('Email result:', JSON.stringify(emailResult, null, 2));
    console.log(`Email sent to ${HUNTER_EMAIL}`);
  } catch (emailError) {
    console.error('Email send error:', emailError);
    throw emailError;
  }
  return reportContent;
}

// Parse command line args
const args = process.argv.slice(2);
const website = args[0] || 'https://realhomeid.org/';

runAudit({
  name: 'Real Home Solutions',
  email: 'rhsinfo208@gmail.com',
  company: 'Real Home Solutions LLC',
  website: website,
  source: 'Manual Audit'
}).then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
