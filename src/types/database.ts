// Types de la base Supabase — reflète supabase/schema.sql
// Forme attendue par @supabase/postgrest-js (Tables/Views/Functions/Enums + Relationships)
// Régénérable via : npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      event_categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
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
          status: Database['public']['Enums']['event_status']
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          slug: string
          description?: string
          short_description?: string | null
          banner_url?: string | null
          category_id?: string | null
          venue_name?: string
          venue_address?: string
          latitude?: number | null
          longitude?: number | null
          start_date: string
          end_date: string
          capacity?: number
          is_free?: boolean
          is_public?: boolean
          status?: Database['public']['Enums']['event_status']
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          title?: string
          slug?: string
          description?: string
          short_description?: string | null
          banner_url?: string | null
          category_id?: string | null
          venue_name?: string
          venue_address?: string
          latitude?: number | null
          longitude?: number | null
          start_date?: string
          end_date?: string
          capacity?: number
          is_free?: boolean
          is_public?: boolean
          status?: Database['public']['Enums']['event_status']
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_organizer_id_fkey'
            columns: ['organizer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'event_categories'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_types: {
        Row: {
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
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price?: number
          currency?: string
          quantity?: number
          sold?: number
          max_per_order?: number
          sale_start?: string | null
          sale_end?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          quantity?: number
          sold?: number
          max_per_order?: number
          sale_start?: string | null
          sale_end?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_types_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      tickets: {
        Row: {
          id: string
          ticket_type_id: string
          attendee_id: string
          event_id: string
          qr_code: string
          status: Database['public']['Enums']['ticket_status']
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_type_id: string
          attendee_id: string
          event_id: string
          qr_code: string
          status?: Database['public']['Enums']['ticket_status']
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_type_id?: string
          attendee_id?: string
          event_id?: string
          qr_code?: string
          status?: Database['public']['Enums']['ticket_status']
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tickets_ticket_type_id_fkey'
            columns: ['ticket_type_id']
            isOneToOne: false
            referencedRelation: 'ticket_types'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_attendee_id_fkey'
            columns: ['attendee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_checked_in_by_fkey'
            columns: ['checked_in_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          event_id: string
          amount: number
          currency: string
          method: Database['public']['Enums']['payment_method']
          status: Database['public']['Enums']['payment_status']
          reference: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          amount: number
          currency?: string
          method: Database['public']['Enums']['payment_method']
          status?: Database['public']['Enums']['payment_status']
          reference: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          amount?: number
          currency?: string
          method?: Database['public']['Enums']['payment_method']
          status?: Database['public']['Enums']['payment_status']
          reference?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      checkins: {
        Row: {
          id: string
          ticket_id: string
          event_id: string
          scanned_by: string
          scanned_at: string
          location: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          event_id: string
          scanned_by: string
          scanned_at?: string
          location?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          event_id?: string
          scanned_by?: string
          scanned_at?: string
          location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'checkins_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checkins_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checkins_scanned_by_fkey'
            columns: ['scanned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      gallery_images: {
        Row: {
          id: string
          event_id: string
          url: string
          caption: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          url: string
          caption?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          url?: string
          caption?: string | null
          uploaded_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gallery_images_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gallery_images_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: Database['public']['Enums']['notification_type']
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: Database['public']['Enums']['notification_type']
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: Database['public']['Enums']['notification_type']
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          event_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      user_role: 'attendee' | 'organizer' | 'staff' | 'admin'
      event_status: 'draft' | 'published' | 'cancelled' | 'completed'
      ticket_status: 'valid' | 'used' | 'cancelled' | 'expired'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      payment_method: 'card' | 'orange_money' | 'mtn_momo' | 'paypal'
      notification_type: 'info' | 'success' | 'warning' | 'error'
    }
    CompositeTypes: Record<never, never>
  }
}
