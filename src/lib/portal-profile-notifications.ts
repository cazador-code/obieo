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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'none'
}

function optionalText(value: string | undefined): string {
  const cleaned = (value || '').trim()
  return cleaned.length > 0 ? cleaned : 'none'
}

function fmtListHtml(values: string[]): string {
  return escapeHtml(fmtList(values))
}

function optionalTextHtml(value: string | undefined): string {
  return escapeHtml(optionalText(value))
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

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `Portal profile updated: ${input.portalKey}`,
    html: `
      <h2>Portal Profile Updated</h2>
      <p><strong>Portal Key:</strong> ${escapeHtml(input.portalKey)}</p>
      <p><strong>Actor Type:</strong> ${escapeHtml(input.actorType)}</p>
      <p><strong>Actor:</strong> ${escapeHtml(input.actorLabel)}</p>
      <p><strong>Changed Keys:</strong> ${fmtListHtml(input.changedKeys)}</p>
      <p><strong>ZIP Added:</strong> ${fmtListHtml(input.addedZipCodes)}</p>
      <p><strong>ZIP Removed:</strong> ${fmtListHtml(input.removedZipCodes)}</p>
      <p><strong>Saved At:</strong> ${escapeHtml(when)}</p>
    `,
  })
  if (error) {
    console.error('Resend portal profile notification failed:', {
      message: error.message,
      statusCode: error.statusCode,
      name: error.name,
    })
    throw new Error(`Resend portal profile notification failed: ${error.message || 'unknown error'}`)
  }
  if (!data?.id) {
    console.warn('Portal profile notification send returned without a message id')
  }
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

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `ZIP change request: ${input.portalKey}`,
    html: `
      <h2>Portal ZIP Change Request</h2>
      <p><strong>Portal Key:</strong> ${escapeHtml(input.portalKey)}</p>
      <p><strong>Actor Type:</strong> ${escapeHtml(input.actorType)}</p>
      <p><strong>Actor:</strong> ${escapeHtml(input.actorLabel)}</p>
      <p><strong>ZIP Add Requested:</strong> ${fmtListHtml(input.requestedAddZipCodes)}</p>
      <p><strong>ZIP Remove Requested:</strong> ${fmtListHtml(input.requestedRemoveZipCodes)}</p>
      <p><strong>Current ZIPs On File:</strong> ${fmtListHtml(input.existingTargetZipCodes || [])}</p>
      <p><strong>Client Notes:</strong> ${optionalTextHtml(input.note)}</p>
      <p><strong>Requested At:</strong> ${escapeHtml(when)}</p>
    `,
  })
  if (error) {
    console.error('Resend ZIP change notification failed:', {
      message: error.message,
      statusCode: error.statusCode,
      name: error.name,
    })
    throw new Error(`Resend ZIP change notification failed: ${error.message || 'unknown error'}`)
  }
  if (!data?.id) {
    console.warn('ZIP change notification send returned without a message id')
  }
}
