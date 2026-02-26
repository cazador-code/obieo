import { NextRequest, NextResponse } from 'next/server';
import { isIP } from 'node:net';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { Resend } from 'resend';
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { verifyInternalToolToken } from '@/lib/internal-tool-auth';

// Configure for longer execution time (Vercel Pro supports up to 300s)
export const maxDuration = 300;
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.google.internal.',
  'metadata',
]);
const BLOCKED_HOST_SUFFIXES = ['.internal', '.local', '.localhost', '.lan'];

// Security: Sanitize user inputs to prevent prompt injection
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/[`${}\\]/g, '') // Remove template literal and escape chars
    .replace(/\n/g, ' ')      // Flatten newlines (injection vector)
    .replace(/\r/g, '')       // Remove carriage returns
    .trim()
    .slice(0, 200);           // Limit length
}

// Security: Validate URL format
function isValidWebsiteUrl(url: string): { valid: boolean; normalized: string } {
  try {
    // Add protocol if missing
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    const parsed = new URL(normalizedUrl);

    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, normalized: '' };
    }

    // Allow only public DNS names; block IPs, loopback, and internal/metadata hostnames.
    const normalizedHostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
    const hostname = normalizedHostname.replace(/^\[|\]$/g, '');
    const hasAlpha = /[a-z]/i.test(hostname);

    if (!hostname || !hasAlpha || BLOCKED_HOSTNAMES.has(normalizedHostname)) {
      return { valid: false, normalized: '' };
    }

    if (BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
      return { valid: false, normalized: '' };
    }

    // Block IPv4/IPv6 (including bracketed forms) and numeric host encodings.
    if (isIP(hostname) > 0 || /^0x[0-9a-f]+$/i.test(hostname) || /^\d+$/.test(hostname)) {
      return { valid: false, normalized: '' };
    }

    // Require a dotted hostname with non-numeric TLD.
    const hostnameParts = hostname.split('.');
    const tld = hostnameParts[hostnameParts.length - 1] || '';
    if (!hostname.includes('.') || /^\d+$/.test(tld)) {
      return { valid: false, normalized: '' };
    }

    return { valid: true, normalized: normalizedUrl };
  } catch {
    return { valid: false, normalized: '' };
  }
}

// Security: Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

interface LeadInfo {
  name: string;
  email: string;
  company: string;
  website: string;
  source: 'quiz' | 'roi-calculator' | 'demo';
  quizScore?: number;
}

const HUNTER_EMAIL = 'hunter@obieo.com';

const sourceLabels: Record<string, string> = {
  quiz: 'AI Visibility Quiz',
  'roi-calculator': 'ROI Calculator',
  demo: 'Demo Request Form',
};

function formatDate(isoString: string): string {
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

Be thorough but concise. This report will be emailed to the sales team for demo prep.

**IMPORTANT:** Do NOT include any report metadata like "Report Generated", "Demo Source", "Lead Source", timestamps, or similar footer information. The email system will add this metadata automatically from the lead data.`;

export async function POST(request: NextRequest) {
  // Security: Verify JWT authentication before processing
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const isAuthenticated = await verifyInternalToolToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized - invalid or expired token' },
      { status: 401 }
    );
  }

  // Rate limiting - this endpoint is expensive ($2/request)
  const ip = getClientIp(request);
  const { success, remaining } = await auditLimiter.limit(ip);
  if (!success) {
    return rateLimitResponse(remaining);
  }

  try {
    const body = await request.json();
    const { name, email, company, website, source, quizScore } = body as LeadInfo;

    // Validate required fields
    if (!name || !email || !company || !website) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Security: Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Security: Validate and normalize website URL
    const urlValidation = isValidWebsiteUrl(website);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    // Security: Sanitize all user inputs to prevent prompt injection
    const safeName = sanitizeForPrompt(name);
    const safeCompany = sanitizeForPrompt(company);
    const safeEmail = sanitizeForPrompt(email);
    const safeWebsite = urlValidation.normalized;
    const safeSource = ['quiz', 'roi-calculator', 'demo'].includes(source) ? source : 'demo';

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Run the audit using Agent SDK with WebSearch and WebFetch tools
    // Security: Using sanitized inputs to prevent prompt injection
    const userPrompt = `Please perform a comprehensive SEO/GEO audit for this prospect:

**Lead Information:**
- Name: ${safeName}
- Company: ${safeCompany}
- Email: ${safeEmail}
- Website: ${safeWebsite}
- Source: ${safeSource}${quizScore ? `\n- Quiz Score: ${quizScore}` : ''}

Start by fetching their homepage, then use web search to gather competitive intelligence. Provide a complete Prospect Intelligence Report.`;

    console.log(`Starting audit for ${safeCompany} (${safeWebsite})`);

    let reportContent = '';

    // Use Agent SDK for full audit with tools
    for await (const event of query({
      prompt: userPrompt,
      options: {
        model: 'claude-sonnet-4-20250514',
        systemPrompt: SEO_AUDIT_SYSTEM_PROMPT,
        allowedTools: ['WebSearch', 'WebFetch'],
        maxTurns: 10,
        maxBudgetUsd: 2.0,
      },
    })) {
      if (event.type === 'result') {
        if (event.subtype === 'success') {
          reportContent = event.result;
          console.log(`Audit complete: ${event.usage.input_tokens} in, ${event.usage.output_tokens} out`);
        } else if (event.subtype === 'error_max_turns') {
          throw new Error('Audit exceeded maximum turns');
        } else if (event.subtype === 'error_max_budget_usd') {
          throw new Error('Audit exceeded budget limit');
        } else if (event.subtype === 'error_during_execution') {
          throw new Error(`Audit failed: ${event.errors?.join(', ') || 'Unknown error'}`);
        }
      }
    }

    if (!reportContent) {
      throw new Error('No report generated');
    }

    const timestamp = new Date().toISOString();

    console.log(`Audit complete for ${safeCompany}, sending email...`);

    // Send email
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email configuration error' },
        { status: 500 }
      );
    }

    const resend = new Resend(resendKey);

    // Convert markdown to HTML (basic conversion)
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

    await resend.emails.send({
      from: 'Prospect Intel <noreply@leads.obieo.com>',
      to: HUNTER_EMAIL,
      subject: `Prospect Intel: ${safeCompany}`,
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
                    <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${safeName}</p>
                    <a href="mailto:${safeEmail}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${safeEmail}</a>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Company</p>
                    <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${safeCompany}</p>
                    <a href="${safeWebsite}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${safeWebsite}</a>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Source</p>
                    <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${sourceLabels[safeSource] || safeSource}</p>
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

    console.log(`Email sent to ${HUNTER_EMAIL}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prospect audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
