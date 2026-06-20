import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Event, EventCategory } from '@/types'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const categories = ref<EventCategory[]>([])
  const loading = ref(false)
  const currentEvent = ref<Event | null>(null)

  async function fetchEvents(filters?: {
    category?: string
    search?: string
    status?: string
    limit?: number
  }) {
    loading.value = true
    try {
      let query = supabase
        .from('events')
        .select('*, category:event_categories(*), organizer:profiles!organizer_id(*), ticket_types(*)')
        .eq('status', 'published')
        .eq('is_public', true)
        .order('start_date', { ascending: true })

      if (filters?.category) query = query.eq('category_id', filters.category)
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`)
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) throw error
      events.value = (data ?? []) as Event[]
    } finally {
      loading.value = false
    }
  }

  async function fetchEvent(idOrSlug: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, category:event_categories(*), organizer:profiles!organizer_id(*), ticket_types(*)')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single()
      if (error) throw error
      currentEvent.value = data as Event
      return data as Event
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('name')
    if (error) throw error
    categories.value = (data ?? []) as EventCategory[]
  }

  async function createEvent(event: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .insert(event as any)
      .select()
      .single()
    if (error) throw error
    return data as Event
  }

  async function updateEvent(id: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Event
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
    events.value = events.value.filter(e => e.id !== id)
  }

  return {
    events, categories, loading, currentEvent,
    fetchEvents, fetchEvent, fetchCategories,
    createEvent, updateEvent, deleteEvent,
  }
})
