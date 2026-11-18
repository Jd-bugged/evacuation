import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import MapView from './MapView'
import AlertsModal from './AlertsModal'
import { CENTERS, HOTLINES, type CenterStatus, type RouteStatus } from './data'
import {
  PinIcon,
  PhoneIcon,
  AlertIcon,
  WifiIcon,
  WifiOffIcon,
  SirenIcon,
  BuildingIcon,
  FlagIcon,
  LogoutIcon,
  CrosshairIcon,
} from './icons'

type Geo =
  | { state: 'locating' }
  | { state: 'locked'; lat: number; lng: number; acc: number }
  | { state: 'fallback'; reason: string }

// Locate the user on load: no search button, no manual trigger.
function useAutoLocation(): Geo {
  const [geo, setGeo] = useState<Geo>({ state: 'locating' })
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeo({ state: 'fallback', reason: 'Location is not supported on this device.' })
      return
    }
    const id = navigator.geolocation.watchPosition(
      (p) =>
        setGeo({
          state: 'locked',
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          acc: Math.round(p.coords.accuracy),
        }),
      () =>
        setGeo({
          state: 'fallback',
          reason: 'Location access is off. Showing Brgy. Tumana center.',
        }),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])
  return geo
}

const ROUTE_BADGE: Record<RouteStatus, { text: string; cls: string }> = {
  clear: { text: 'Route clear', cls: 'bg-safe-soft text-safe-ink' },
  caution: { text: 'Use caution', cls: 'bg-caution-soft text-caution-ink' },
  blocked: { text: 'Blocked', cls: 'bg-alert-soft text-alert-dark' },
}
const CENTER_BADGE: Record<CenterStatus, { text: string; cls: string }> = {
  open: { text: 'Open', cls: 'bg-safe text-white' },
  pending: { text: 'Opening soon', cls: 'bg-caution text-navy' },
  closed: { text: 'Unavailable', cls: 'bg-alert text-white' },
}

