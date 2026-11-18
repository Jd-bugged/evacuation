import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export type CommunityUpdate = {
  id: string
  title: string
  type: 'warning' | 'evacuation' | 'response' | 'information'
  message: string
  issuedAt: string
}

async function queryCommunityUpdates(): Promise<CommunityUpdate[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'community-updates',
    overrideAccess: false,
    where: { active: { equals: true } },
    sort: '-issuedAt',
    limit: 6,
  })

  return result.docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    type: doc.type,
    message: doc.message,
    issuedAt: doc.issuedAt,
  }))
}

export const getCommunityUpdates = unstable_cache(queryCommunityUpdates, ['community-updates'], {
  revalidate: 900,
  tags: ['community-updates'],
})
