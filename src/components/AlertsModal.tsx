import { useEffect } from 'react'

const ALARMS = [
  {
    tag: '1ST ALARM',
    air: '1 MINUTE CONTINUOUS AIRING',
    main: ['ALERT', 'PREPARE TO EVACUATE'],
    level: '15 METERS WATER LEVEL',
    left: 'linear-gradient(135deg,#F7C548,#EAA315)',
    right: 'linear-gradient(90deg,#D9970F,#C98606)',
  },
  {
    tag: '2ND ALARM',
    air: '2 MINUTES CONTINUOUS AIRING',
    main: ['PRE-EMPTIVE', 'PREPARE EVACUATION'],
    level: '16 METERS WATER LEVEL',
    left: 'linear-gradient(135deg,#F58A3C,#E55A1B)',
    right: 'linear-gradient(90deg,#D44F12,#BF430C)',
  },
  {
    tag: '3RD ALARM',
    air: '5 MINUTES CONTINUOUS AIRING',
    main: ['FORCE EVACUATION'],
    level: '18 METERS WATER LEVEL',
    left: 'linear-gradient(135deg,#E3202E,#B30D19)',
    right: 'linear-gradient(90deg,#8F0A14,#760711)',
  },
]

export default function AlertsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1b3a]/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      style={{ animation: 'fadeIn .2s ease-out' }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes moveUp{from{transform:translateY(32px);opacity:0}to{transform:none;opacity:1}}`}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wl-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        style={{ animation: 'moveUp .3s cubic-bezier(.2,.8,.2,1)' }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-[#0B2A6B] hover:bg-slate-100"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h2
          id="wl-title"
          className="px-10 pb-6 pt-1 text-center text-2xl font-black uppercase tracking-tight text-[#0B2A6B] sm:text-3xl"
        >
          Water Level Monitoring
        </h2>
        <div className="flex flex-col gap-4">
          {ALARMS.map((a) => (
            <div
              key={a.tag}
              className="flex min-h-[88px] overflow-hidden rounded-xl text-white shadow-md"
            >
              <div
                className="flex w-[42%] shrink-0 flex-col justify-center gap-1 p-4"
                style={{ background: a.left }}
              >
                <span className="text-xl font-black leading-none sm:text-2xl">{a.tag}</span>
                <span className="text-[9px] font-bold leading-tight tracking-wide sm:text-[10px]">
                  {a.air}
                </span>
              </div>
              <div
                className="flex flex-1 flex-col items-center justify-center gap-1 p-4 text-center"
                style={{ background: a.right }}
              >
                <span className="text-sm font-black leading-tight sm:text-lg">
                  {a.main.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
                <span className="text-[10px] font-bold tracking-wide sm:text-xs">{a.level}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          NOTE: In severe weather conditions, alarm activation may vary for pre-emptive evacuation.
        </p>
      </div>
    </div>
  )
}
