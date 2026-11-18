import type { Metadata } from 'next'
import CitizenAwareness from '@/components/CitizenAwareness'
import { getCommunityUpdates } from '@/lib/community-updates'

export const metadata: Metadata = {
  title: 'Citizen Awareness | BRGY. TUMANA Emergency Portal',
  description:
    'Report flood incidents, stranded residents, blocked routes, and requests for emergency assistance in Barangay Tumana.',
}

export default async function CitizenAwarenessPage() {
  const updates = await getCommunityUpdates()
  return <CitizenAwareness updates={updates} />
}
