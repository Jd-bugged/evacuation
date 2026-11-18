'use client'

import { useRouter } from 'next/navigation'
import Dashboard from './Dashboard'

export default function MainMapPage() {
  const router = useRouter()

  return (
    <div className="animate-page-slide-in-left">
      <Dashboard offline={false} onSignOut={() => router.push('/')} />
    </div>
  )
}
