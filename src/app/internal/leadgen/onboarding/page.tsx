'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BILLING_MODEL_LABELS,
  BILLING_MODEL_VALUES,
  DEFAULT_BILLING_MODEL,
  type BillingModel,
  normalizeBillingModel,
} from '@/lib/billing-models'

const STORED_AUTH_KEY = 'obieo-audit-auth'
const DRAFT_STORAGE_KEY = 'obieo-leadgen-onboarding-draft:v1'
const LAST_SUBMISSION_STORAGE_KEY = 'obieo-leadgen-onboarding-last-submission:v1'

const STEP_LABELS = [
  'Account & Business',
  'Notification Preferences',
  'Targeting Setup',
  'Lead Preferences',
  'Review & Submit',
] as const

const SERVICE_TYPES = [
  'Roofing',
  'HVAC',
  'Solar',
  'Plumbing',
  'Electrical',
  'Flooring',
  'Windows & Doors',
  'Landscaping',
  'Kitchen Remodeling',
  'Bathroom Remodeling',
  'Painting',
] as const

type FieldErrors = Record<string, string>

interface IntakeFormData {
  accountFirstName: string
  accountLastName: string
  accountLoginEmail: string
  companyName: string
  businessPhone: string
  businessAddress: string

  leadNotificationPhone: string
  leadNotificationEmail: string
  leadProspectEmail: string
  leadRoutingPhones: string[]
  leadRoutingEmails: string[]

  serviceAreas: string[]
  targetZipCodes: string[]

  desiredLeadVolumeDaily: number
  serviceTypes: string[]
  operatingHoursStart: string
  operatingHoursEnd: string

  billingModel: BillingModel
  leadChargeThreshold: number
  leadUnitPriceDollars: number

  notes: string
}

const INITIAL_FORM: IntakeFormData = {
  accountFirstName: '',
  accountLastName: '',
  accountLoginEmail: '',
  companyName: '',
  businessPhone: '',
  businessAddress: '',

  leadNotificationPhone: '',
  leadNotificationEmail: '',
  leadProspectEmail: '',
  leadRoutingPhones: [],
  leadRoutingEmails: [],

  serviceAreas: [],
  targetZipCodes: [],

  desiredLeadVolumeDaily: 6,
  serviceTypes: ['Roofing'],
  operatingHoursStart: '09:00',
  operatingHoursEnd: '17:00',

  billingModel: DEFAULT_BILLING_MODEL,
  leadChargeThreshold: 10,
  leadUnitPriceDollars: 40,

  notes: '',
}

function cleanString(value: string): string {
  return value.trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function isLikelyPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10
}

function toPortalKeyBase(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function safeReadDraft(): unknown | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function safeWriteDraft(payload: unknown) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore (private mode / storage quota / blocked)
  }
}

function safeClearDraft() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch {
    // ignore
  }
}

