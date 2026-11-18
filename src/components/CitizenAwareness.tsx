'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useFormStatus } from 'react-dom'
import {
  getResponseOverview,
  submitCitizenReport,
  trackCitizenReport,
  type ResponseOverview,
  type SubmitState,
  type TrackedReport,
} from '@/app/(frontend)/citizen-awareness/actions'
import type { CommunityUpdate } from '@/lib/community-updates'
import { AlertIcon, ArrowRightIcon, PinIcon, PhoneIcon, SirenIcon } from './icons'

const REPORT_TYPES = [
  {
    value: 'flood-incident',
    title: 'Report a Flood Incident',
    description: 'Rising water, flooded homes, and unsafe streets',
    tone: 'border-info/20 bg-info-soft text-info',
    icon: 'water',
  },
  {
    value: 'stranded-individuals',
    title: 'Report Stranded Individuals',
    description: 'People or families who need immediate help',
    tone: 'border-alert/20 bg-alert-soft text-alert-dark',
    icon: 'people',
  },
  {
    value: 'emergency-assistance',
    title: 'Request Emergency Assistance',
    description: 'Rescue, evacuation support, or essential supplies',
    tone: 'border-caution/40 bg-caution-soft text-caution-ink',
    icon: 'rescue',
  },
  {
    value: 'blocked-route',
    title: 'Report a Blocked Route',
    description: 'Inaccessible roads, pathways, or evacuation routes',
    tone: 'border-navy/10 bg-white text-navy',
    icon: 'route',
  },
] as const

const REPORT_LABELS: Record<string, string> = {
  'flood-incident': 'Flood Incident',
  'stranded-individuals': 'Stranded Individual(s)',
  'emergency-assistance': 'Emergency Assistance Request',
  'blocked-route': 'Blocked Road or Evacuation Route',
  other: 'Other Flood-Related Concern',
}

const STATUS_STEPS = [
  ['submitted', 'Submitted'],
  ['under-verification', 'Under Verification'],
  ['response-in-progress', 'Response in Progress'],
  ['resolved', 'Resolved'],
  ['closed', 'Closed'],
] as const

const initialState: SubmitState = { success: false }

