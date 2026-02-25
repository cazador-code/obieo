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

export interface PortalZipChangeRequestNotificationInput {
  portalKey: string
  actorType: 'client' | 'admin_preview'
  actorLabel: string
  requestedAddZipCodes: string[]
  requestedRemoveZipCodes: string[]
  existingTargetZipCodes?: string[]
  note?: string
  requestedAt: number
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

function optionalText(value: string | undefined): string {
  const cleaned = (value || '').trim()
  return cleaned.length > 0 ? cleaned : 'none'
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

export async function sendPortalZipChangeRequestNotification(
  input: PortalZipChangeRequestNotificationInput
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@obieo.com'
  const recipients = getRecipients()

  if (!apiKey || recipients.length === 0) return

  const resend = new Resend(apiKey)
  const when = new Date(input.requestedAt).toLocaleString()

  await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `ZIP change request: ${input.portalKey}`,
    html: `
      <h2>Portal ZIP Change Request</h2>
      <p><strong>Portal Key:</strong> ${input.portalKey}</p>
      <p><strong>Actor Type:</strong> ${input.actorType}</p>
      <p><strong>Actor:</strong> ${input.actorLabel}</p>
      <p><strong>ZIP Add Requested:</strong> ${fmtList(input.requestedAddZipCodes)}</p>
      <p><strong>ZIP Remove Requested:</strong> ${fmtList(input.requestedRemoveZipCodes)}</p>
      <p><strong>Current ZIPs On File:</strong> ${fmtList(input.existingTargetZipCodes || [])}</p>
      <p><strong>Client Notes:</strong> ${optionalText(input.note)}</p>
      <p><strong>Requested At:</strong> ${when}</p>
    `,
  })
}
