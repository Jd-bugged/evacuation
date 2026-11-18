'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export type SubmitState = {
  success: boolean
  reference?: string
  warning?: string
  errors?: Record<string, string>
}

export type TrackedReport = {
  reference: string
  reportType: string
  urgency: string
  status: string
  submittedAt: string
}

export type ResponseOverview = {
  total: number
  activeFloodIncidents: number
  strandedIndividuals: number
  pendingAssistance: number
  resolved: number
}

const REPORT_TYPES = new Set([
  'flood-incident',
  'stranded-individuals',
  'emergency-assistance',
  'blocked-route',
  'other',
])
const URGENCY_LEVELS = new Set(['low', 'moderate', 'high', 'critical'])
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim()
const count = (form: FormData, name: string) => {
  const value = Number.parseInt(text(form, name) || '0', 10)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

export async function submitCitizenReport(
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const reportType = text(formData, 'reportType')
  const urgency = text(formData, 'urgency')
  const fullName = text(formData, 'fullName')
  const contactNumber = text(formData, 'contactNumber')
  const exactLocation = text(formData, 'exactLocation')
  const description = text(formData, 'description')
  const affectedIndividuals = count(formData, 'affectedIndividuals')
  const latitudeValue = text(formData, 'latitude')
  const longitudeValue = text(formData, 'longitude')
  const latitude = latitudeValue ? Number(latitudeValue) : undefined
  const longitude = longitudeValue ? Number(longitudeValue) : undefined
  const photo = formData.get('photo')
  const errors: Record<string, string> = {}

  if (!REPORT_TYPES.has(reportType)) errors.reportType = 'Select a valid report type.'
  if (!URGENCY_LEVELS.has(urgency)) errors.urgency = 'Select an urgency level.'
  if (fullName.length > 100) errors.fullName = 'Name must be 100 characters or fewer.'
  if (!/^[0-9+()\-\s]{7,20}$/.test(contactNumber)) {
    errors.contactNumber = 'Enter a valid contact number.'
  }
  if (exactLocation.length < 5 || exactLocation.length > 300) {
    errors.exactLocation = 'Enter an exact street address or nearby landmark.'
  }
  if (affectedIndividuals > 999) {
    errors.affectedIndividuals = 'Enter a number from 0 to 999.'
  }
  if (description.length < 10 || description.length > 2000) {
    errors.description = 'Describe the situation in 10 to 2,000 characters.'
  }
  if (
    (latitude !== undefined && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
    (longitude !== undefined &&
      (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
  ) {
    errors.location = 'The shared coordinates are invalid.'
  }
  if (photo instanceof File && photo.size > 0) {
    if (!IMAGE_TYPES.has(photo.type)) errors.photo = 'Upload a JPG, PNG, or WebP image.'
    if (photo.size > 5 * 1024 * 1024) errors.photo = 'Photo must be 5 MB or smaller.'
  }
  if (Object.keys(errors).length) return { success: false, errors }

  try {
    const payload = await getPayload({ config })
    const report = await payload.create({
      collection: 'citizen-reports',
      draft: false,
      overrideAccess: false,
      data: {
        // The collection hook enforces this server-owned initial value.
        status: 'submitted',
        reportType: reportType as
          | 'flood-incident'
          | 'stranded-individuals'
          | 'emergency-assistance'
          | 'blocked-route'
          | 'other',
        urgency: urgency as 'low' | 'moderate' | 'high' | 'critical',
        fullName: fullName || undefined,
        contactNumber,
        exactLocation,
        affectedIndividuals,
        description,
        latitude,
        longitude,
        strandedDetails: {
          children: count(formData, 'children'),
          seniorCitizens: count(formData, 'seniorCitizens'),
          personsWithDisabilities: count(formData, 'personsWithDisabilities'),
          floodDepth: text(formData, 'floodDepth') || undefined,
          immediateDanger: formData.get('immediateDanger') === 'on',
          medicalOrMobilityNeeds: text(formData, 'medicalOrMobilityNeeds') || undefined,
        },
      },
    })

    let warning: string | undefined
    if (photo instanceof File && photo.size > 0) {
      try {
        await payload.create({
          collection: 'report-evidence',
          draft: false,
          overrideAccess: false,
          data: { reportReference: report.referenceNumber ?? '' },
          file: {
            data: Buffer.from(await photo.arrayBuffer()),
            mimetype: photo.type,
            name: photo.name,
            size: photo.size,
          },
        })
      } catch {
        warning = 'Your report was saved, but the photo could not be uploaded.'
      }
    }

    return {
      success: true,
      reference: report.referenceNumber ?? undefined,
      warning,
    }
  } catch {
    return {
      success: false,
      errors: { form: 'We could not submit your report. Please try again or call 911.' },
    }
  }
}

export async function trackCitizenReport(referenceInput: string): Promise<TrackedReport | null> {
  const reference = referenceInput.trim().toUpperCase()
  if (!/^TUM-\d{4}-[A-F0-9]{8}$/.test(reference)) return null

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'citizen-reports',
    overrideAccess: false,
    where: { referenceNumber: { equals: reference } },
    limit: 1,
  })
  const report = result.docs[0]
  if (!report?.referenceNumber) return null

  return {
    reference: report.referenceNumber,
    reportType: report.reportType,
    urgency: report.urgency,
    status: report.status,
    submittedAt: report.createdAt,
  }
}

export async function getResponseOverview(): Promise<ResponseOverview> {
  const payload = await getPayload({ config })
  const active = { status: { not_in: ['resolved', 'closed'] } }

  const [total, flood, assistance, resolved, strandedReports] = await Promise.all([
    payload.count({ collection: 'citizen-reports', overrideAccess: false }),
    payload.count({
      collection: 'citizen-reports',
      overrideAccess: false,
      where: { and: [{ reportType: { equals: 'flood-incident' } }, active] },
    }),
    payload.count({
      collection: 'citizen-reports',
      overrideAccess: false,
      where: { and: [{ reportType: { equals: 'emergency-assistance' } }, active] },
    }),
    payload.count({
      collection: 'citizen-reports',
      overrideAccess: false,
      where: { status: { in: ['resolved', 'closed'] } },
    }),
    payload.find({
      collection: 'citizen-reports',
      overrideAccess: false,
      where: { and: [{ reportType: { equals: 'stranded-individuals' } }, active] },
      select: { affectedIndividuals: true },
      pagination: false,
      limit: 100,
    }),
  ])

  return {
    total: total.totalDocs,
    activeFloodIncidents: flood.totalDocs,
    pendingAssistance: assistance.totalDocs,
    resolved: resolved.totalDocs,
    strandedIndividuals: strandedReports.docs.reduce(
      (sum, report) => sum + (report.affectedIndividuals ?? 0),
      0,
    ),
  }
}
