#!/usr/bin/env node
import { Resend } from 'resend';
import { readFileSync } from 'fs';

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    let value = valueParts.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key.trim()] = value;
  }
});

const HUNTER_EMAIL = 'hunter@obieo.com';

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

async function sendAuditEmail(leadInfo, reportContent) {
  const { name, email, company, website, source } = leadInfo;

  console.log(`Sending audit email for ${company}...`);

  const resend = new Resend(process.env.RESEND_API_KEY);

  const htmlContent = reportContent
    .replace(/^# (.+)$/gm, '<h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 32px 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 28px 0 12px 0;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #334155; font-size: 16px; font-weight: 600; margin: 20px 0 8px 0;">$3</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      return `<tr>${cells.map(c => `<td style="padding: 8px; border: 1px solid #e2e8f0;">${c}</td>`).join('')}</tr>`;
    })
    .replace(/^(\d+)\. (.+)$/gm, '<p style="margin: 8px 0 8px 16px;">$1. $2</p>')
    .replace(/^- (.+)$/gm, '<p style="margin: 8px 0 8px 16px;">&bull; $1</p>')
    .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
    .replace(/\n/g, '<br>');

  const timestamp = new Date().toISOString();

  const result = await resend.emails.send({
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

  console.log('Email sent:', result);
  return result;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-c':
      case '--company':
        parsed.company = args[++i];
        break;
      case '-w':
      case '--website':
        parsed.website = args[++i];
        break;
      case '-r':
      case '--report':
        parsed.report = args[++i];
        break;
      case '-s':
      case '--source':
        parsed.source = args[++i];
        break;
      case '-e':
      case '--email':
        parsed.email = args[++i];
        break;
      case '-n':
      case '--name':
        parsed.name = args[++i];
        break;
      case '-h':
      case '--help':
        console.log(`
Usage: node send-audit-email.mjs [options]

Options:
  -c, --company <name>    Company name (required)
  -w, --website <url>     Website URL (required)
  -r, --report <path>     Path to report markdown file (required)
  -s, --source <source>   Lead source (default: "Claude Code Audit")
  -e, --email <email>     Lead email (optional)
  -n, --name <name>       Lead name (optional, defaults to company name)
  -h, --help              Show this help message

Examples:
  node send-audit-email.mjs -c "Roof MD" -w "https://roofmd.com" -r ".claude/audit-report-roof-md.md"
  node send-audit-email.mjs -c "Acme Co" -w "https://acme.com" -r "report.md" -s "Manual Audit" -e "john@acme.com"
        `);
        process.exit(0);
    }
  }

  return parsed;
}

const args = parseArgs();

// Validate required arguments
if (!args.company || !args.website || !args.report) {
  console.error('Error: Missing required arguments. Use -h for help.');
  console.error('Required: -c <company> -w <website> -r <report>');
  process.exit(1);
}

// Read the audit report
let reportContent;
try {
  reportContent = readFileSync(args.report, 'utf-8');
} catch (err) {
  console.error(`Error: Could not read report file: ${args.report}`);
  console.error(err.message);
  process.exit(1);
}

// Build lead info with defaults
const leadInfo = {
  name: args.name || args.company,
  email: args.email || 'N/A',
  company: args.company,
  website: args.website,
  source: args.source || 'Claude Code Audit'
};

sendAuditEmail(leadInfo, reportContent).then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
