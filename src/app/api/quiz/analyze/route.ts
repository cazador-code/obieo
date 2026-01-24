import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  TechnicalAnalysis,
  ContentAnalysis,
  AIVisibilityAnalysis,
  QuizAnalysisResult,
  AnalysisIssue,
  AnalyzeAPIResponse,
} from '@/components/quiz/types'

const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

/**
 * POST /api/quiz/analyze
 * Runs comprehensive website analysis including:
 * 1. PageSpeed Insights (technical performance)
 * 2. HTML content analysis (SEO factors)
 * 3. AI visibility check (would this site be cited by AI?)
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeAPIResponse>> {
  try {
    const { websiteUrl, targetKeyword, businessName, city } = await request.json()

    if (!websiteUrl || !targetKeyword || !businessName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate URL
    let url: URL
    try {
      url = new URL(websiteUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid website URL' },
        { status: 400 }
      )
    }

    // Run all analyses in parallel
    const [technicalResult, contentResult, aiVisibilityResult] = await Promise.all([
      analyzeTechnical(url.toString()),
      analyzeContent(url.toString()),
      analyzeAIVisibility(businessName, targetKeyword, city, url.toString()),
    ])

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (technicalResult.performanceScore * 0.25) +
      (technicalResult.seoScore * 0.25) +
      (aiVisibilityResult.aiReadinessScore * 0.5) // AI readiness weighted highest
    )

    // Compile issues
    const issues = compileIssues(technicalResult, contentResult, aiVisibilityResult)

    const result: QuizAnalysisResult = {
      technical: technicalResult,
      content: contentResult,
      aiVisibility: aiVisibilityResult,
      overallScore,
      analyzedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      analysis: result,
      issues,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * Analyze technical performance using PageSpeed Insights API
 */
async function analyzeTechnical(url: string): Promise<TechnicalAnalysis> {
  const defaultResult: TechnicalAnalysis = {
    performanceScore: 50,
    seoScore: 50,
    accessibilityScore: 50,
    bestPracticesScore: 50,
    coreWebVitals: { lcp: 3000, cls: 0.15, inp: 300 },
    loadTime: 3.5,
    mobileOptimized: true,
  }

  try {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
    apiUrl.searchParams.set('url', url)
    apiUrl.searchParams.set('category', 'performance')
    apiUrl.searchParams.set('category', 'seo')
    apiUrl.searchParams.set('category', 'accessibility')
    apiUrl.searchParams.set('category', 'best-practices')
    apiUrl.searchParams.set('strategy', 'mobile')
    if (PAGESPEED_API_KEY) {
      apiUrl.searchParams.set('key', PAGESPEED_API_KEY)
    }

    const response = await fetch(apiUrl.toString(), {
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      console.error('PageSpeed API error:', response.status)
      return defaultResult
    }

    const data = await response.json()
    const lighthouse = data.lighthouseResult

    if (!lighthouse) {
      return defaultResult
    }

    // Extract scores (multiply by 100 as they come as 0-1)
    const performanceScore = Math.round((lighthouse.categories?.performance?.score || 0.5) * 100)
    const seoScore = Math.round((lighthouse.categories?.seo?.score || 0.5) * 100)
    const accessibilityScore = Math.round((lighthouse.categories?.accessibility?.score || 0.5) * 100)
    const bestPracticesScore = Math.round((lighthouse.categories?.['best-practices']?.score || 0.5) * 100)

    // Extract Core Web Vitals
    const audits = lighthouse.audits || {}
    const lcp = audits['largest-contentful-paint']?.numericValue || 3000
    const cls = audits['cumulative-layout-shift']?.numericValue || 0.15
    const inp = audits['interaction-to-next-paint']?.numericValue ||
                audits['total-blocking-time']?.numericValue || 300

    // Mobile viewport check
    const mobileOptimized = audits['viewport']?.score === 1

    // Load time from speed index
    const loadTime = (audits['speed-index']?.numericValue || 3500) / 1000

    return {
      performanceScore,
      seoScore,
      accessibilityScore,
      bestPracticesScore,
      coreWebVitals: {
        lcp: Math.round(lcp),
        cls: Math.round(cls * 1000) / 1000, // 3 decimal places
        inp: Math.round(inp),
      },
      loadTime: Math.round(loadTime * 10) / 10, // 1 decimal place
      mobileOptimized,
    }
  } catch (error) {
    console.error('Technical analysis error:', error)
    return defaultResult
  }
}

/**
 * Analyze HTML content for SEO factors
 */
async function analyzeContent(url: string): Promise<ContentAnalysis> {
  const defaultResult: ContentAnalysis = {
    hasTitle: false,
    titleLength: 0,
    hasMetaDescription: false,
    metaDescriptionLength: 0,
    hasH1: false,
    hasSchema: false,
    schemaTypes: [],
    hasFAQSchema: false,
    hasLocalBusinessSchema: false,
    robotsTxtAllowsAI: true,
  }

  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ObieoBot/1.0; +https://obieo.com)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return defaultResult
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const titleContent = titleMatch?.[1]?.trim() || ''

    // Extract meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
    const metaDescriptionContent = metaDescMatch?.[1]?.trim() || ''

    // Extract H1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const h1Content = h1Match?.[1]?.trim() || ''

    // Check for schema/JSON-LD
    const schemaMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    const schemaTypes: string[] = []
    let hasFAQSchema = false
    let hasLocalBusinessSchema = false

    for (const match of schemaMatches) {
      try {
        const jsonLd = JSON.parse(match[1])
        const types = Array.isArray(jsonLd['@type']) ? jsonLd['@type'] : [jsonLd['@type']]
        types.forEach((t: string) => {
          if (t && !schemaTypes.includes(t)) {
            schemaTypes.push(t)
          }
          if (t === 'FAQPage') hasFAQSchema = true
          if (t === 'LocalBusiness' || t?.includes('LocalBusiness')) hasLocalBusinessSchema = true
        })
      } catch {
        // Invalid JSON-LD, skip
      }
    }

    // Check robots.txt for AI bot blocking
    let robotsTxtAllowsAI = true
    try {
      const robotsUrl = new URL('/robots.txt', url)
      const robotsResponse = await fetch(robotsUrl.toString(), {
        signal: AbortSignal.timeout(5000),
      })
      if (robotsResponse.ok) {
        const robotsTxt = await robotsResponse.text().then(t => t.toLowerCase())
        // Check for common AI bot blocks
        const aiBlockPatterns = ['gptbot', 'claudebot', 'anthropic', 'chatgpt', 'ccbot']
        robotsTxtAllowsAI = !aiBlockPatterns.some(bot =>
          robotsTxt.includes(`user-agent: ${bot}`) && robotsTxt.includes('disallow: /')
        )
      }
    } catch {
      // Can't fetch robots.txt, assume allowed
    }

    return {
      hasTitle: titleContent.length > 0,
      titleLength: titleContent.length,
      titleContent: titleContent.substring(0, 100),
      hasMetaDescription: metaDescriptionContent.length > 0,
      metaDescriptionLength: metaDescriptionContent.length,
      metaDescriptionContent: metaDescriptionContent.substring(0, 200),
      hasH1: h1Content.length > 0,
      h1Content: h1Content.substring(0, 100),
      hasSchema: schemaTypes.length > 0,
      schemaTypes,
      hasFAQSchema,
      hasLocalBusinessSchema,
      robotsTxtAllowsAI,
    }
  } catch (error) {
    console.error('Content analysis error:', error)
    return defaultResult
  }
}