export default function Dashboard({
  offline,
  onSignOut,
}: {
  offline: boolean
  onSignOut: () => void
}) {
  const geo = useAutoLocation()
  const [selectedId, setSelectedId] = useState('a')
  const [alertsOpen, setAlertsOpen] = useState(false)
  const selected = CENTERS.find((c) => c.id === selectedId)!
  const nearestSafe = CENTERS.filter((c) => c.status === 'open' && c.route !== 'blocked')

  return (
    <div className="min-h-screen bg-[#f3f6fb] pb-16">
      <AlertsModal open={alertsOpen} onClose={() => setAlertsOpen(false)} />
      {/* 1. Hotlines: always the first thing on screen */}
      <div className="sticky top-0 z-30 bg-alert text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
          <span className="hidden shrink-0 items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] sm:flex">
            <SirenIcon
              width={18}
              height={18}
              className="text-alert-dark"
              stroke="rgb(255, 255, 255)"
            />{' '}
            Emergency hotlines
          </span>
          <ul className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none] sm:justify-end">
            {HOTLINES.map((h, i) => (
              <li key={h.tel} className="shrink-0">
                <a
                  href={`tel:${h.tel}`}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition bg-white text-alert-dark hover:bg-white/90`}
                >
                  <PhoneIcon width={16} height={16} />
                  <span className="leading-tight">
                    <span
                      className={`block text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-alert-dark/70' : 'text-alert-dark/80'}`}
                    >
                      {h.label}
                    </span>
                    <span className="block text-base font-extrabold tabular-nums">{h.number}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Navigation + system status */}
      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-info text-white">
              <PinIcon width={18} height={18} />
            </span>
            <span className="text-sm font-extrabold tracking-[0.2em]">BRGY. TUMANA</span>
          </div>
          <nav className="ml-2 flex gap-1 sm:ml-6" aria-label="Primary">
            {['Map', 'Alerts'].map((n, i) => (
              <a
                key={n}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (n === 'Alerts') setAlertsOpen(true)
                }}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${i === 0 ? 'bg-info-soft text-info' : 'text-navy/60 hover:text-info'}`}
              >
                {n}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {offline ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-caution-soft px-3 py-1.5 text-xs font-bold text-caution-ink">
                <WifiOffIcon width={14} height={14} /> Offline mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-safe-soft px-3 py-1.5 text-xs font-bold text-safe-ink">
                <WifiIcon width={14} height={14} /> Connected
              </span>
            )}
            <button
              onClick={onSignOut}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold text-info hover:bg-info-soft"
            >
              <LogoutIcon width={16} height={16} />
              <span className="hidden sm:inline">{offline ? 'Back to sign in' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 pt-5 sm:px-6">
        {/* 3. Situation: where am I + what is the danger */}
        <section
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
          aria-label="Situation"
        >
          <LocationCard geo={geo} />
          <div className="flex items-start gap-3.5 rounded-2xl border border-alert/30 bg-alert-soft p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-alert text-white">
              <AlertIcon />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-widest text-alert-dark">
                Flood warning
              </p>
              <p className="mt-0.5 font-bold leading-snug">
                The river road and low-lying puroks are flooding. Avoid the red zone.
              </p>
              <p className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-caution-ink">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-caution" />
                Advisory: water is still rising. Keep going to higher ground.
              </p>
            </div>
          </div>
        </section>

        {/* 4. The map is the focal point, with safe destinations beside it */}
        <section
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]"
          aria-label="Map and evacuation centers"
        >
          <div className="h-[62vh] min-h-[460px] lg:h-[640px]">
            <MapView
              selectedId={selectedId}
              onSelect={setSelectedId}
              offline={offline}
              located={geo.state === 'locked'}
              onOpenAlerts={() => setAlertsOpen(true)}
            />
          </div>

          <aside className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-navy/10 lg:h-[640px]">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-safe-soft text-safe-ink">
                <BuildingIcon width={18} height={18} />
              </span>
              <h2 className="text-lg font-extrabold">Nearest safe centers</h2>
            </div>
            <p className="mt-1 text-sm text-navy/60">
              {nearestSafe.length} reachable now. Tap one to see its route.
            </p>

            <ul className="mt-3 flex-1 space-y-2 overflow-y-auto pr-0.5">
              {CENTERS.map((c) => {
                const active = c.id === selectedId
                const cb = CENTER_BADGE[c.status]
                const rb = ROUTE_BADGE[c.route]
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      aria-pressed={active}
                      className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-info bg-info-soft/60 ring-2 ring-info/25' : 'border-navy/10 hover:border-info/40'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold leading-snug">{c.name}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${cb.cls}`}
                        >
                          {cb.text}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-navy/55">{c.address}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="font-extrabold tabular-nums">{c.distanceKm} km</span>
                        <span className="text-navy/30">•</span>
                        <span className="font-semibold tabular-nums text-navy/70">
                          {c.etaMin} min walk
                        </span>
                        <span
                          className={`ml-auto rounded-md px-2 py-0.5 text-[11px] font-bold ${rb.cls}`}
                        >
                          {rb.text}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div
              className={`mt-3 rounded-xl p-3 text-sm font-semibold ${selected.route === 'clear' ? 'bg-safe-soft text-safe-ink' : selected.route === 'caution' ? 'bg-caution-soft text-caution-ink' : 'bg-alert-soft text-alert-dark'}`}
            >
              {selected.routeNote}
            </div>
          </aside>
        </section>

        {/* 5. Act: quick actions */}
        <section className="grid gap-3 sm:grid-cols-2" aria-label="Quick actions">
          <a
            href="tel:911"
            className="flex items-center gap-3 rounded-2xl bg-alert p-4 font-extrabold text-white shadow-lg shadow-alert/25 transition hover:bg-alert-dark"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
              <SirenIcon />
            </span>
            <span className="leading-tight">
              I need rescue
              <span className="block text-sm font-semibold text-white/80">Call 911 now</span>
            </span>
          </a>
          <Link
            href="/citizen-awareness"
            className="flex items-center gap-3 rounded-2xl border border-info/30 bg-info-soft p-4 text-left font-extrabold text-navy transition hover:border-info/60 hover:bg-info/15"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-caution text-navy">
              <FlagIcon />
            </span>
            <span className="leading-tight">
              Citizen Awareness
              <span className="block text-sm font-semibold text-info">
                Report incidents and request help
              </span>
            </span>
          </Link>
        </section>
      </main>
    </div>
  )
}

function LocationCard({ geo }: { geo: Geo }) {
  let tone = 'border-info/25 bg-info-soft'
  let icon: ReactNode = (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-info border-t-transparent" />
  )
  let title = 'Finding your location…'
  let sub = 'Allow location access to see routes from where you stand.'
  let label = 'Detecting'
  let labelCls = 'text-info'
  if (geo.state === 'locked') {
    tone = 'border-safe/30 bg-safe-soft'
    icon = <CrosshairIcon className="text-safe-ink" />
    title = 'Location locked'
    sub = `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)} · accurate to ${geo.acc} m`
    label = 'Your location'
    labelCls = 'text-safe-ink'
  } else if (geo.state === 'fallback') {
    tone = 'border-caution/50 bg-caution-soft'
    icon = <PinIcon className="text-caution-ink" />
    title = 'Using Brgy. Tumana center'
    sub = geo.reason
    label = 'Approximate'
    labelCls = 'text-caution-ink'
  }
  return (
    <div className={`flex items-start gap-3.5 rounded-2xl border p-4 ${tone}`} role="status">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white">{icon}</span>
      <div className="min-w-0">
        <p className={`text-xs font-extrabold uppercase tracking-widest ${labelCls}`}>{label}</p>
        <p className="mt-0.5 font-bold leading-snug">{title}</p>
        <p className="mt-0.5 break-words text-sm text-navy/65">{sub}</p>
      </div>
    </div>
  )
}
