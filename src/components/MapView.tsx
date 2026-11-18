import { useState } from 'react'
import { CENTERS, USER, type Center, type RouteStatus } from './data'
import { PlusIcon, MinusIcon, CrosshairIcon } from './icons'

const ROUTE_COLOR: Record<RouteStatus, string> = {
  clear: '#12a150',
  caution: '#f5b301',
  blocked: '#d92d20',
}
const CENTER_COLOR = { open: '#12a150', pending: '#f5b301', closed: '#d92d20' } as const

interface Props {
  selectedId: string
  onSelect: (id: string) => void
  offline: boolean
  located: boolean
  onOpenAlerts?: () => void
}

export default function MapView({ selectedId, onSelect, offline, located, onOpenAlerts }: Props) {
  const [zoom, setZoom] = useState(1)
  const selected = CENTERS.find((c) => c.id === selectedId)!
  const ordered = [...CENTERS.filter((c) => c.id !== selectedId), selected]
  const clamp = (z: number) => Math.min(2.2, Math.max(0.8, +z.toFixed(2)))

  return (
    <div className="relative h-full min-h-[440px] overflow-hidden rounded-2xl bg-[#F4F6F8] ring-1 ring-navy/10">
      <svg
        viewBox="0 0 800 560"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Map of nearby evacuation centers and routes"
      >
        <g
          style={{
            transform: `translate(400px,280px) scale(${zoom}) translate(-400px,-280px)`,
            transition: 'transform .25s ease',
          }}
        >
          <BaseMap onOpenAlerts={onOpenAlerts} />

          {/* routes: unselected first, thin and faded */}
          {ordered.map((c) => {
            const sel = c.id === selectedId
            return (
              <g key={c.id}>
                <path
                  d={c.path}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={sel ? 14 : 0}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={c.path}
                  fill="none"
                  stroke={ROUTE_COLOR[c.route]}
                  strokeWidth={sel ? 7 : 3}
                  strokeOpacity={sel ? 1 : 0.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={
                    c.route === 'blocked' ? '2 12' : c.route === 'caution' ? '14 8' : undefined
                  }
                />
              </g>
            )
          })}

          {/* center markers */}
          {ordered.map((c) => (
            <Marker key={c.id} c={c} active={c.id === selectedId} onSelect={onSelect} />
          ))}

          {/* user */}
          <g transform={`translate(${USER.x} ${USER.y})`}>
            {located && (
              <circle
                r="16"
                fill="#1f5fe0"
                style={{
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                  animation: 'ping-ring 2s ease-out infinite',
                }}
              />
            )}
            <circle r="11" fill="#fff" />
            <circle r="7.5" fill="#1f5fe0" />
            <g transform="translate(0 -26)">
              <rect x="-31" y="-12" width="62" height="20" rx="10" fill="#0a1f44" />
              <text textAnchor="middle" y="2" fontSize="10.5" fontWeight="800" fill="#fff">
                YOU ARE HERE
              </text>
            </g>
          </g>
        </g>
      </svg>

      {/* overlays */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
        {offline && (
          <span className="rounded-full bg-caution-soft px-3 py-1 text-xs font-bold text-caution-ink ring-1 ring-caution/50">
            Offline map: saved area
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-navy/10">
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => clamp(z + 0.25))}
          className="grid h-11 w-11 place-items-center text-navy hover:bg-info-soft hover:text-info"
        >
          <PlusIcon />
        </button>
        <span className="h-px bg-navy/10" />
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => clamp(z - 0.25))}
          className="grid h-11 w-11 place-items-center text-navy hover:bg-info-soft hover:text-info"
        >
          <MinusIcon />
        </button>
        <span className="h-px bg-navy/10" />
        <button
          aria-label="Recenter on my location"
          onClick={() => setZoom(1)}
          className="grid h-11 w-11 place-items-center text-info hover:bg-info-soft"
        >
          <CrosshairIcon />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl bg-white/95 px-3.5 py-2.5 text-xs font-semibold shadow-lg ring-1 ring-navy/10 backdrop-blur">
        <Legend color="bg-safe" label="Clear route" />
        <Legend color="bg-caution" label="Use caution" />
        <Legend color="bg-alert" label="Blocked / flood" />
        <span className="inline-flex items-center gap-1.5 text-navy/80">
          <span className="h-0 w-4 border-t-2 border-dotted border-[#E63946]" /> Tumana boundary
        </span>
        <Legend color="bg-info" label="You" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-navy/80">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}
    </span>
  )
}

