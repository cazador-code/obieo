import { Resend } from 'resend'

export interface PortalProfileChangeNotificationInput {
  portalKey: string
  actorType: 'client' | 'admin_preview'
  actorLabel: string
  changedKeys: string[]
  addedZipCodes: string[]
  removedZipCodes: string[]
  savedAt: number
}

function getRecipients(): string[] {
  const raw =
    process.env.ONBOARDING_NOTIFICATION_EMAILS ||
    process.env.LEAD_OPS_NOTIFICATION_EMAILS ||
    process.env.NOTIFICATION_EMAIL ||
    ''

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function fmtList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'none'
}

export async function sendPortalProfileChangeNotification(
  input: PortalProfileChangeNotificationInput
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@obieo.com'
  const recipients = getRecipients()

  if (!apiKey || recipients.length === 0) return

  const resend = new Resend(apiKey)
  const when = new Date(input.savedAt).toLocaleString()

  await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `Portal profile updated: ${input.portalKey}`,
    html: `
      <h2>Portal Profile Updated</h2>
      <p><strong>Portal Key:</strong> ${input.portalKey}</p>
      <p><strong>Actor Type:</strong> ${input.actorType}</p>
      <p><strong>Actor:</strong> ${input.actorLabel}</p>
      <p><strong>Changed Keys:</strong> ${fmtList(input.changedKeys)}</p>
      <p><strong>ZIP Added:</strong> ${fmtList(input.addedZipCodes)}</p>
      <p><strong>ZIP Removed:</strong> ${fmtList(input.removedZipCodes)}</p>
      <p><strong>Saved At:</strong> ${when}</p>
    `,
  })
}
