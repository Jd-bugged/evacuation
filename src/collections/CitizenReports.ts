import type { Access, CollectionConfig, FieldAccess } from 'payload'

const staffOnly: Access = ({ req }) => Boolean(req.user)
const staffField: FieldAccess = ({ req }) => Boolean(req.user)

const privateField = {
  read: staffField,
} as const

export const CitizenReports: CollectionConfig = {
  slug: 'citizen-reports',
  admin: {
    group: 'Emergency Response',
    defaultColumns: ['referenceNumber', 'reportType', 'urgency', 'status', 'createdAt'],
    useAsTitle: 'referenceNumber',
  },
  access: {
    create: () => true,
    read: () => true,
    update: staffOnly,
    delete: staffOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create') return data
        const year = new Date().getFullYear()
        const code = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()
        return {
          ...data,
          referenceNumber: `TUM-${year}-${code}`,
          status: 'submitted',
        }
      },
    ],
  },
  fields: [
    {
      name: 'referenceNumber',
      type: 'text',
      unique: true,
      index: true,
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'submitted',
      required: true,
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Verification', value: 'under-verification' },
        { label: 'Response in Progress', value: 'response-in-progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
      access: { create: () => false, update: staffField },
    },
    {
      name: 'reportType',
      type: 'select',
      required: true,
      options: [
        { label: 'Flood Incident', value: 'flood-incident' },
        { label: 'Stranded Individual(s)', value: 'stranded-individuals' },
        { label: 'Emergency Assistance Request', value: 'emergency-assistance' },
        { label: 'Blocked Road or Evacuation Route', value: 'blocked-route' },
        { label: 'Other Flood-Related Concerns', value: 'other' },
      ],
    },
    {
      name: 'urgency',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'High', value: 'high' },
        { label: 'Critical / Life-Threatening', value: 'critical' },
      ],
    },
    { name: 'fullName', type: 'text', access: privateField },
    { name: 'contactNumber', type: 'text', required: true, access: privateField },
    { name: 'exactLocation', type: 'text', required: true, access: privateField },
    { name: 'affectedIndividuals', type: 'number', min: 0, required: true },
    { name: 'description', type: 'textarea', required: true, access: privateField },
    { name: 'latitude', type: 'number', access: privateField },
    { name: 'longitude', type: 'number', access: privateField },
    {
      name: 'strandedDetails',
      type: 'group',
      access: privateField,
      fields: [
        { name: 'children', type: 'number', min: 0, defaultValue: 0 },
        { name: 'seniorCitizens', type: 'number', min: 0, defaultValue: 0 },
        { name: 'personsWithDisabilities', type: 'number', min: 0, defaultValue: 0 },
        { name: 'floodDepth', type: 'text' },
        { name: 'immediateDanger', type: 'checkbox', defaultValue: false },
        { name: 'medicalOrMobilityNeeds', type: 'textarea' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { create: () => false, read: staffField, update: staffField },
    },
  ],
}