export default function CitizenAwareness({ updates }: { updates: CommunityUpdate[] }) {
  const router = useRouter()
  const [state, formAction] = useActionState(submitCitizenReport, initialState)
  const [isReturningToMap, setIsReturningToMap] = useState(false)
  const [reportType, setReportType] = useState('flood-incident')
  const [locationState, setLocationState] = useState<'idle' | 'locating' | 'shared' | 'error'>(
    'idle',
  )
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [photoName, setPhotoName] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const [tracked, setTracked] = useState<TrackedReport | null>(null)
  const [trackError, setTrackError] = useState('')
  const [tracking, startTracking] = useTransition()
  const [overview, setOverview] = useState<ResponseOverview | null>(null)
  const [loadingOverview, startOverview] = useTransition()

  useEffect(() => {
    startOverview(async () => setOverview(await getResponseOverview()))
  }, [])

  function chooseReport(type: string) {
    setReportType(type)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setLocationState('error')
      return
    }
    setLocationState('locating')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ lat: coords.latitude, lng: coords.longitude })
        setLocationState('shared')
      },
      () => setLocationState('error'),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  function handleTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const reference = String(new FormData(event.currentTarget).get('reference') ?? '')
    setTrackError('')
    setTracked(null)
    startTracking(async () => {
      const report = await trackCitizenReport(reference)
      if (!report) setTrackError('No report was found. Check the reference number and try again.')
      else setTracked(report)
    })
  }

  function returnToMap() {
    if (isReturningToMap) return
    setIsReturningToMap(true)
    window.setTimeout(() => router.push('/map'), 220)
  }

  return (
    <div
      className={`min-h-screen bg-[#f3f6fb] pb-16 text-navy ${
        isReturningToMap ? 'animate-page-slide-out-right pointer-events-none' : ''
      }`}
    >
      <div className="bg-alert text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em]">
            <SirenIcon width={17} height={17} stroke="white" /> Emergency hotline
          </span>
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 font-extrabold text-alert-dark"
          >
            <PhoneIcon width={15} height={15} /> Call 911
          </a>
        </div>
      </div>

      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-info text-white">
              <PinIcon width={18} height={18} />
            </span>
            <span className="text-sm font-extrabold tracking-[0.16em]">BRGY. TUMANA</span>
          </Link>
          <span className="hidden h-5 w-px bg-navy/15 sm:block" />
          <span className="hidden text-sm font-bold text-navy/60 sm:block">Citizen Awareness</span>
          <button
            type="button"
            onClick={returnToMap}
            disabled={isReturningToMap}
            className="ml-auto rounded-lg px-3 py-2 text-sm font-bold text-info hover:bg-info-soft"
          >
            {isReturningToMap ? 'Returning to map…' : 'Back to map'}
          </button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-navy py-12 text-white sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(31,95,224,.45),transparent_38%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white/85 ring-1 ring-white/20">
                Community reporting and response
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Help Barangay Tumana respond faster.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Report flooding, stranded neighbors, blocked routes, or a request for emergency
                help. For immediate life-threatening danger, call 911 first.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <section aria-labelledby="report-options">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-info">
                  What do you need to report?
                </p>
                <h2 id="report-options" className="mt-1 text-2xl font-extrabold">
                  Choose a reporting option
                </h2>
              </div>
              <span className="hidden text-sm font-semibold text-navy/50 md:block">
                Reports go directly to barangay responders
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {REPORT_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseReport(option.value)}
                  className={`group rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${option.tone}`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm">
                    <CategoryIcon type={option.icon} />
                  </span>
                  <span className="mt-4 block font-extrabold leading-snug">{option.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed opacity-75">
                    {option.description}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">
                    Start report <ArrowRightIcon width={14} height={14} />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
            <section
              ref={formRef}
              className="scroll-mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10 sm:p-7"
              aria-labelledby="report-form-title"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-info text-white">
                  <ReportIcon />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-info">
                    Secure report form
                  </p>
                  <h2 id="report-form-title" className="mt-0.5 text-2xl font-extrabold">
                    Tell responders what is happening
                  </h2>
                  <p className="mt-1 text-sm text-navy/60">
                    Required fields are marked with an asterisk. Your contact and location are
                    visible only to authorized responders.
                  </p>
                </div>
              </div>

              {state.success ? (
                <div
                  role="status"
                  className="mt-6 rounded-2xl border border-safe/30 bg-safe-soft p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-safe text-white">
                      <CheckIcon />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-safe-ink">
                        Report submitted successfully
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-navy/70">
                        Save this reference number to monitor the response:
                      </p>
                      <p className="mt-3 inline-block rounded-lg bg-white px-4 py-2 font-mono text-lg font-black tracking-wide text-navy ring-1 ring-safe/30">
                        {state.reference}
                      </p>
                      {state.warning && (
                        <p className="mt-3 text-sm font-semibold text-caution-ink">
                          {state.warning}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 block text-sm font-bold text-info hover:underline"
                      >
                        Submit another report
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form action={formAction} className="mt-7 space-y-6">
                  {state.errors?.form && (
                    <p
                      role="alert"
                      className="rounded-xl bg-alert-soft p-3 text-sm font-bold text-alert-dark"
                    >
                      {state.errors.form}
                    </p>
                  )}

                  <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="sr-only">Reporter contact information</legend>
                    <Field label="Full Name" hint="Optional" error={state.errors?.fullName}>
                      <input
                        name="fullName"
                        autoComplete="name"
                        placeholder="Juan Dela Cruz"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Contact Number" required error={state.errors?.contactNumber}>
                      <input
                        name="contactNumber"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="09XX XXX XXXX"
                        className={inputClass}
                      />
                    </Field>
                  </fieldset>

                  <Field label="Type of Report" required error={state.errors?.reportType}>
                    <select
                      name="reportType"
                      value={reportType}
                      onChange={(event) => setReportType(event.target.value)}
                      className={inputClass}
                    >
                      {Object.entries(REPORT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <Field
                      label="Exact Location or Street Address"
                      required
                      error={state.errors?.exactLocation}
                    >
                      <input
                        name="exactLocation"
                        required
                        placeholder="Street, purok, house number, or nearest landmark"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Affected Individuals"
                      required
                      error={state.errors?.affectedIndividuals}
                    >
                      <input
                        name="affectedIndividuals"
                        type="number"
                        min="0"
                        max="999"
                        defaultValue="1"
                        required
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-info/20 bg-info-soft/70 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-info">
                        <PinIcon width={20} height={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold">Share your current location</p>
                        <p className="text-sm text-navy/60">
                          Adds GPS coordinates so responders can locate the incident faster.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={shareLocation}
                        disabled={locationState === 'locating'}
                        className="rounded-xl bg-info px-4 py-2.5 text-sm font-bold text-white transition hover:bg-info-dark disabled:opacity-60"
                      >
                        {locationState === 'locating'
                          ? 'Locating…'
                          : locationState === 'shared'
                            ? 'Location shared'
                            : 'Use my location'}
                      </button>
                    </div>
                    {locationState === 'error' && (
                      <p className="mt-2 text-sm font-semibold text-alert-dark">
                        Location access is unavailable. Enter the exact address above.
                      </p>
                    )}
                    {coordinates && (
                      <p className="mt-3 rounded-lg bg-white px-3 py-2 font-mono text-xs text-navy/70">
                        Map pin: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                      </p>
                    )}
                    <input type="hidden" name="latitude" value={coordinates?.lat ?? ''} />
                    <input type="hidden" name="longitude" value={coordinates?.lng ?? ''} />
                  </div>

                  {reportType === 'stranded-individuals' && (
                    <fieldset className="rounded-2xl border-2 border-alert/25 bg-alert-soft/50 p-4 sm:p-5">
                      <legend className="px-2 text-sm font-extrabold uppercase tracking-[0.12em] text-alert-dark">
                        Stranded resident details
                      </legend>
                      <p className="mb-4 text-sm text-navy/65">
                        Critical and life-threatening reports are highlighted for responder
                        prioritization.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Children">
                          <input
                            name="children"
                            type="number"
                            min="0"
                            defaultValue="0"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Senior Citizens">
                          <input
                            name="seniorCitizens"
                            type="number"
                            min="0"
                            defaultValue="0"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Persons with Disabilities">
                          <input
                            name="personsWithDisabilities"
                            type="number"
                            min="0"
                            defaultValue="0"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Current Water Level">
                          <input
                            name="floodDepth"
                            placeholder="e.g. knee-deep, 0.5 meter"
                            className={inputClass}
                          />
                        </Field>
                        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-alert/25 bg-white px-4 py-3 text-sm font-bold">
                          <input
                            name="immediateDanger"
                            type="checkbox"
                            className="h-5 w-5 accent-alert"
                          />
                          In immediate danger
                        </label>
                      </div>
                      <div className="mt-4">
                        <Field label="Medical or Mobility Assistance Required">
                          <textarea
                            name="medicalOrMobilityNeeds"
                            rows={3}
                            placeholder="Describe medication, injury, wheelchair, or mobility needs"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </fieldset>
                  )}

                  <Field
                    label="Description of the Situation"
                    required
                    error={state.errors?.description}
                  >
                    <textarea
                      name="description"
                      rows={5}
                      required
                      minLength={10}
                      maxLength={2000}
                      placeholder="Describe the water level, people affected, hazards, and what assistance is needed."
                      className={inputClass}
                    />
                  </Field>

                  <fieldset>
                    <legend className="mb-2 text-sm font-bold">
                      Urgency Level <span className="text-alert">*</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {[
                        [
                          'low',
                          'Low',
                          'border-safe/30 has-[:checked]:bg-safe-soft has-[:checked]:border-safe',
                        ],
                        [
                          'moderate',
                          'Moderate',
                          'border-caution/40 has-[:checked]:bg-caution-soft has-[:checked]:border-caution',
                        ],
                        [
                          'high',
                          'High',
                          'border-[#e55a1b]/30 has-[:checked]:bg-[#fff0e8] has-[:checked]:border-[#e55a1b]',
                        ],
                        [
                          'critical',
                          'Critical',
                          'border-alert/30 has-[:checked]:bg-alert-soft has-[:checked]:border-alert',
                        ],
                      ].map(([value, label, tone]) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 py-3 text-sm font-bold ${tone}`}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={value}
                            defaultChecked={value === 'moderate'}
                            className="accent-info"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    {state.errors?.urgency && (
                      <p className="mt-1 text-xs font-semibold text-alert-dark">
                        {state.errors.urgency}
                      </p>
                    )}
                  </fieldset>

                  <Field
                    label="Photo or Supporting Evidence"
                    hint="Optional · JPG, PNG or WebP · max 5 MB"
                    error={state.errors?.photo}
                  >
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-info/40 bg-info-soft/40 px-4 py-4 transition hover:border-info">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-info">
                        <PhotoIcon />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold">
                          {photoName || 'Choose a photo'}
                        </span>
                        <span className="block text-xs text-navy/55">
                          Only take a photo when it is safe
                        </span>
                      </span>
                      <input
                        name="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? '')}
                      />
                    </label>
                  </Field>

                  <div className="rounded-xl bg-navy/5 p-3 text-xs leading-relaxed text-navy/65">
                    By submitting, you confirm this information is accurate to the best of your
                    knowledge. Do not put yourself in danger to gather details.
                  </div>
                  <SubmitButton />
                </form>
              )}
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-caution-soft text-caution-ink">
                    <BellIcon />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-caution-ink">
                      Live notices
                    </p>
                    <h2 className="font-extrabold">Community Safety Updates</h2>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {updates.length ? (
                    updates.map((update) => <UpdateCard key={update.id} update={update} />)
                  ) : (
                    <p className="rounded-xl bg-navy/5 p-4 text-sm text-navy/60">
                      No active barangay announcements right now.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-3xl bg-navy p-5 text-white shadow-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/60">
                  Report tracking
                </p>
                <h2 className="mt-1 text-xl font-extrabold">Check your report status</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  Enter the reference number from your confirmation message.
                </p>
                <form onSubmit={handleTracking} className="mt-4 flex gap-2">
                  <input
                    name="reference"
                    required
                    placeholder="TUM-2026-XXXXXXXX"
                    aria-label="Report reference number"
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-3 font-mono text-sm uppercase text-white placeholder:text-white/35 focus:border-info focus:outline-none"
                  />
                  <button
                    disabled={tracking}
                    className="rounded-xl bg-info px-4 text-sm font-bold text-white hover:bg-info-dark disabled:opacity-60"
                  >
                    {tracking ? 'Checking…' : 'Track'}
                  </button>
                </form>
                {trackError && (
                  <p role="alert" className="mt-3 text-sm font-semibold text-[#ffb4ad]">
                    {trackError}
                  </p>
                )}
                {tracked && <TrackingResult report={tracked} />}
              </section>

              <section className="rounded-3xl border border-alert/20 bg-alert-soft p-5">
                <AlertIcon className="text-alert-dark" />
                <h2 className="mt-3 font-extrabold text-alert-dark">Immediate danger?</h2>
                <p className="mt-1 text-sm leading-relaxed text-navy/70">
                  Do not wait for an online response if lives are at risk or water is rapidly
                  rising.
                </p>
                <a
                  href="tel:911"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-alert py-3 font-extrabold text-white"
                >
                  <PhoneIcon width={17} height={17} /> Call 911 now
                </a>
              </section>
            </aside>
          </div>

          <ResponseMonitoring
            overview={overview}
            loading={loadingOverview}
            onRefresh={() => startOverview(async () => setOverview(await getResponseOverview()))}
          />
        </div>
      </main>
    </div>
  )
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-3 text-sm text-navy placeholder:text-navy/35 transition focus:border-info focus:outline-none focus:ring-4 focus:ring-info/10'

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-sm font-bold">
        <span>
          {label} {required && <span className="text-alert">*</span>}
        </span>
        {hint && <span className="text-right text-[11px] font-semibold text-navy/45">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-alert-dark">{error}</span>}
    </label>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-info px-5 py-3.5 font-extrabold text-white shadow-lg shadow-info/25 transition hover:bg-info-dark disabled:cursor-wait disabled:opacity-65"
    >
      {pending ? 'Submitting securely…' : 'Submit Report'}
      {!pending && <ArrowRightIcon width={18} height={18} />}
    </button>
  )
}

function UpdateCard({ update }: { update: CommunityUpdate }) {
  const tone = {
    warning: 'bg-alert-soft text-alert-dark',
    evacuation: 'bg-caution-soft text-caution-ink',
    response: 'bg-safe-soft text-safe-ink',
    information: 'bg-info-soft text-info',
  }[update.type]
  return (
    <article className="rounded-2xl border border-navy/8 p-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${tone}`}
        >
          {update.type}
        </span>
        <time className="text-[10px] font-semibold text-navy/40">
          {new Date(update.issuedAt).toLocaleTimeString('en-PH', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </time>
      </div>
      <h3 className="mt-3 text-sm font-extrabold">{update.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-navy/60">{update.message}</p>
    </article>
  )
}

function TrackingResult({ report }: { report: TrackedReport }) {
  const currentIndex = STATUS_STEPS.findIndex(([value]) => value === report.status)
  return (
    <div className="mt-4 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold text-white/55">{report.reference}</p>
          <p className="mt-1 text-sm font-extrabold">{REPORT_LABELS[report.reportType]}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${report.urgency === 'critical' ? 'bg-alert text-white' : 'bg-white/10 text-white/75'}`}
        >
          {report.urgency}
        </span>
      </div>
      <ol className="mt-4 space-y-2">
        {STATUS_STEPS.map(([value, label], index) => (
          <li
            key={value}
            className={`flex items-center gap-2 text-xs font-bold ${index <= currentIndex ? 'text-white' : 'text-white/35'}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${index <= currentIndex ? 'bg-safe' : 'bg-white/20'}`}
            />
            {label}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ResponseMonitoring({
  overview,
  loading,
  onRefresh,
}: {
  overview: ResponseOverview | null
  loading: boolean
  onRefresh: () => void
}) {
  const stats = [
    ['Total Reports', overview?.total ?? '—', 'text-info'],
    ['Active Flood Incidents', overview?.activeFloodIncidents ?? '—', 'text-alert-dark'],
    ['Stranded Individuals', overview?.strandedIndividuals ?? '—', 'text-[#e55a1b]'],
    ['Pending Assistance', overview?.pendingAssistance ?? '—', 'text-caution-ink'],
    ['Resolved Incidents', overview?.resolved ?? '—', 'text-safe-ink'],
  ]
  return (
    <section
      className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/10"
      aria-labelledby="monitoring-title"
    >
      <div className="flex flex-col gap-3 border-b border-navy/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-info">
            Barangay response snapshot
          </p>
          <h2 id="monitoring-title" className="mt-1 text-2xl font-extrabold">
            Emergency Response Monitoring
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Public totals are anonymized. Authorized officials can review exact report locations in
            the admin panel.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start rounded-xl border border-info/25 px-4 py-2 text-sm font-bold text-info hover:bg-info-soft disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh totals'}
        </button>
      </div>
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="grid grid-cols-2 gap-px bg-navy/10 sm:grid-cols-3 lg:grid-cols-2">
          {stats.map(([label, value, tone], index) => (
            <div
              key={String(label)}
              className={`bg-white p-5 ${index === stats.length - 1 ? 'col-span-2 sm:col-span-1 lg:col-span-2' : ''}`}
            >
              <p className={`text-3xl font-black ${tone}`}>{value}</p>
              <p className="mt-1 text-xs font-bold text-navy/55">{label}</p>
            </div>
          ))}
        </div>
        <div className="relative min-h-[300px] overflow-hidden bg-[#eaf0f5]">
          <svg
            viewBox="0 0 600 300"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Anonymized incident activity map of Tumana district"
          >
            <rect width="600" height="300" fill="#F4F6F8" />
            <g stroke="#fff" strokeWidth="9">
              <path d="M0 70H600M0 155H600M0 235H600" />
              <path d="M100 0V300M235 0V300M480 0V300" />
            </g>
            <path
              d="M365 -30 C320 50 405 95 360 150 C330 200 405 240 370 330"
              fill="none"
              stroke="#7CD4ED"
              strokeWidth="45"
            />
            <path
              d="M110 42L290 25L490 75L520 235L330 270L115 220Z"
              fill="#E63946"
              fillOpacity=".035"
              stroke="#E63946"
              strokeWidth="2"
              strokeDasharray="3 7"
            />
            <text x="250" y="137" fill="#2B2D42" fontSize="19" fontWeight="900" letterSpacing="4">
              TUMANA
            </text>
            {overview && overview.total > 0 && (
              <>
                <MapPulse x={210} y={92} color="#d92d20" />
                <MapPulse x={430} y={182} color="#f5b301" />
                <MapPulse x={275} y={225} color="#1f5fe0" />
              </>
            )}
          </svg>
          <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-[11px] font-bold text-navy/60 shadow">
            Approximate activity only · exact locations are protected
          </span>
        </div>
      </div>
    </section>
  )
}

function MapPulse({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="13" fill={color} fillOpacity=".18" />
      <circle r="7" fill={color} stroke="#fff" strokeWidth="3" />
    </g>
  )
}

function CategoryIcon({ type }: { type: string }) {
  const paths: Record<string, ReactNode> = {
    water: (
      <path d="M4 15c3-3 5 3 8 0s5 3 8 0M6 10c2-2 4 2 6 0s4 2 6 0M12 3c-2 3-4 5-4 7a4 4 0 0 0 8 0c0-2-2-4-4-7Z" />
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c0-4 2-6 6-6s6 2 6 6M15 15c3 0 5 1.5 5 5" />
      </>
    ),
    rescue: (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8" />
      </>
    ),
    route: (
      <>
        <path d="M5 19c3-5 2-9 6-11s6 1 8-4" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="4" r="2" />
        <path d="M10 15h5" />
      </>
    ),
  }
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[type]}
    </svg>
  )
}

const ReportIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6" />
  </svg>
)
const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
  </svg>
)
const PhotoIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3" y="5" width="18" height="15" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="m21 15-5-5L5 20" />
  </svg>
)
const CheckIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
)
