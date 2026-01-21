#!/usr/bin/env npx tsx
/**
 * CLI script to send prospect audit reports via email
 * Uses the same Resend template as the API endpoint
 *
 * Usage:
 *   npx tsx scripts/send-audit-email.ts --company "3 Squares Roofing" --website "https://3squaresroofing.com" --report report.md
 *
 *   Or pipe markdown directly:
 *   cat report.md | npx tsx scripts/send-audit-email.ts --company "3 Squares Roofing" --website "https://3squaresroofing.com"
 *
 * Environment:
 *   RESEND_API_KEY - Required for sending emails
 */

import { Resend } from 'resend'
import { readFileSync } from 'fs'

const HUNTER_EMAIL = 'hunter@obieo.com'

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.+)$/gm, '<h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 32px 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 28px 0 12px 0;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #334155; font-size: 16px; font-weight: 600; margin: 20px 0 8px 0;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
    .replace(/^(\d+)\. (.+)$/gm, '<p style="margin: 8px 0 8px 16px;">$1. $2</p>')
    .replace(/^- (.+)$/gm, '<p style="margin: 8px 0 8px 16px;">&bull; $1</p>')
    .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
    .replace(/\n/g, '<br>')
}

function buildEmailHtml(
  company: string,
  website: string,
  reportMarkdown: string,
  source: string = 'Claude Code'
): string {
  const safeCompany = escapeHtml(company)
  const safeWebsite = escapeHtml(website)
  const htmlContent = markdownToHtml(reportMarkdown)
  const timestamp = formatDate(new Date())

  return `
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
                <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Company</p>
                <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${safeCompany}</p>
                <a href="${safeWebsite}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${safeWebsite}</a>
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
            Report generated ${timestamp}
          </p>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0; text-align: center;">
            <a href="https://obieo.com" style="color: #2563eb; text-decoration: none;">obieo.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendAuditEmail(
  company: string,
  website: string,
  reportMarkdown: string,
  source: string = 'Claude Code'
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required')
  }

  const resend = new Resend(apiKey)
  const html = buildEmailHtml(company, website, reportMarkdown, source)

  const result = await resend.emails.send({
    from: 'Prospect Intel <noreply@leads.obieo.com>',
    to: HUNTER_EMAIL,
    subject: `Prospect Intel: ${company}`,
    html,
  })

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`)
  }

  console.log(`Email sent to ${HUNTER_EMAIL}`)
  console.log(`Email ID: ${result.data?.id}`)
}

function parseArgs(args: string[]): { company: string; website: string; report?: string; source?: string } {
  const result: { company: string; website: string; report?: string; source?: string } = {
    company: '',
    website: '',
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--company':
      case '-c':
        result.company = args[++i]
        break
      case '--website':
      case '-w':
        result.website = args[++i]
        break
      case '--report':
      case '-r':
        result.report = args[++i]
        break
      case '--source':
      case '-s':
        result.source = args[++i]
        break
      case '--help':
      case '-h':
        console.log(`
Usage: npx tsx scripts/send-audit-email.ts [options]

Options:
  -c, --company <name>    Company name (required)
  -w, --website <url>     Company website URL (required)
  -r, --report <file>     Path to markdown report file (or pipe via stdin)
  -s, --source <source>   Lead source label (default: "Claude Code")
  -h, --help              Show this help message

Examples:
  npx tsx scripts/send-audit-email.ts -c "Acme Roofing" -w "https://acme.com" -r audit.md
  cat audit.md | npx tsx scripts/send-audit-email.ts -c "Acme Roofing" -w "https://acme.com"
`)
        process.exit(0)
    }
  }

  return result
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = ''

    if (process.stdin.isTTY) {
      resolve('')
      return
    }

    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      data += chunk
    })
    process.stdin.on('end', () => {
      resolve(data)
    })
  })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.company || !args.website) {
    console.error('Error: --company and --website are required')
    console.error('Run with --help for usage information')
    process.exit(1)
  }

  let reportMarkdown: string

  if (args.report) {
    reportMarkdown = readFileSync(args.report, 'utf8')
  } else {
    reportMarkdown = await readStdin()
    if (!reportMarkdown) {
      console.error('Error: No report provided. Use --report <file> or pipe markdown via stdin')
      process.exit(1)
    }
  }

  try {
    await sendAuditEmail(args.company, args.website, reportMarkdown, args.source)
    console.log('Audit report sent successfully!')
  } catch (error) {
    console.error('Error sending email:', error)
    process.exit(1)
  }
}

main()
