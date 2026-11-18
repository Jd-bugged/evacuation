export type RouteStatus = 'clear' | 'caution' | 'blocked'
export type CenterStatus = 'open' | 'pending' | 'closed'

export interface Hotline {
  label: string
  number: string
  tel: string
}

// Sample numbers: replace with the barangay's verified hotlines before launch.
export const HOTLINES: Hotline[] = [
  { label: 'National Emergency', number: '911', tel: '911' },
  { label: 'Marikina Rescue', number: '161', tel: '161' },
  { label: 'Red Cross', number: '143', tel: '143' },
  { label: 'Brgy. Tumana Hall', number: '8 - 646 - 0427', tel: '+63286460427' },
]

export interface Center {
  id: string
  name: string
  address: string
  distanceKm: number
  etaMin: number
  status: CenterStatus
  route: RouteStatus
  routeNote: string
  x: number
  y: number
  path: string
}

// Map coordinates share one 800 x 560 canvas; the user is always at USER.
export const USER = { x: 360, y: 330 }

export const CENTERS: Center[] = [
  {
    id: 'a',
    name: 'Tumana Elementary School',
    address: 'Main Ave., Brgy. Tumana',
    distanceKm: 0.6,
    etaMin: 8,
    status: 'open',
    route: 'clear',
    routeNote: 'Route clear. Higher ground, no flooding reported.',
    x: 210,
    y: 160,
    path: 'M360 330 L360 250 L210 250 L210 176',
  },
]
