export type UserRole = 'organizer' | 'attendee' | 'staff' | 'admin'

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'expired'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type PaymentMethod = 'card' | 'orange_money' | 'mtn_momo' | 'paypal'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  role: UserRole
  bio: string | null
  created_at: string
  updated_at: string
}

export interface EventCategory {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  slug: string
  description: string
  short_description: string | null
  banner_url: string | null
  category_id: string | null
  venue_name: string
  venue_address: string
  latitude: number | null
  longitude: number | null
  start_date: string
  end_date: string
  capacity: number
  is_free: boolean
  is_public: boolean
  status: EventStatus
  tags: string[]
  created_at: string
  updated_at: string
  category?: EventCategory
  organizer?: Profile
  ticket_types?: TicketType[]
  _count?: { attendees: number }
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  currency: string
  quantity: number
  sold: number
  max_per_order: number
  sale_start: string | null
  sale_end: string | null
  is_active: boolean
  created_at: string
}

export interface Ticket {
  id: string
  ticket_type_id: string
  attendee_id: string
  event_id: string
  qr_code: string
  status: TicketStatus
  checked_in_at: string | null
  checked_in_by: string | null
  created_at: string
  ticket_type?: TicketType
  event?: Event
  attendee?: Profile
}

export interface Payment {
  id: string
  user_id: string
  event_id: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  reference: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface CheckIn {
  id: string
  ticket_id: string
  event_id: string
  scanned_by: string
  scanned_at: string
  location: string | null
  ticket?: Ticket
}

export interface GalleryImage {
  id: string
  event_id: string
  url: string
  caption: string | null
  uploaded_by: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  link: string | null
  created_at: string
}

export interface Review {
  id: string
  event_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  user?: Profile
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> }
      event_categories: { Row: EventCategory; Insert: Partial<EventCategory>; Update: Partial<EventCategory> }
      ticket_types: { Row: TicketType; Insert: Partial<TicketType>; Update: Partial<TicketType> }
      tickets: { Row: Ticket; Insert: Partial<Ticket>; Update: Partial<Ticket> }
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> }
      checkins: { Row: CheckIn; Insert: Partial<CheckIn>; Update: Partial<CheckIn> }
      gallery_images: { Row: GalleryImage; Insert: Partial<GalleryImage>; Update: Partial<GalleryImage> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> }
    }
  }
}