function Marker({
  c,
  active,
  onSelect,
}: {
  c: Center
  active: boolean
  onSelect: (id: string) => void
}) {
  const color = CENTER_COLOR[c.status]
  const label = c.name.replace(/ (School|Hall|Court|Gym)$/, ' $1')
  return (
    <g
      transform={`translate(${c.x} ${c.y})`}
      onClick={() => onSelect(c.id)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`${c.name}, ${c.status}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(c.id)}
    >
      <circle r={active ? 22 : 17} fill="#fff" stroke={color} strokeWidth={active ? 4 : 3} />
      {/* house glyph */}
      <path
        d="M-7 3 L0 -5 L7 3 M-5 2 V8 H5 V2"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={active ? 'scale(1.2)' : undefined}
      />
      {active && (
        <g transform="translate(0 -36)">
          <rect
            x={-label.length * 3.6 - 10}
            y="-12"
            width={label.length * 7.2 + 20}
            height="24"
            rx="12"
            fill="#fff"
            stroke={color}
            strokeWidth="2"
          />
          <text textAnchor="middle" y="4" fontSize="11.5" fontWeight="800" fill="#0a1f44">
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

const RIVER =
  'M430 -300 C400 -150 380 0 430 60 C480 120 390 150 430 200 C390 280 480 340 440 420 C410 480 460 520 430 900'

function Street({
  d,
  major,
  name,
  x,
  y,
  rot = 0,
}: {
  d: string
  major?: boolean
  name: string
  x: number
  y: number
  rot?: number
}) {
  return (
    <g>
      <path d={d} stroke="#D5DAE1" strokeWidth={major ? 13 : 9} strokeLinecap="round" fill="none" />
      <path
        d={d}
        stroke={major ? '#FFFFFF' : '#FBFCFD'}
        strokeWidth={major ? 10 : 6.5}
        strokeLinecap="round"
        fill="none"
      />
      <text
        x={x}
        y={y}
        transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="0.6"
        fill="#5b6475"
        stroke="#fff"
        strokeWidth="2.5"
        paintOrder="stroke"
      >
        {name.toUpperCase()}
      </text>
    </g>
  )
}

type Kind = 'club' | 'school' | 'pin' | 'balai'
function Poi({
  x,
  y,
  kind,
  label,
  anchor = 'start',
}: {
  x: number
  y: number
  kind: Kind
  label: string
  anchor?: 'start' | 'end'
}) {
  const color =
    kind === 'club'
      ? '#7C3AED'
      : kind === 'balai'
        ? '#12a150'
        : kind === 'school'
          ? '#1f5fe0'
          : '#E63946'
  const w = label.length * 5.6 + 14
  const lx = anchor === 'start' ? 18 : -18 - w
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={lx} y="-10" width={w} height="20" rx="10" fill="#fff" stroke="#e3e7ee" />
      <text
        x={lx + w / 2}
        y="3.5"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        fill="#2B2D42"
      >
        {label}
      </text>
      {kind === 'pin' ? (
        <path
          d="M0 11 C-10 -2 -9 -10 0 -10 C9 -10 10 -2 0 11Z"
          fill={color}
          stroke="#fff"
          strokeWidth="2"
          transform="translate(0 -2)"
        />
      ) : (
        <circle r="11" fill={color} stroke="#fff" strokeWidth="2.5" />
      )}
      {kind === 'pin' && <circle r="3" cy="-8" fill="#fff" />}
      {kind === 'club' && (
        <path
          d="M-5 5 V-4 H5 V5 M-5 5 H5 M-2 -1 H2 M-2 2 H2"
          stroke="#fff"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {kind === 'school' && (
        <path
          d="M-6 -1 L0 -5 L6 -1 L0 3 Z M-3 1.5 V5 Q0 7 3 5 V1.5"
          stroke="#fff"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
      )}
      {kind === 'balai' && <circle r="4" fill="#fff" />}
    </g>
  )
}

function BaseMap({ onOpenAlerts }: { onOpenAlerts?: () => void }) {
  return (
    <g>
      {/* landmass */}
      <rect x="-800" y="-600" width="2400" height="1800" fill="#F4F6F8" />
      {/* soft blocks and green areas */}
      <g fill="#EBEFF3">
        {[
          [120, 150, 80, 35],
          [230, 150, 110, 35],
          [230, 270, 110, 100],
          [120, 270, 80, 100],
          [120, 410, 220, 40],
          [460, 100, 90, 80],
          [460, 270, 90, 100],
          [580, 150, 80, 90],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="6" />
        ))}
      </g>
      <rect x="470" y="410" width="110" height="60" rx="12" fill="#CFE8D5" fillOpacity="0.7" />

      {/* road network (under the river) */}
      <Street d="M-300 130 H1100" major name="Moscow St" x={170} y={124} />
      <Street d="M-300 190 H1100" name="Pipino St" x={290} y={184} />
      <Street d="M-300 250 H1100" major name="Tuazon St" x={540} y={244} />
      <Street d="M-300 390 H1100" major name="Bagong Farmers Ave 1" x={250} y={384} />
      <Street d="M-300 450 H1100" name="Liwanag St" x={560} y={444} />
      <Street d="M100 -300 V900" major name="Katipunan" x={94} y={300} rot={-90} />
      <Street d="M210 -300 V900" name="Liwanag St" x={204} y={440} rot={-90} />
      <Street d="M360 -300 V900" name="Farmers Ave 2" x={366} y={140} rot={-90} />
      <Street d="M570 -300 V900" name="" x={0} y={0} />

      {/* Marikina River */}
      <path d={RIVER} stroke="#A9DFF0" strokeWidth="58" fill="none" strokeLinecap="round" />
      <path d={RIVER} stroke="#7CD4ED" strokeWidth="50" fill="none" strokeLinecap="round" />
      <path
        d={RIVER}
        stroke="#67CBE8"
        strokeWidth="26"
        strokeOpacity="0.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={RIVER}
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeDasharray="2 12"
        fill="none"
      />
      <text
        transform="rotate(-82 428 500)"
        x="428"
        y="500"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        letterSpacing="3"
        fill="#2f86a6"
      >
        MARIKINA RIVER
      </text>

      {/* Tumana Bridge */}
      <g>
        <rect
          x="395"
          y="300"
          width="84"
          height="20"
          rx="4"
          fill="#D5DAE1"
          transform="rotate(-3 437 310)"
        />
        <rect
          x="395"
          y="303"
          width="84"
          height="14"
          rx="3"
          fill="#fff"
          transform="rotate(-3 437 310)"
        />
        <text
          x="437"
          y="337"
          textAnchor="middle"
          fontSize="9"
          fontWeight="800"
          letterSpacing="0.6"
          fill="#5b6475"
          stroke="#fff"
          strokeWidth="3"
          paintOrder="stroke"
        >
          TUMANA BRIDGE
        </text>
      </g>

      {/* district boundary */}
      <path
        d="M170 100 L330 80 L520 105 L610 220 L600 400 L490 475 L300 465 L160 405 L140 250 Z"
        fill="#E63946"
        fillOpacity="0.04"
        stroke="#E63946"
        strokeWidth="2"
        strokeDasharray="2 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="280"
        y="320"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        letterSpacing="5"
        fill="#2B2D42"
        stroke="#fff"
        strokeWidth="4"
        paintOrder="stroke"
      >
        TUMANA
      </text>

      {/* landmarks */}
      <Poi x={475} y={60} kind="club" label="Twinville Civic Center" />
      <Poi x={120} y={330} kind="club" label="The Clubhouse at Acropolis Loyola" />
      <Poi x={290} y={215} kind="school" label="Nangka Elementary School" />
      <Poi x={590} y={175} kind="pin" label="Woodridge Heights Residential Estates" anchor="end" />
      <Poi x={540} y={330} kind="pin" label="Trevi Executive Village" />
      <Poi x={400} y={505} kind="balai" label="Balai Malaya" />

      {/* water level alert pin on the bridge */}
      <g
        transform="translate(437 308)"
        role="button"
        tabIndex={0}
        aria-label="Open water level monitoring alerts"
        style={{ cursor: 'pointer' }}
        onClick={onOpenAlerts}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenAlerts?.()}
      >
        <circle
          r="20"
          fill="#E63946"
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: 'ping-ring 2s ease-out infinite',
          }}
        />
        <circle r="13" fill="#B30D19" stroke="#fff" strokeWidth="3" />
        <path
          d="M-4 5 Q0 -6 4 5 M-7 5 H7"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}
