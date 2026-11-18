'use client'

import { useState } from 'react'
import Login from './Login'
import Dashboard from './Dashboard'

type View = 'login' | 'online' | 'offline'

export default function PortalApp() {
  const [view, setView] = useState<View>('login')
  if (view === 'login') {
    return <Login onSignIn={() => setView('online')} onOffline={() => setView('offline')} />
  }
  return <Dashboard offline={view === 'offline'} onSignOut={() => setView('login')} />
}
