import { useState, type FormEvent } from 'react'
import Topo from './Topo'
import {
  PinIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  PhoneIcon,
  WifiOffIcon,
} from './icons'

interface Props {
  onSignIn: () => void
  onOffline: () => void
}

export default function Login({ onSignIn, onOffline }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const signup = mode === 'signup'

  function submit(e: FormEvent) {
    e.preventDefault()
    if (signup && !name.trim()) return setError('Enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    onSignIn()
  }

  function switchMode() {
    setMode(signup ? 'signin' : 'signup')
    setError('')
  }

  const field =
    'h-12 w-full rounded-xl border border-navy/15 bg-white pl-11 pr-4 text-[15px] text-navy placeholder:text-navy/40 transition focus:border-info focus:outline-none focus:ring-4 focus:ring-info/15'

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left: brand panel */}
      <section className="relative isolate flex min-h-[420px] flex-col overflow-hidden bg-navy px-8 py-8 text-white sm:px-14 sm:py-12 lg:min-h-screen">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_30%,rgba(31,95,224,0.35),transparent_70%)]" />
        <Topo className="absolute inset-0 -z-10 h-full w-full" />

        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-info text-white shadow-lg shadow-info/30">
            <PinIcon width={18} height={18} />
          </span>
          <span className="text-sm font-extrabold tracking-[0.22em]">BRGY. TUMANA</span>
        </div>

        <div className="my-auto max-w-xl py-14 lg:py-0">
          <h1 className="font-['Inria_Sans'] text-[clamp(3rem,6.2vw,5.5rem)] leading-[0.98] tracking-tight">
            Local routes.
            <br />
            <span className="italic text-white/90">Ready when needed.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            See which flood routes are clear, find the nearest open evacuation center, and get
            walking directions, even when your connection drops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 font-semibold text-white hover:text-white/80"
          >
            <PhoneIcon width={16} height={16} /> Emergency? Call 911
          </a>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
          <span>Barangay Tumana Disaster Risk Reduction Office</span>
        </div>
      </section>

      {/* Right: form */}
      <section className="flex items-center justify-center bg-cream px-5 py-12 sm:px-10">
        <div className="w-full max-w-[440px] rounded-3xl border border-navy/5 bg-white p-8 shadow-[0_30px_60px_-30px_rgba(10,31,68,0.25)] sm:p-10">
          <h2 className="font-['Inria_Sans'] text-5xl leading-none tracking-tight">
            {signup ? 'Create account.' : 'Welcome back.'}
          </h2>
          <p className="mt-3 text-[15px] text-navy/60">
            {signup
              ? 'Register to receive alerts for your purok.'
              : 'Sign in to view live routes and alerts.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {signup && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
                  Full name
                </label>
                <div className="relative">
                  <PinIcon
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
                    width={18}
                    height={18}
                  />
                  <input
                    id="name"
                    className={field}
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                Email address
              </label>
              <div className="relative">
                <MailIcon
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
                  width={18}
                  height={18}
                />
                <input
                  id="email"
                  type="email"
                  className={field}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <LockIcon
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
                  width={18}
                  height={18}
                />
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  className={field + ' pr-12'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy"
                >
                  {show ? (
                    <EyeOffIcon width={18} height={18} />
                  ) : (
                    <EyeIcon width={18} height={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-alert-soft px-3 py-2 text-sm font-medium text-alert-dark"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-info py-3.5 text-[15px] font-bold text-white shadow-lg shadow-info/30 transition hover:bg-info-dark active:scale-[0.99]"
            >
              {signup ? 'Create account' : 'Sign in securely'}
              <ArrowRightIcon
                width={18}
                height={18}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-navy/35">
            <span className="h-px flex-1 bg-navy/10" /> or{' '}
            <span className="h-px flex-1 bg-navy/10" />
          </div>

          <div className="space-y-3 text-center text-sm">
            <p className="text-navy/60">
              {signup ? 'Already registered? ' : 'New to the portal? '}
              <button
                type="button"
                onClick={switchMode}
                className="font-bold text-info underline-offset-4 hover:underline"
              >
                {signup ? 'Sign in' : 'Create an account'}
              </button>
            </p>
            <button
              type="button"
              onClick={onOffline}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 font-bold text-info hover:bg-info-soft"
            >
              <WifiOffIcon width={16} height={16} /> Continue with offline map
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