function safeReadLastSubmission(): unknown | null {
  try {
    const raw = localStorage.getItem(LAST_SUBMISSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function safeWriteLastSubmission(payload: unknown) {
  try {
    localStorage.setItem(LAST_SUBMISSION_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

function safeClearLastSubmission() {
  try {
    localStorage.removeItem(LAST_SUBMISSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

type LastSubmissionSnapshot = {
  savedAt: number
  portalKey: string | null
  stripeStatus: 'provisioned' | 'failed' | 'skipped'
  stripeMessage: string
  stripeCheckoutUrl: string | null
  companyName?: string | null
  billingEmail?: string | null
  billingName?: string | null
  billingModel?: BillingModel | null
  leadChargeThreshold?: number | null
  leadUnitPriceCents?: number | null
}

function parseLastSubmissionSnapshot(value: unknown): LastSubmissionSnapshot | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>

  const stripeMessage = typeof data.stripeMessage === 'string' ? data.stripeMessage : null
  const stripeStatus = typeof data.stripeStatus === 'string' ? data.stripeStatus : null
  if (!stripeMessage || !stripeStatus) return null

  const parsedStatus =
    stripeStatus === 'provisioned' || stripeStatus === 'failed' || stripeStatus === 'skipped'
      ? stripeStatus
      : null
  if (!parsedStatus) return null

  const savedAt = typeof data.savedAt === 'number' && Number.isFinite(data.savedAt) ? data.savedAt : Date.now()
  const portalKey = typeof data.portalKey === 'string' ? data.portalKey : null
  const stripeCheckoutUrl = typeof data.stripeCheckoutUrl === 'string' ? data.stripeCheckoutUrl : null

  return {
    savedAt,
    portalKey,
    stripeStatus: parsedStatus,
    stripeMessage,
    stripeCheckoutUrl,
    companyName: typeof data.companyName === 'string' ? data.companyName : null,
    billingEmail: typeof data.billingEmail === 'string' ? data.billingEmail : null,
    billingName: typeof data.billingName === 'string' ? data.billingName : null,
    billingModel: normalizeBillingModel(data.billingModel),
    leadChargeThreshold:
      typeof data.leadChargeThreshold === 'number' && Number.isFinite(data.leadChargeThreshold)
        ? Math.floor(data.leadChargeThreshold)
        : null,
    leadUnitPriceCents:
      typeof data.leadUnitPriceCents === 'number' && Number.isFinite(data.leadUnitPriceCents)
        ? Math.round(data.leadUnitPriceCents)
        : null,
  }
}

export default function LeadGenOnboardingPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null)

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState<IntakeFormData>(INITIAL_FORM)
  const [draftReady, setDraftReady] = useState(false)

  const [zipInput, setZipInput] = useState('')
  const [serviceAreaInput, setServiceAreaInput] = useState('')
  const [routePhoneInput, setRoutePhoneInput] = useState('')
  const [routeEmailInput, setRouteEmailInput] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [lastPortalKey, setLastPortalKey] = useState<string | null>(null)
  const [lastSubmissionReady, setLastSubmissionReady] = useState(false)
  const [lastSubmissionSnapshot, setLastSubmissionSnapshot] = useState<LastSubmissionSnapshot | null>(null)
  const [suppressAutoRestoreLastSubmission, setSuppressAutoRestoreLastSubmission] = useState(false)
  const [submitMeta, setSubmitMeta] = useState<{
    stripeStatus: 'provisioned' | 'failed' | 'skipped'
    stripeMessage: string
    stripeCheckoutUrl?: string
  } | null>(null)
  const [activationStatus, setActivationStatus] = useState<{
    status: 'idle' | 'running' | 'activated' | 'skipped' | 'failed'
    message?: string
  }>({ status: 'idle' })
  const [paidSessionId, setPaidSessionId] = useState<string | null>(null)

  function formatCents(amountCents?: number): string | null {
    if (typeof amountCents !== 'number' || !Number.isFinite(amountCents)) return null
    return `$${(amountCents / 100).toFixed(2)}`
  }

  async function regenerateCheckout() {
    const authToken = localStorage.getItem(STORED_AUTH_KEY)
    if (!authToken) {
      setSubmitError('Session expired. Refresh and authenticate again.')
      return
    }

    const fallbackCompanyName =
      typeof lastSubmissionSnapshot?.companyName === 'string' ? cleanString(lastSubmissionSnapshot.companyName) : null
    const fallbackBillingEmail = lastSubmissionSnapshot?.billingEmail
      ? cleanString(lastSubmissionSnapshot.billingEmail).toLowerCase()
      : null
    const fallbackBillingName =
      typeof lastSubmissionSnapshot?.billingName === 'string' ? cleanString(lastSubmissionSnapshot.billingName) : null

    const companyName = cleanString(form.companyName) || fallbackCompanyName
    const rawBillingEmail = cleanString(form.accountLoginEmail)
    const billingEmail = (rawBillingEmail ? rawBillingEmail.toLowerCase() : null) || fallbackBillingEmail
    if (!companyName || !billingEmail || !isValidEmail(billingEmail)) {
      setSubmitError('Missing company name or billing email. Go back and verify Step 1.')
      return
    }

    setSubmitError(null)

    try {
      const portalKeyCandidate =
        lastPortalKey || lastSubmissionSnapshot?.portalKey || toPortalKeyBase(companyName) || 'client'
      const billingNameCandidate =
        `${cleanString(form.accountFirstName)} ${cleanString(form.accountLastName)}`.trim() || fallbackBillingName || undefined
      const billingModelCandidate = form.billingModel || lastSubmissionSnapshot?.billingModel || DEFAULT_BILLING_MODEL
      const thresholdCandidate =
        typeof form.leadChargeThreshold === 'number' && Number.isFinite(form.leadChargeThreshold)
          ? form.leadChargeThreshold
          : lastSubmissionSnapshot?.leadChargeThreshold || 10
      const unitPriceCentsCandidate =
        typeof form.leadUnitPriceDollars === 'number' && Number.isFinite(form.leadUnitPriceDollars)
          ? Math.round(form.leadUnitPriceDollars * 100)
          : lastSubmissionSnapshot?.leadUnitPriceCents || 4000

      const response = await fetch('/api/internal/leadgen/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          portalKey: portalKeyCandidate,
          companyName,
          billingEmail,
          billingName: billingNameCandidate,
          billingModel: billingModelCandidate,
          leadChargeThreshold: thresholdCandidate,
          leadUnitPriceCents: unitPriceCentsCandidate,
        }),
      })

      const payload = await parseJsonResponse<{
        success?: boolean
        error?: string
        initialCheckoutUrl?: string
        initialCheckoutAmountCents?: number
      }>(response)

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || `Failed to regenerate checkout (HTTP ${response.status})`)
      }

      const initialChargeLabel = formatCents(payload.initialCheckoutAmountCents)
      setSubmitMeta({
        stripeStatus: 'provisioned',
        stripeMessage: `Stripe ready. Initial charge checkout is prepared${initialChargeLabel ? ` (${initialChargeLabel})` : ''}.`,
        stripeCheckoutUrl: payload.initialCheckoutUrl,
      })

      // Keep last-submission snapshot fresh so you can always regenerate checkout later,
      // even if the form gets cleared.
      const nextSnapshot: LastSubmissionSnapshot = {
        savedAt: Date.now(),
        portalKey: portalKeyCandidate,
        stripeStatus: 'provisioned',
        stripeMessage: `Stripe ready. Initial charge checkout is prepared${initialChargeLabel ? ` (${initialChargeLabel})` : ''}.`,
        stripeCheckoutUrl: payload.initialCheckoutUrl || null,
        companyName,
        billingEmail,
        billingName: billingNameCandidate || null,
        billingModel: billingModelCandidate,
        leadChargeThreshold: thresholdCandidate,
        leadUnitPriceCents: unitPriceCentsCandidate,
      }
      setLastSubmissionSnapshot(nextSnapshot)
      safeWriteLastSubmission(nextSnapshot)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to regenerate checkout')
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(STORED_AUTH_KEY)
    if (!token) {
      setCheckingAuth(false)
      setDraftReady(true)
      return
    }

    fetch('/api/internal/verify-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data: { valid?: boolean }) => {
        if (data.valid) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem(STORED_AUTH_KEY)
        }
      })
      .catch(() => {
        localStorage.removeItem(STORED_AUTH_KEY)
      })
      .finally(() => {
        setCheckingAuth(false)
        setDraftReady(true)
        setLastSubmissionReady(true)
      })
  }, [])

  // If Stripe redirected back with a Checkout session id, capture it for "Finalize activation" fallback.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const sessionId = params.get('session_id')
    if (payment === 'success' && sessionId) {
      setPaidSessionId(sessionId)
    }
  }, [])

  async function finalizeActivation() {
    const authToken = localStorage.getItem(STORED_AUTH_KEY)
    if (!authToken) {
      setActivationStatus({
        status: 'failed',
        message: 'Session expired. Refresh and authenticate again.',
      })
      return
    }

    if (!paidSessionId) {
      setActivationStatus({
        status: 'failed',
        message: 'Missing Stripe session id from redirect.',
      })
      return
    }

    setActivationStatus({ status: 'running' })
    try {
      const response = await fetch('/api/internal/leadgen/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ sessionId: paidSessionId }),
      })

      const payload = await parseJsonResponse<{
        success?: boolean
        error?: string
        activation?: { status?: string; reason?: string; loginUrl?: string; invitationId?: string }
      }>(response)

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || `Activation failed (HTTP ${response.status})`)
      }

      const activation = payload.activation
      if (activation?.status === 'activated') {
        setActivationStatus({
          status: 'activated',
          message: `Activation triggered. Clerk invitation sent${activation.invitationId ? ` (${activation.invitationId})` : ''}.`,
        })
      } else {
        setActivationStatus({
          status: 'skipped',
          message: activation?.reason || 'Activation skipped (invite may already have been sent).',
        })
      }
    } catch (error) {
      setActivationStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Activation failed',
      })
    }
  }

  // Load (and keep) a parsed last-submission snapshot. We use this for:
  // 1) auto-restore on refresh, and 2) "Resume last submission" UI when starting a new intake.
  useEffect(() => {
    if (!lastSubmissionReady) return
    if (!isAuthenticated) return

    const stored = safeReadLastSubmission()
    const snapshot = parseLastSubmissionSnapshot(stored)
    setLastSubmissionSnapshot(snapshot)
  }, [lastSubmissionReady, isAuthenticated])

  // Restore last successful submission (so a refresh doesn't force re-intake).
  useEffect(() => {
    if (!lastSubmissionReady) return
    if (!isAuthenticated) return
    if (submitted) return
    if (suppressAutoRestoreLastSubmission) return

    const snapshot = lastSubmissionSnapshot
    if (!snapshot) return
    if (!snapshot.stripeCheckoutUrl || !snapshot.stripeMessage || !snapshot.stripeStatus) return

    setSubmitMeta({
      stripeStatus: snapshot.stripeStatus,
      stripeMessage: snapshot.stripeMessage,
      stripeCheckoutUrl: snapshot.stripeCheckoutUrl,
    })
    setLastPortalKey(snapshot.portalKey)
    setSubmitted(true)
  }, [lastSubmissionReady, isAuthenticated, submitted, suppressAutoRestoreLastSubmission, lastSubmissionSnapshot])

  // Restore draft once we know whether auth is valid.
  useEffect(() => {
    if (!draftReady) return
    if (!isAuthenticated) return

    const draft = safeReadDraft()
    if (!draft || typeof draft !== 'object') return

    const anyDraft = draft as Record<string, unknown>
    const draftForm = anyDraft.form
    const draftStep = anyDraft.step

    if (draftForm && typeof draftForm === 'object') {
      setForm((prev) => ({ ...prev, ...(draftForm as Partial<IntakeFormData>) }))
    }

    if (typeof draftStep === 'number' && Number.isFinite(draftStep)) {
      const next = Math.max(0, Math.min(STEP_LABELS.length - 1, Math.floor(draftStep)))
      setStep(next)
    }
  }, [draftReady, isAuthenticated])

  // Persist draft (debounced) while authenticated.
  useEffect(() => {
    if (!draftReady) return
    if (!isAuthenticated) return
    if (submitted) return

    const handle = window.setTimeout(() => {
      safeWriteDraft({
        savedAt: Date.now(),
        step,
        form,
      })
    }, 250)

    return () => window.clearTimeout(handle)
  }, [draftReady, isAuthenticated, submitted, step, form])

  const progress = useMemo(() => ((step + 1) / STEP_LABELS.length) * 100, [step])

  function setField<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  function addZip() {
    const candidate = zipInput.trim()
    if (form.targetZipCodes.length >= 10) {
      setErrors((prev) => ({ ...prev, targetZipCodes: 'Maximum 10 ZIP codes allowed' }))
      return
    }
    if (!/^\d{5}$/.test(candidate)) {
      setErrors((prev) => ({ ...prev, targetZipCodes: 'ZIP must be 5 digits' }))
      return
    }
    if (form.targetZipCodes.includes(candidate)) {
      setZipInput('')
      return
    }
    setField('targetZipCodes', [...form.targetZipCodes, candidate])
    setZipInput('')
  }

  function removeZip(zip: string) {
    setField(
      'targetZipCodes',
      form.targetZipCodes.filter((z) => z !== zip)
    )
  }

  function addServiceArea() {
    const area = cleanString(serviceAreaInput)
    if (!area) return
    if (form.serviceAreas.includes(area)) {
      setServiceAreaInput('')
      return
    }
    setField('serviceAreas', [...form.serviceAreas, area])
    setServiceAreaInput('')
  }

  function removeServiceArea(area: string) {
    setField(
      'serviceAreas',
      form.serviceAreas.filter((entry) => entry !== area)
    )
  }

  function addRoutePhone() {
    const value = normalizePhone(routePhoneInput)
    if (!isLikelyPhone(value)) {
      setErrors((prev) => ({ ...prev, leadRoutingPhones: 'Enter a valid phone number' }))
      return
    }
    if (form.leadRoutingPhones.includes(value)) {
      setRoutePhoneInput('')
      return
    }
    setField('leadRoutingPhones', [...form.leadRoutingPhones, value])
    setRoutePhoneInput('')
  }

  function removeRoutePhone(phone: string) {
    setField(
      'leadRoutingPhones',
      form.leadRoutingPhones.filter((entry) => entry !== phone)
    )
  }

  function addRouteEmail() {
    const value = cleanString(routeEmailInput).toLowerCase()
    if (!isValidEmail(value)) {
      setErrors((prev) => ({ ...prev, leadRoutingEmails: 'Enter a valid email address' }))
      return
    }
    if (form.leadRoutingEmails.includes(value)) {
      setRouteEmailInput('')
      return
    }
    setField('leadRoutingEmails', [...form.leadRoutingEmails, value])
    setRouteEmailInput('')
  }

  function removeRouteEmail(email: string) {
    setField(
      'leadRoutingEmails',
      form.leadRoutingEmails.filter((entry) => entry !== email)
    )
  }

  function toggleServiceType(service: string) {
    const exists = form.serviceTypes.includes(service)
    if (exists) {
      setField(
        'serviceTypes',
        form.serviceTypes.filter((entry) => entry !== service)
      )
      return
    }
    setField('serviceTypes', [...form.serviceTypes, service])
  }

  function applyBillingModel(nextModel: BillingModel) {
    const threshold =
      nextModel === 'pay_per_lead_perpetual'
        ? 1
        : nextModel === 'commitment_40_with_10_upfront' || nextModel === 'package_40_paid_in_full'
          ? 10
          : 10

    setField('billingModel', nextModel)
    setField('leadChargeThreshold', threshold)
  }

  function validateStep(currentStep: number): boolean {
    const nextErrors: FieldErrors = {}

    if (currentStep === 0) {
      if (!cleanString(form.accountFirstName)) nextErrors.accountFirstName = 'First name is required'
      if (!cleanString(form.accountLastName)) nextErrors.accountLastName = 'Last name is required'
      if (!isValidEmail(form.accountLoginEmail)) nextErrors.accountLoginEmail = 'Valid login email is required'
      if (!cleanString(form.companyName)) nextErrors.companyName = 'Legal business name is required'
      if (!isLikelyPhone(form.businessPhone)) nextErrors.businessPhone = 'Valid business phone is required'
      if (!cleanString(form.businessAddress)) nextErrors.businessAddress = 'Business address is required'
    }

    if (currentStep === 1) {
      if (!isLikelyPhone(form.leadNotificationPhone)) {
        nextErrors.leadNotificationPhone = 'Valid notification phone is required'
      }
      if (!isValidEmail(form.leadNotificationEmail)) {
        nextErrors.leadNotificationEmail = 'Valid notification email is required'
      }
      if (!isValidEmail(form.leadProspectEmail)) {
        nextErrors.leadProspectEmail = 'Valid business email is required'
      }
      if (form.leadRoutingPhones.length === 0 && form.leadRoutingEmails.length === 0) {
        nextErrors.leadRoutingPhones = 'Add at least one routing phone or routing email'
      }
    }

    if (currentStep === 2) {
      if (form.targetZipCodes.length < 5) {
        nextErrors.targetZipCodes = 'Add at least 5 target ZIP codes'
      }
      if (form.serviceAreas.length === 0) {
        nextErrors.serviceAreas = 'Add at least one service area'
      }
    }

    if (currentStep === 3) {
      if (form.serviceTypes.length === 0) nextErrors.serviceTypes = 'Select at least one service type'
      if (!cleanString(form.operatingHoursStart)) nextErrors.operatingHoursStart = 'Start time is required'
      if (!cleanString(form.operatingHoursEnd)) nextErrors.operatingHoursEnd = 'End time is required'
      if (form.leadChargeThreshold < 1) nextErrors.leadChargeThreshold = 'Threshold must be at least 1'
      if (form.leadUnitPriceDollars < 1) nextErrors.leadUnitPriceDollars = 'Price per lead must be at least $1'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext() {
    if (!validateStep(step)) return
    if (step < STEP_LABELS.length - 1) {
      setStep((prev) => prev + 1)
    }
  }

  function handleBack() {
    setErrors({})
    setStep((prev) => Math.max(0, prev - 1))
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setAuthErrorMessage(null)

    try {
      const response = await fetch('/api/internal/verify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await parseJsonResponse<{ valid?: boolean; token?: string; error?: string }>(response)
      if (response.ok && data?.valid && data.token) {
        localStorage.setItem(STORED_AUTH_KEY, data.token)
        setIsAuthenticated(true)
      } else {
        const fallback =
          response.status === 429
            ? 'Too many attempts. Please wait 60 seconds and try again.'
            : response.status >= 500
              ? 'Server configuration error. Check env vars and restart the dev server.'
              : 'Incorrect password.'
        setAuthErrorMessage(data?.error || fallback)
      }
    } catch {
      setAuthErrorMessage('Unable to unlock right now. Please try again.')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    if (!validateStep(4)) return

    const authToken = localStorage.getItem(STORED_AUTH_KEY)
    if (!authToken) {
      setSubmitError('Session expired. Refresh and authenticate again.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/internal/leadgen/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          accountFirstName: cleanString(form.accountFirstName),
          accountLastName: cleanString(form.accountLastName),
          accountLoginEmail: cleanString(form.accountLoginEmail).toLowerCase(),
          businessPhone: cleanString(form.businessPhone),
          businessAddress: cleanString(form.businessAddress),
          companyName: cleanString(form.companyName),
          serviceAreas: form.serviceAreas,
          targetZipCodes: form.targetZipCodes,
          serviceTypes: form.serviceTypes,
          desiredLeadVolumeDaily: form.desiredLeadVolumeDaily,
          operatingHoursStart: form.operatingHoursStart,
          operatingHoursEnd: form.operatingHoursEnd,
          leadNotificationPhone: cleanString(form.leadNotificationPhone),
          leadNotificationEmail: cleanString(form.leadNotificationEmail).toLowerCase(),
          leadProspectEmail: cleanString(form.leadProspectEmail).toLowerCase(),
          leadRoutingPhones: form.leadRoutingPhones,
          leadRoutingEmails: form.leadRoutingEmails,
          billingContactName: `${cleanString(form.accountFirstName)} ${cleanString(form.accountLastName)}`,
          billingContactEmail: cleanString(form.accountLoginEmail).toLowerCase(),
          billingModel: form.billingModel,
          leadChargeThreshold: form.leadChargeThreshold,
          leadUnitPriceCents: Math.round(form.leadUnitPriceDollars * 100),
          notes: cleanString(form.notes) || undefined,
        }),
      })

      const payload = await parseJsonResponse<{ success?: boolean; error?: string }>(response)
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || `Failed to submit onboarding (HTTP ${response.status})`)
      }

      const typedPayload = payload as {
        portalKey?: string
        stripeProvisioning?: {
          status?: 'provisioned' | 'failed' | 'skipped'
          error?: string
          reason?: string
          details?: {
            stripeCustomerId?: string
            stripeSubscriptionId?: string
            stripeSubscriptionItemId?: string
            initialCheckoutUrl?: string
            initialCheckoutAmountCents?: number
          }
        }
      }

      const stripeStatus = typedPayload.stripeProvisioning?.status || 'skipped'
      const checkoutUrl = typedPayload.stripeProvisioning?.details?.initialCheckoutUrl
      const initialChargeLabel = formatCents(typedPayload.stripeProvisioning?.details?.initialCheckoutAmountCents)
      const stripeMessage =
        stripeStatus === 'provisioned'
          ? checkoutUrl
            ? `Stripe ready. Initial charge checkout is prepared${initialChargeLabel ? ` (${initialChargeLabel})` : ''}.`
            : `Stripe ready (customer ${typedPayload.stripeProvisioning?.details?.stripeCustomerId || 'created'}).`
          : typedPayload.stripeProvisioning?.error ||
            typedPayload.stripeProvisioning?.reason ||
            'Stripe provisioning was skipped.'

      setSubmitMeta({
        stripeStatus,
        stripeMessage,
        stripeCheckoutUrl: checkoutUrl,
      })
      setLastPortalKey(typedPayload.portalKey || null)

      setSubmitted(true)
      const nextSnapshot: LastSubmissionSnapshot = {
        savedAt: Date.now(),
        portalKey: typedPayload.portalKey || null,
        stripeStatus,
        stripeMessage,
        stripeCheckoutUrl: checkoutUrl || null,
        companyName: cleanString(form.companyName),
        billingEmail: cleanString(form.accountLoginEmail).toLowerCase(),
        billingName: `${cleanString(form.accountFirstName)} ${cleanString(form.accountLastName)}`.trim(),
        billingModel: form.billingModel,
        leadChargeThreshold: form.leadChargeThreshold,
        leadUnitPriceCents: Math.round(form.leadUnitPriceDollars * 100),
      }
      setLastSubmissionSnapshot(nextSnapshot)
      safeWriteLastSubmission(nextSnapshot)
      safeClearDraft()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/95 p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Lead Intake Access</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Internal onboarding tool for new clients.</p>
          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="Enter password"
            />
            {authErrorMessage && <p className="text-sm text-red-500">{authErrorMessage}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/95 p-8 text-center shadow-xl">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Client Onboarding Submitted</h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Company profile was saved, your team was notified, and this account is ready for campaign kickoff.
          </p>
          {submitMeta && (
            <div
              className={[
                'mt-4 rounded-xl border p-3 text-left text-sm',
                submitMeta.stripeStatus === 'provisioned'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-amber-200 bg-amber-50 text-amber-900',
              ].join(' ')}
            >
              <p>
                Stripe provisioning status: <span className="font-semibold">{submitMeta.stripeStatus}</span>
              </p>
              <p className="mt-1">{submitMeta.stripeMessage}</p>
              {submitMeta.stripeCheckoutUrl && (
                <a
                  href={submitMeta.stripeCheckoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
                >
                  Open Initial Charge Checkout
                </a>
              )}
              <button
                type="button"
                onClick={regenerateCheckout}
                className="mt-3 ml-2 inline-flex rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                Regenerate Checkout (Test)
              </button>
            </div>
          )}

          {paidSessionId && (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]/70 p-3 text-left text-sm">
              <p className="font-semibold text-[var(--text-primary)]">Payment redirect detected</p>
              <p className="mt-1 text-[var(--text-secondary)]">
                If you did not receive a Clerk invitation email, click below to finalize activation for this payment.
              </p>
              <button
                type="button"
                onClick={finalizeActivation}
                disabled={activationStatus.status === 'running'}
                className="mt-3 inline-flex rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {activationStatus.status === 'running' ? 'Finalizing...' : 'Finalize Activation'}
              </button>
              {activationStatus.status !== 'idle' && activationStatus.message && (
                <p
                  className={[
                    'mt-2 text-xs',
                    activationStatus.status === 'activated'
                      ? 'text-green-700'
                      : activationStatus.status === 'failed'
                        ? 'text-red-600'
                        : 'text-[var(--text-secondary)]',
                  ].join(' ')}
                >
                  {activationStatus.message}
                </p>
              )}
            </div>
          )}
          {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}
          <button
            onClick={() => {
              // Let you start a fresh intake without instantly snapping back to "submitted"
              // (but keep the last submission available to resume).
              setSuppressAutoRestoreLastSubmission(true)
              setSubmitted(false)
              setStep(0)
              setErrors({})
              setForm(INITIAL_FORM)
              setSubmitMeta(null)
              setSubmitError(null)
              setLastPortalKey(null)
              safeClearDraft()
            }}
            className="mt-6 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Create Another Intake
          </button>
          <button
            type="button"
            onClick={() => {
              safeClearLastSubmission()
              setLastSubmissionSnapshot(null)
              setSubmitMeta(null)
              setSubmitError(null)
              setLastPortalKey(null)
              setSubmitted(false)
              setStep(0)
              setErrors({})
              setForm(INITIAL_FORM)
            }}
            className="mt-3 text-sm text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]"
          >
            Clear Last Submission
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/90 p-4 shadow-xl md:p-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)]">Create Your Account & Start Getting Leads</h1>
          <p className="mt-3 text-[var(--text-secondary)]">Complete your profile and get started in just 3-4 minutes.</p>
        </div>

        {suppressAutoRestoreLastSubmission && lastSubmissionSnapshot && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)]/70 p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Last submission is still saved</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  You can resume it anytime (useful if you need the Stripe checkout link again).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuppressAutoRestoreLastSubmission(false)
                    const snapshot = lastSubmissionSnapshot
                    if (!snapshot?.stripeCheckoutUrl) return
                    setSubmitMeta({
                      stripeStatus: snapshot.stripeStatus,
                      stripeMessage: snapshot.stripeMessage,
                      stripeCheckoutUrl: snapshot.stripeCheckoutUrl,
                    })
                    setLastPortalKey(snapshot.portalKey)
                    setSubmitted(true)
                  }}
                  className="inline-flex rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Resume Last Submission
                </button>
                <button
                  type="button"
                  onClick={() => {
                    safeClearLastSubmission()
                    setLastSubmissionSnapshot(null)
                  }}
                  className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Clear Saved Submission
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)]/70 p-4 md:p-5">
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {STEP_LABELS.map((label, idx) => {
              const complete = idx < step
              const active = idx === step
              return (
                <div key={label} className="text-center">
                  <div
                    className={[
                      'mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold shadow-sm',
                      complete || active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]',
                    ].join(' ')}
                  >
                    {complete ? '✓' : idx + 1}
                  </div>
                  <p className="mt-2 text-xs md:text-sm text-[var(--text-secondary)]">Step {idx + 1}</p>
                  <p className="hidden text-xs text-[var(--text-muted)] md:block">{label}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-[var(--border-light)]">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-7">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Account & Business Information</h2>
              <p className="text-[var(--text-secondary)]">Create account credentials and define core company profile.</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">First Name *</label>
                  <input
                    value={form.accountFirstName}
                    onChange={(event) => setField('accountFirstName', event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                    placeholder="John"
                  />
                  {errors.accountFirstName && <p className="mt-1 text-sm text-red-500">{errors.accountFirstName}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Last Name *</label>
                  <input
                    value={form.accountLastName}
                    onChange={(event) => setField('accountLastName', event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                    placeholder="Doe"
                  />
                  {errors.accountLastName && <p className="mt-1 text-sm text-red-500">{errors.accountLastName}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Login Email *</label>
                <input
                  type="email"
                  value={form.accountLoginEmail}
                  onChange={(event) => setField('accountLoginEmail', event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  placeholder="john.doe@company.com"
                />
                {errors.accountLoginEmail && <p className="mt-1 text-sm text-red-500">{errors.accountLoginEmail}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Legal Business Name *</label>
                <input
                  value={form.companyName}
                  onChange={(event) => setField('companyName', event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  placeholder="Roofing Solutions USA"
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Business Phone *</label>
                <input
                  value={form.businessPhone}
                  onChange={(event) => setField('businessPhone', normalizePhone(event.target.value))}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  placeholder="(555) 123-4567"
                />
                {errors.businessPhone && <p className="mt-1 text-sm text-red-500">{errors.businessPhone}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Business Address *</label>
                <input
                  value={form.businessAddress}
                  onChange={(event) => setField('businessAddress', event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  placeholder="123 Main St, City, State 12345"
                />
                {errors.businessAddress && <p className="mt-1 text-sm text-red-500">{errors.businessAddress}</p>}
              </div>

            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Notification Preferences</h2>
              <p className="text-[var(--text-secondary)]">Set where leads and updates should be sent.</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">Preferred Cell for Lead Alerts *</label>
                  <input
                    value={form.leadNotificationPhone}
                    onChange={(event) => setField('leadNotificationPhone', normalizePhone(event.target.value))}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                    placeholder="(555) 123-4567"
                  />
                  {errors.leadNotificationPhone && (
                    <p className="mt-1 text-sm text-red-500">{errors.leadNotificationPhone}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Preferred Email for Lead Alerts *</label>
                  <input
                    type="email"
                    value={form.leadNotificationEmail}
                    onChange={(event) => setField('leadNotificationEmail', event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                    placeholder="alerts@company.com"
                  />
                  {errors.leadNotificationEmail && (
                    <p className="mt-1 text-sm text-red-500">{errors.leadNotificationEmail}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Business Email (for prospects) *</label>
                <input
                  type="email"
                  value={form.leadProspectEmail}
                  onChange={(event) => setField('leadProspectEmail', event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  placeholder="info@company.com"
                />
                {errors.leadProspectEmail && <p className="mt-1 text-sm text-red-500">{errors.leadProspectEmail}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">Lead Routing Phones</label>
                  <div className="flex gap-2">
                    <input
                      value={routePhoneInput}
                      onChange={(event) => setRoutePhoneInput(normalizePhone(event.target.value))}
                      className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                      placeholder="(555) 123-4567"
                    />
                    <button
                      type="button"
                      onClick={addRoutePhone}
                      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                  {errors.leadRoutingPhones && <p className="mt-1 text-sm text-red-500">{errors.leadRoutingPhones}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.leadRoutingPhones.map((phone) => (
                      <button
                        type="button"
                        key={phone}
                        onClick={() => removeRoutePhone(phone)}
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-sm"
                      >
                        {phone} ×
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">Lead Routing Emails</label>
                  <div className="flex gap-2">
                    <input
                      value={routeEmailInput}
                      onChange={(event) => setRouteEmailInput(event.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                      placeholder="ops@company.com"
                    />
                    <button
                      type="button"
                      onClick={addRouteEmail}
                      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                  {errors.leadRoutingEmails && <p className="mt-1 text-sm text-red-500">{errors.leadRoutingEmails}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.leadRoutingEmails.map((email) => (
                      <button
                        type="button"
                        key={email}
                        onClick={() => removeRouteEmail(email)}
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-sm"
                      >
                        {email} ×
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Targeting Setup</h2>
              <p className="text-[var(--text-secondary)]">Define where we should run ads and route leads.</p>

              <div>
                <label className="mb-1 block text-sm font-semibold">Target ZIP Codes (minimum 5) *</label>
                <div className="flex gap-2">
                  <input
                    value={zipInput}
                    onChange={(event) => setZipInput(event.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                    placeholder="78701"
                  />
                  <button
                    type="button"
                    onClick={addZip}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{form.targetZipCodes.length}/10 ZIP codes added</p>
                {errors.targetZipCodes && <p className="mt-1 text-sm text-red-500">{errors.targetZipCodes}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.targetZipCodes.map((zip) => (
                    <button
                      type="button"
                      key={zip}
                      onClick={() => removeZip(zip)}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-sm"
                    >
                      {zip} ×
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Service Areas *</label>
                <div className="flex gap-2">
                  <input
                    value={serviceAreaInput}
                    onChange={(event) => setServiceAreaInput(event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                    placeholder="Winter Haven"
                  />
                  <button
                    type="button"
                    onClick={addServiceArea}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
                {errors.serviceAreas && <p className="mt-1 text-sm text-red-500">{errors.serviceAreas}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.serviceAreas.map((area) => (
                    <button
                      type="button"
                      key={area}
                      onClick={() => removeServiceArea(area)}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-sm"
                    >
                      {area} ×
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Lead Preferences</h2>
              <p className="text-[var(--text-secondary)]">Tune daily volume, service mix, and operating windows.</p>

              <div>
                <label className="mb-1 block text-sm font-semibold">Desired Leads per Day</label>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={form.desiredLeadVolumeDaily}
                  onChange={(event) => setField('desiredLeadVolumeDaily', Number(event.target.value))}
                  className="w-full"
                />
                <div className="mt-1 flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>2/day</span>
                  <span className="font-semibold text-[var(--text-primary)]">{form.desiredLeadVolumeDaily} leads/day</span>
                  <span>12/day</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Service Types Offered *</label>
                <div className="grid gap-2 md:grid-cols-3">
                  {SERVICE_TYPES.map((service) => {
                    const checked = form.serviceTypes.includes(service)
                    return (
                      <button
                        type="button"
                        key={service}
                        onClick={() => toggleServiceType(service)}
                        className={[
                          'rounded-xl border px-3 py-2 text-left text-sm',
                          checked
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-[var(--border)]',
                        ].join(' ')}
                      >
                        {service}
                      </button>
                    )
                  })}
                </div>
                {errors.serviceTypes && <p className="mt-1 text-sm text-red-500">{errors.serviceTypes}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">Operating Hours Start *</label>
                  <input
                    type="time"
                    value={form.operatingHoursStart}
                    onChange={(event) => setField('operatingHoursStart', event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  />
                  {errors.operatingHoursStart && (
                    <p className="mt-1 text-sm text-red-500">{errors.operatingHoursStart}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Operating Hours End *</label>
                  <input
                    type="time"
                    value={form.operatingHoursEnd}
                    onChange={(event) => setField('operatingHoursEnd', event.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  />
                  {errors.operatingHoursEnd && <p className="mt-1 text-sm text-red-500">{errors.operatingHoursEnd}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">Billing Model *</label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {BILLING_MODEL_VALUES.map((model) => {
                      const selected = form.billingModel === model
                      return (
                        <button
                          key={model}
                          type="button"
                          onClick={() => applyBillingModel(model)}
                          className={[
                            'rounded-xl border p-3 text-left text-sm',
                            selected
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-[var(--border)] bg-[var(--bg-card)]',
                          ].join(' ')}
                        >
                          <p className="font-semibold">{BILLING_MODEL_LABELS[model]}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Price Per Lead (USD) *</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.leadUnitPriceDollars}
                    onChange={(event) => setField('leadUnitPriceDollars', Number(event.target.value))}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  />
                  {errors.leadUnitPriceDollars && (
                    <p className="mt-1 text-sm text-red-500">{errors.leadUnitPriceDollars}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Charge Threshold (leads) *</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.leadChargeThreshold}
                    onChange={(event) => setField('leadChargeThreshold', Number(event.target.value))}
                    disabled={form.billingModel === 'pay_per_lead_perpetual'}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3 disabled:cursor-not-allowed disabled:bg-[var(--bg-secondary)]"
                  />
                  {form.billingModel === 'pay_per_lead_perpetual' && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Threshold is locked to 1 lead for true pay-per-lead billing.
                    </p>
                  )}
                  {errors.leadChargeThreshold && (
                    <p className="mt-1 text-sm text-red-500">{errors.leadChargeThreshold}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Review & Submit</h2>
              <p className="text-[var(--text-secondary)]">Confirm details before account provisioning.</p>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <h3 className="font-semibold">Account Information</h3>
                  <p className="mt-2 text-sm">Name: {form.accountFirstName} {form.accountLastName}</p>
                  <p className="text-sm">Login: {form.accountLoginEmail}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <h3 className="font-semibold">Business Information</h3>
                  <p className="mt-2 text-sm">Company: {form.companyName}</p>
                  <p className="text-sm">Phone: {form.businessPhone}</p>
                  <p className="text-sm">Address: {form.businessAddress}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <h3 className="font-semibold">Contact Preferences</h3>
                  <p className="mt-2 text-sm">Lead Phone: {form.leadNotificationPhone}</p>
                  <p className="text-sm">Lead Email: {form.leadNotificationEmail}</p>
                  <p className="text-sm">Prospect Email: {form.leadProspectEmail}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <h3 className="font-semibold">Target Areas</h3>
                  <p className="mt-2 text-sm">ZIPs: {form.targetZipCodes.join(', ')}</p>
                  <p className="text-sm">Service Areas: {form.serviceAreas.join(', ')}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <h3 className="font-semibold">Lead Settings</h3>
                <p className="mt-2 text-sm">Volume: {form.desiredLeadVolumeDaily} leads/day</p>
                <p className="text-sm">Hours: {form.operatingHoursStart} - {form.operatingHoursEnd}</p>
                <p className="text-sm">Services: {form.serviceTypes.join(', ')}</p>
                <p className="text-sm">Billing: {BILLING_MODEL_LABELS[form.billingModel]}</p>
                <p className="text-sm">Price/Lead: ${form.leadUnitPriceDollars.toFixed(2)}</p>
                <p className="text-sm">Threshold: {form.leadChargeThreshold} leads</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Internal Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setField('notes', event.target.value)}
                  className="min-h-[96px] w-full rounded-xl border border-[var(--border)] px-4 py-3"
                  placeholder="Anything ops should know before launch"
                />
              </div>
            </div>
          )}

          {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold disabled:opacity-40"
            >
              Back
            </button>

            {step < STEP_LABELS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Create Account & Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
