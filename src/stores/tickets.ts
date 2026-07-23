import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { supabase } from '@/lib/supabase'
import { processPayment, generateReference } from '@/lib/payments'
import type { Payment, PaymentMethod, Ticket } from '@/types'

const TICKET_SELECT = `
  *,
  ticket_type:ticket_types(*),
  event:events(*, category:event_categories(*)),
  attendee:profiles!attendee_id(*)
`

/** Code unique imprimé dans le QR d'un billet. */
function generateQrCode() {
  return `EVS-${crypto.randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`
}

/**
 * Le scanner peut renvoyer soit le code brut, soit le JSON encodé par les
 * pages billets. On accepte les deux formes.
 */
export function extractQrCode(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { code?: string }
      if (parsed.code) return parsed.code
    } catch {
      // pas du JSON valide : on retombe sur le texte brut
    }
  }
  return trimmed
}

export interface PurchaseInput {
  eventId: string
  ticketTypeId: string
  quantity: number
  method: PaymentMethod
  phone?: string
  isFree: boolean
}

export const useTicketsStore = defineStore('tickets', () => {
  // shallowRef : listes remplacées en bloc, et le typage profond de `ref` sur
  // ces lignes jointes dépasse la limite d'instanciation de TypeScript.
  const myTickets = shallowRef<Ticket[]>([])
  const eventTickets = shallowRef<Ticket[]>([])
  const payments = shallowRef<Payment[]>([])
  const loading = ref(false)

  async function fetchMyTickets(userId: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(TICKET_SELECT)
        .eq('attendee_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      myTickets.value = (data ?? []) as unknown as Ticket[]
    } finally {
      loading.value = false
    }
  }

  async function fetchTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .eq('id', ticketId)
      .maybeSingle()
    if (error) throw error
    return (data ?? null) as unknown as Ticket | null
  }

  async function fetchEventTickets(eventId: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(TICKET_SELECT)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (error) throw error
      eventTickets.value = (data ?? []) as unknown as Ticket[]
    } finally {
      loading.value = false
    }
  }

  async function fetchMyPayments(userId: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, event:events(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      payments.value = (data ?? []) as unknown as Payment[]
    } finally {
      loading.value = false
    }
  }

  /**
   * Achat d'un ou plusieurs billets.
   *
   * ⚠️ Ces écritures ne sont pas atomiques : sans transaction côté client, un
   * échec après l'insertion du paiement laisse une trace orpheline. Le jour où
   * un vrai PSP sera branché, tout ce bloc doit migrer dans une Edge Function
   * (ou une fonction SQL) déclenchée par le webhook de confirmation.
   */
  async function purchase(userId: string, input: PurchaseInput) {
    const { data: type, error: typeError } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', input.ticketTypeId)
      .single()
    if (typeError) throw typeError

    const available = type.quantity - type.sold
    if (available < input.quantity) {
      throw new Error(`Il ne reste que ${available} place(s) pour ce type de billet`)
    }

    const unitPrice = input.isFree ? 0 : Number(type.price)
    const total = unitPrice * input.quantity
    let reference = generateReference()

    if (total > 0) {
      const result = await processPayment({
        method: input.method,
        amount: total,
        currency: type.currency,
        phone: input.phone,
      })
      if (!result.success) throw new Error(result.message ?? 'Paiement refusé')
      reference = result.reference

      // Le statut est écrit une seule fois : il n'existe pas de policy UPDATE
      // sur `payments`, la mise à jour devra venir du webhook côté serveur.
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: userId,
        event_id: input.eventId,
        amount: total,
        currency: type.currency,
        method: input.method,
        status: 'completed',
        reference,
        metadata: { ticket_type_id: input.ticketTypeId, quantity: input.quantity },
      })
      if (paymentError) throw paymentError
    }

    const rows = Array.from({ length: input.quantity }, () => ({
      ticket_type_id: input.ticketTypeId,
      attendee_id: userId,
      event_id: input.eventId,
      qr_code: generateQrCode(),
      status: 'valid' as const,
    }))

    const { data: created, error: ticketError } = await supabase
      .from('tickets')
      .insert(rows)
      .select()
    if (ticketError) throw ticketError

    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Billet confirmé',
      message: `${input.quantity} billet(s) « ${type.name} » réservé(s). Référence ${reference}.`,
      type: 'success',
      link: '/dashboard/tickets',
    })

    return { tickets: (created ?? []) as unknown as Ticket[], reference, total }
  }

  /**
   * Valide un billet scanné : vérifie qu'il appartient à l'événement, qu'il est
   * encore valide, puis le marque `used` et journalise le check-in.
   */
  async function checkIn(rawCode: string, eventId: string, scannedBy: string) {
    const code = extractQrCode(rawCode)

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .eq('qr_code', code)
      .maybeSingle()
    if (error) throw error

    const found = ticket as unknown as Ticket | null
    if (!found) return { success: false, reason: 'Billet inconnu' as const, ticket: null }
    if (found.event_id !== eventId) {
      return { success: false, reason: 'Billet d\'un autre événement' as const, ticket: found }
    }
    if (found.status === 'used') {
      return { success: false, reason: 'Billet déjà scanné' as const, ticket: found }
    }
    if (found.status !== 'valid') {
      return { success: false, reason: 'Billet annulé ou expiré' as const, ticket: found }
    }

    const checkedInAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'used', checked_in_at: checkedInAt, checked_in_by: scannedBy })
      .eq('id', found.id)
    if (updateError) throw updateError

    const { error: checkinError } = await supabase.from('checkins').insert({
      ticket_id: found.id,
      event_id: eventId,
      scanned_by: scannedBy,
      scanned_at: checkedInAt,
    })
    if (checkinError) throw checkinError

    // `eventTickets` est un shallowRef : on remplace le tableau pour notifier.
    eventTickets.value = eventTickets.value.map(t =>
      t.id === found.id ? { ...t, status: 'used' as const, checked_in_at: checkedInAt } : t,
    )

    return { success: true, reason: null, ticket: found }
  }

  return {
    myTickets, eventTickets, payments, loading,
    fetchMyTickets, fetchTicket, fetchEventTickets, fetchMyPayments,
    purchase, checkIn,
  }
})
