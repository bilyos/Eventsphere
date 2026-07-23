<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import QRCode from 'qrcode'
import { Ticket, Calendar, MapPin, User, Download, CheckCircle, XCircle, Clock } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/lib/utils'
import type { Ticket as TicketRow } from '@/types'

const route = useRoute()
const store = useTicketsStore()
const auth = useAuthStore()

const loading = ref(true)
const row = ref<TicketRow | null>(null)
const qrDataUrl = ref('')

const statusConfig = {
  valid: { label: 'Valide', color: 'text-emerald-600', icon: CheckCircle },
  used: { label: 'Déjà utilisé', color: 'text-surface-500', icon: Clock },
  cancelled: { label: 'Annulé', color: 'text-red-600', icon: XCircle },
  expired: { label: 'Expiré', color: 'text-amber-600', icon: XCircle },
}

const ticket = computed(() => {
  const t = row.value
  if (!t) return null
  return {
    reference: t.qr_code.slice(0, 12),
    event: t.event?.title ?? 'Événement',
    type: t.ticket_type?.name ?? 'Billet',
    date: t.event ? formatDate(t.event.start_date) : '—',
    time: t.event
      ? new Date(t.event.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '—',
    location: t.event ? [t.event.venue_name, t.event.venue_address].filter(Boolean).join(', ') : '—',
    holder: t.attendee?.full_name || t.attendee?.email || 'Participant',
    status: t.status,
    qrCode: t.qr_code,
  }
})

function downloadTicket() {
  if (!qrDataUrl.value || !ticket.value) return
  const link = document.createElement('a')
  link.download = `${ticket.value.reference}-${ticket.value.event.replace(/\s/g, '_')}.png`
  link.href = qrDataUrl.value
  link.click()
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  try {
    // RLS ne renvoie le billet qu'à son porteur ou à l'organisateur de l'événement.
    row.value = await store.fetchTicket(route.params.ticketId as string)
    if (row.value) {
      qrDataUrl.value = await QRCode.toDataURL(JSON.stringify({ code: row.value.qr_code }), {
        width: 320,
        margin: 2,
        color: { dark: '#18181b', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div v-if="loading" class="card-premium p-16 text-center text-surface-500">
        Chargement du billet…
      </div>

      <div v-else-if="!ticket" class="card-premium p-12 text-center">
        <Ticket class="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h1 class="text-lg font-bold text-surface-900 mb-2">Billet inaccessible</h1>
        <p class="text-sm text-surface-500 mb-6">
          Ce billet n'existe pas, ou vous devez être connecté avec le compte qui l'a réservé.
        </p>
        <RouterLink v-if="!auth.isAuthenticated" to="/auth/login" class="btn-primary">Se connecter</RouterLink>
        <RouterLink v-else to="/dashboard/tickets" class="btn-primary">Voir mes billets</RouterLink>
      </div>

      <div v-else class="card-premium overflow-hidden">
        <!-- Header -->
        <div class="gradient-primary p-6 text-white text-center relative overflow-hidden">
          <div class="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div class="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
          <Ticket class="w-8 h-8 mx-auto mb-3 opacity-80" />
          <h1 class="text-xl font-bold">{{ ticket.event }}</h1>
          <span class="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold">{{ ticket.type }}</span>
        </div>

        <!-- QR Code -->
        <div class="p-8 text-center border-b border-dashed border-surface-200">
          <div class="w-52 h-52 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-card border border-surface-100 p-2">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-full h-full" />
            <div v-else class="animate-pulse w-full h-full bg-surface-100 rounded-xl" />
          </div>
          <p class="text-xs font-mono text-surface-400 mt-4">{{ ticket.qrCode }}</p>
        </div>

        <!-- Details -->
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <Calendar class="w-5 h-5 text-primary-500" />
            <div>
              <p class="text-xs text-surface-500">Date & Heure</p>
              <p class="font-medium text-surface-900">{{ ticket.date }} · {{ ticket.time }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <MapPin class="w-5 h-5 text-primary-500" />
            <div>
              <p class="text-xs text-surface-500">Lieu</p>
              <p class="font-medium text-surface-900">{{ ticket.location }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <User class="w-5 h-5 text-primary-500" />
            <div>
              <p class="text-xs text-surface-500">Participant</p>
              <p class="font-medium text-surface-900">{{ ticket.holder }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <component :is="statusConfig[ticket.status].icon" class="w-5 h-5 text-emerald-500" />
            <div>
              <p class="text-xs text-surface-500">Statut</p>
              <p :class="['font-medium', statusConfig[ticket.status].color]">{{ statusConfig[ticket.status].label }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 pt-0">
          <button class="btn-primary w-full" @click="downloadTicket"><Download class="w-4 h-4" /> Télécharger le QR</button>
        </div>
      </div>
    </div>
  </div>
</template>
