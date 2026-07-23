import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type {
  Event, EventCategory, EventInsert, EventUpdate, TicketType, TicketTypeInsert,
} from '@/types'

const EVENT_SELECT = '*, category:event_categories(*), organizer:profiles!organizer_id(*), ticket_types(*)'

/** Champs du formulaire de création/édition, partagés par CreateEventPage et EditEventPage. */
export interface EventFormValues {
  title: string
  description: string
  categoryId: string | null
  bannerUrl: string
  venue: string
  address: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  capacity: number
  isPublic: boolean
  isFree: boolean
  tags: string
}

export interface TicketTypeFormValues {
  id?: string
  name: string
  price: number
  quantity: number
  description: string
}

/** Combine une date `YYYY-MM-DD` et une heure `HH:mm` en timestamp ISO. */
function toIso(date: string, time: string) {
  return new Date(`${date}T${time || '00:00'}`).toISOString()
}

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const myEvents = ref<Event[]>([])
  const categories = ref<EventCategory[]>([])
  const loading = ref(false)
  const currentEvent = ref<Event | null>(null)

  async function fetchEvents(filters?: {
    category?: string
    search?: string
    limit?: number
  }) {
    loading.value = true
    try {
      let query = supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq('status', 'published')
        .eq('is_public', true)
        .order('start_date', { ascending: true })

      if (filters?.category) query = query.eq('category_id', filters.category)
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`)
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) throw error
      events.value = (data ?? []) as unknown as Event[]
    } finally {
      loading.value = false
    }
  }

  /** Événements de l'organisateur connecté, tous statuts confondus. */
  async function fetchMyEvents(organizerId: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq('organizer_id', organizerId)
        .order('start_date', { ascending: false })
      if (error) throw error
      myEvents.value = (data ?? []) as unknown as Event[]
    } finally {
      loading.value = false
    }
  }

  async function fetchEvent(idOrSlug: string) {
    loading.value = true
    currentEvent.value = null
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq(isUuid ? 'id' : 'slug', idOrSlug)
        .maybeSingle()
      if (error) throw error
      currentEvent.value = (data ?? null) as unknown as Event | null
      return currentEvent.value
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    if (categories.value.length) return categories.value
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('name')
    if (error) throw error
    categories.value = (data ?? []) as EventCategory[]
    return categories.value
  }

  /** Slug unique : ajoute un suffixe tant que le titre est déjà pris. */
  async function buildUniqueSlug(title: string, excludeId?: string) {
    const base = slugify(title) || 'evenement'
    let slug = base
    for (let i = 0; i < 20; i++) {
      let query = supabase.from('events').select('id').eq('slug', slug).limit(1)
      if (excludeId) query = query.neq('id', excludeId)
      const { data, error } = await query
      if (error) throw error
      if (!data?.length) return slug
      slug = `${base}-${Math.random().toString(36).slice(2, 7)}`
    }
    return `${base}-${Date.now()}`
  }

  function formToPayload(form: EventFormValues) {
    return {
      title: form.title.trim(),
      description: form.description,
      short_description: form.description.slice(0, 160) || null,
      category_id: form.categoryId || null,
      banner_url: form.bannerUrl || null,
      venue_name: form.venue,
      venue_address: form.address,
      start_date: toIso(form.startDate, form.startTime),
      end_date: toIso(form.endDate || form.startDate, form.endTime || form.startTime),
      capacity: Number(form.capacity) || 100,
      is_public: form.isPublic,
      is_free: form.isFree,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
  }

  async function createEvent(
    organizerId: string,
    form: EventFormValues,
    ticketTypes: TicketTypeFormValues[],
    status: 'draft' | 'published',
  ) {
    const payload: EventInsert = {
      ...formToPayload(form),
      organizer_id: organizerId,
      slug: await buildUniqueSlug(form.title),
      status,
    }

    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single()
    if (error) throw error

    await replaceTicketTypes(data.id, ticketTypes, form.isFree)
    return data as Event
  }

  async function updateEvent(
    id: string,
    form: EventFormValues,
    ticketTypes: TicketTypeFormValues[],
    status?: 'draft' | 'published' | 'cancelled' | 'completed',
  ) {
    const payload: EventUpdate = {
      ...formToPayload(form),
      slug: await buildUniqueSlug(form.title, id),
      ...(status ? { status } : {}),
    }

    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await replaceTicketTypes(id, ticketTypes, form.isFree)
    return data as Event
  }

  /**
   * Remplace les types de billets d'un événement : met à jour ceux qui existent,
   * insère les nouveaux, supprime ceux retirés du formulaire.
   */
  async function replaceTicketTypes(
    eventId: string,
    ticketTypes: TicketTypeFormValues[],
    isFree: boolean,
  ) {
    const { data: existing, error: readError } = await supabase
      .from('ticket_types')
      .select('id')
      .eq('event_id', eventId)
    if (readError) throw readError

    const keptIds = ticketTypes.map(t => t.id).filter(Boolean) as string[]
    const removed = (existing ?? []).filter(t => !keptIds.includes(t.id)).map(t => t.id)
    if (removed.length) {
      const { error } = await supabase.from('ticket_types').delete().in('id', removed)
      if (error) throw error
    }

    for (const type of ticketTypes) {
      if (!type.name.trim()) continue
      const row = {
        event_id: eventId,
        name: type.name.trim(),
        description: type.description || null,
        price: isFree ? 0 : Number(type.price) || 0,
        quantity: Number(type.quantity) || 0,
      }
      if (type.id) {
        const { error } = await supabase.from('ticket_types').update(row).eq('id', type.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('ticket_types').insert(row satisfies TicketTypeInsert)
        if (error) throw error
      }
    }
  }

  async function updateStatus(id: string, status: 'draft' | 'published' | 'cancelled' | 'completed') {
    const { error } = await supabase.from('events').update({ status }).eq('id', id)
    if (error) throw error
    const local = myEvents.value.find(e => e.id === id)
    if (local) local.status = status
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
    events.value = events.value.filter(e => e.id !== id)
    myEvents.value = myEvents.value.filter(e => e.id !== id)
  }

  /** Upload une bannière dans le bucket `events` et renvoie son URL publique. */
  async function uploadBanner(file: File, organizerId: string) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${organizerId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('events').upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('events').getPublicUrl(path).data.publicUrl
  }

  /** Nombre de billets vendus, dérivé des types de billets chargés. */
  function soldCount(event: Event) {
    return (event.ticket_types ?? []).reduce((sum, t: TicketType) => sum + (t.sold ?? 0), 0)
  }

  /** Revenu brut de l'événement, dérivé des types de billets chargés. */
  function revenue(event: Event) {
    return (event.ticket_types ?? []).reduce((sum, t: TicketType) => sum + (t.sold ?? 0) * Number(t.price ?? 0), 0)
  }

  /** Prix d'entrée le plus bas ; 0 si l'événement est gratuit. */
  function minPrice(event: Event) {
    const prices = (event.ticket_types ?? []).map(t => Number(t.price ?? 0))
    if (event.is_free || !prices.length) return 0
    return Math.min(...prices)
  }

  return {
    events, myEvents, categories, loading, currentEvent,
    fetchEvents, fetchMyEvents, fetchEvent, fetchCategories,
    createEvent, updateEvent, updateStatus, deleteEvent, uploadBanner,
    soldCount, revenue, minPrice,
  }
})
