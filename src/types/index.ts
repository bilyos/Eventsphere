import type { Database } from './database'

export type { Database, Json } from './database'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type UserRole = Enums<'user_role'>
export type EventStatus = Enums<'event_status'>
export type TicketStatus = Enums<'ticket_status'>
export type PaymentStatus = Enums<'payment_status'>
export type PaymentMethod = Enums<'payment_method'>
export type NotificationType = Enums<'notification_type'>

export type Profile = Tables<'profiles'>
export type EventCategory = Tables<'event_categories'>
export type TicketType = Tables<'ticket_types'>
export type GalleryImage = Tables<'gallery_images'>
export type Notification = Tables<'notifications'>

// Les types ci-dessous ajoutent les relations chargées via `select(...)` embarqué
export interface Event extends Tables<'events'> {
  category?: EventCategory | null
  organizer?: Profile | null
  ticket_types?: TicketType[]
  _count?: { attendees: number }
}

export interface Ticket extends Tables<'tickets'> {
  ticket_type?: TicketType | null
  event?: Event | null
  attendee?: Profile | null
}

export interface Payment extends Tables<'payments'> {
  event?: Event | null
}

export interface CheckIn extends Tables<'checkins'> {
  ticket?: Ticket | null
}

export interface Review extends Tables<'reviews'> {
  user?: Profile | null
}

// Payloads d'écriture
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type TicketTypeInsert = Database['public']['Tables']['ticket_types']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
