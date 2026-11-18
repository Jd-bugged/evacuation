import { revalidateTag } from 'next/cache'
import type { Access, CollectionConfig } from 'payload'

const staffOnly: Access = ({ req }) => Boolean(req.user)

export const CommunityUpdates: CollectionConfig = {
  slug: 'community-updates',
  admin: {
    group: 'Emergency Response',
    defaultColumns: ['title', 'type', 'issuedAt', 'active'],
    useAsTitle: 'title',
  },
  access: {
    create: staffOnly,
    read: () => true,
    update: staffOnly,
    delete: staffOnly,
  },
  hooks: {
    afterChange: [() => revalidateTag('community-updates', 'max')],
    afterDelete: [() => revalidateTag('community-updates', 'max')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Flood Warning', value: 'warning' },
        { label: 'Evacuation', value: 'evacuation' },
        { label: 'Response Update', value: 'response' },
        { label: 'Information', value: 'information' },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    { name: 'issuedAt', type: 'date', required: true },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true },
  ],
}