/**
 * Analyze AI visibility - would this business be cited by AI search?
 */
async function analyzeAIVisibility(
  businessName: string,
  keyword: string,
  city: string,
  websiteUrl: string
): Promise<AIVisibilityAnalysis> {
  const defaultResult: AIVisibilityAnalysis = {
    keyword,
    wasCited: false,
    competitors: [],
    whyNotCited: ['Unable to complete AI visibility analysis'],
    recommendations: ['Ensure your website is accessible'],
    aiReadinessScore: 30,
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured')
    return defaultResult
  }

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const prompt = `You are analyzing AI search visibility for a local home service business.

Business: "${businessName}"
Location: ${city || 'Unknown'}
Website: ${websiteUrl}
Target Search Keyword: "${keyword}"

Your task: Simulate what AI search engines (ChatGPT, Perplexity, Claude) would likely return if a user searched for "${keyword}".

Based on your knowledge of the home services industry and how AI systems cite sources:

1. Would "${businessName}" likely be mentioned/cited in an AI response for this keyword? Consider:
   - Is this a well-known business with strong online presence?
   - Do they have reviews, citations, and authority signals?
   - Is their content structured for AI consumption (FAQs, clear services, schema)?

2. Who ARE the likely competitors that WOULD be cited instead? List 3-5 businesses/types that typically appear in AI responses for this type of search.

3. Why might this business NOT be cited? Be specific about content/authority gaps.

4. What 3 specific recommendations would help this business get cited by AI?

5. Rate their AI readiness on a scale of 0-100 based on typical local business standards.

Respond in this exact JSON format:
{
  "wasCited": false,
  "citationContext": "When users search for [keyword], AI typically recommends...",
  "competitors": [
    {"name": "Example Competitor Type", "reason": "Strong Google reviews and FAQ content", "website": ""},
    {"name": "Another Competitor", "reason": "Comprehensive service pages with pricing", "website": ""}
  ],
  "whyNotCited": [
    "Specific reason 1",
    "Specific reason 2"
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "aiReadinessScore": 35
}

Be realistic and specific. Most local businesses score between 20-50. Only well-optimized businesses with strong content, reviews, and schema score above 70.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract JSON from response
    const textBlock = response.content.find(c => c.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return defaultResult
    }

    // Parse JSON from response (might be wrapped in markdown code blocks)
    let jsonStr = textBlock.text
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const analysis = JSON.parse(jsonStr)

    return {
      keyword,
      wasCited: analysis.wasCited || false,
      citationContext: analysis.citationContext || '',
      competitors: analysis.competitors || [],
      whyNotCited: analysis.whyNotCited || [],
      recommendations: analysis.recommendations || [],
      aiReadinessScore: Math.min(100, Math.max(0, analysis.aiReadinessScore || 30)),
    }
  } catch (error) {
    console.error('AI visibility analysis error:', error)
    return defaultResult
  }
}

/**
 * Compile all issues found during analysis
 */
function compileIssues(
  technical: TechnicalAnalysis,
  content: ContentAnalysis,
  aiVisibility: AIVisibilityAnalysis
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = []

  // Technical issues
  if (technical.performanceScore < 50) {
    issues.push({
      severity: 'critical',
      category: 'technical',
      title: 'Poor Performance Score',
      description: `Your site scored ${technical.performanceScore}/100 on performance.`,
      impact: 'Slow sites lose visitors and rank lower in search results.',
    })
  }

  if (technical.loadTime > 3) {
    issues.push({
      severity: 'critical',
      category: 'technical',
      title: 'Slow Load Time',
      description: `Your site takes ${technical.loadTime}s to load (should be under 2.5s).`,
      impact: '53% of visitors leave if a page takes longer than 3 seconds to load.',
    })
  }

  if (technical.coreWebVitals.lcp > 2500) {
    issues.push({
      severity: 'warning',
      category: 'technical',
      title: 'Largest Contentful Paint Too Slow',
      description: `LCP is ${(technical.coreWebVitals.lcp / 1000).toFixed(1)}s (should be under 2.5s).`,
      impact: 'This affects your Google Core Web Vitals score.',
    })
  }

  // Content issues
  if (!content.hasTitle) {
    issues.push({
      severity: 'critical',
      category: 'content',
      title: 'Missing Page Title',
      description: 'Your homepage has no title tag.',
      impact: 'Title tags are crucial for SEO and click-through rates.',
    })
  } else if (content.titleLength < 30 || content.titleLength > 60) {
    issues.push({
      severity: 'warning',
      category: 'content',
      title: 'Title Length Not Optimal',
      description: `Title is ${content.titleLength} characters (optimal: 30-60).`,
      impact: 'Titles may be truncated in search results.',
    })
  }

  if (!content.hasMetaDescription) {
    issues.push({
      severity: 'critical',
      category: 'content',
      title: 'Missing Meta Description',
      description: 'Your homepage has no meta description.',
      impact: 'Google will auto-generate one, which may not represent your business well.',
    })
  } else if (content.metaDescriptionLength < 120 || content.metaDescriptionLength > 160) {
    issues.push({
      severity: 'warning',
      category: 'content',
      title: 'Meta Description Length Not Optimal',
      description: `Description is ${content.metaDescriptionLength} characters (optimal: 120-160).`,
      impact: 'May be truncated or not fully utilize available space.',
    })
  }

  if (!content.hasH1) {
    issues.push({
      severity: 'warning',
      category: 'content',
      title: 'Missing H1 Tag',
      description: 'Your homepage has no H1 heading.',
      impact: 'H1 tags help search engines understand your page topic.',
    })
  }

  // AI readiness issues
  if (!content.hasSchema) {
    issues.push({
      severity: 'critical',
      category: 'ai-readiness',
      title: 'No Structured Data',
      description: 'Your site has no schema markup (JSON-LD).',
      impact: 'AI systems rely on structured data to understand and cite businesses.',
    })
  }

  if (!content.hasLocalBusinessSchema) {
    issues.push({
      severity: 'critical',
      category: 'ai-readiness',
      title: 'Missing LocalBusiness Schema',
      description: 'No LocalBusiness schema markup found.',
      impact: 'Critical for local SEO and AI visibility for service businesses.',
    })
  }

  if (!content.hasFAQSchema) {
    issues.push({
      severity: 'warning',
      category: 'ai-readiness',
      title: 'No FAQ Schema',
      description: 'No FAQPage schema markup found.',
      impact: 'FAQ content with schema is highly favored by AI search systems.',
    })
  }

  if (!content.robotsTxtAllowsAI) {
    issues.push({
      severity: 'critical',
      category: 'ai-readiness',
      title: 'AI Bots Blocked',
      description: 'Your robots.txt blocks AI crawlers (GPTBot, ClaudeBot, etc.).',
      impact: 'AI systems cannot index your content and will never cite you.',
    })
  }

  if (!aiVisibility.wasCited) {
    issues.push({
      severity: 'critical',
      category: 'ai-readiness',
      title: 'Not Appearing in AI Search',
      description: `"${aiVisibility.keyword}" searches likely won't mention your business.`,
      impact: 'You\'re invisible to the growing number of users who search via AI.',
    })
  }

  return issues
}
