import type { Access, CollectionConfig } from 'payload'

const staffOnly: Access = ({ req }) => Boolean(req.user)

export const ReportEvidence: CollectionConfig = {
  slug: 'report-evidence',
  admin: {
    group: 'Emergency Response',
    defaultColumns: ['reportReference', 'filename', 'createdAt'],
    useAsTitle: 'reportReference',
  },
  access: {
    create: () => true,
    read: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const reportReference =
          typeof data?.reportReference === 'string' ? data.reportReference.trim() : ''
        if (!reportReference) throw new Error('A report reference is required.')
        const reports = await req.payload.count({
          collection: 'citizen-reports',
          where: { referenceNumber: { equals: reportReference } },
          overrideAccess: true,
        })
        if (reports.totalDocs !== 1) throw new Error('The related report could not be found.')
        return { ...data, reportReference }
      },
    ],
  },
  fields: [
    {
      name: 'reportReference',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
  ],
}
