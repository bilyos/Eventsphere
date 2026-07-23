<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { storeToRefs } from 'pinia'
import { Ticket, Calendar, MapPin, Download, CheckCircle, XCircle, Clock, X } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/lib/utils'

const store = useTicketsStore()
const auth = useAuthStore()
const { myTickets, loading } = storeToRefs(store)

interface TicketCard {
  id: string
  reference: string
  event: string
  type: string
  date: string
  location: string
  status: 'valid' | 'used' | 'cancelled' | 'expired'
  price: string
  qrCode: string
  qrDataUrl?: string
}

const qrCodes = ref<Record<string, string>>({})
const showQrModal = ref(false)
const selectedTicket = ref<TicketCard | null>(null)

const tickets = computed<TicketCard[]>(() =>
  myTickets.value.map(t => ({
    id: t.id,
    reference: t.qr_code.slice(0, 12),
    event: t.event?.title ?? 'Événement',
    type: t.ticket_type?.name ?? 'Billet',
    date: t.event ? formatDate(t.event.start_date) : '—',
    location: t.event ? [t.event.venue_name, t.event.venue_address].filter(Boolean).join(', ') : '—',
    status: t.status,
    price: Number(t.ticket_type?.price ?? 0) === 0
      ? 'Gratuit'
      : new Intl.NumberFormat('fr-FR').format(Number(t.ticket_type?.price)) + ' XAF',
    qrCode: t.qr_code,
    qrDataUrl: qrCodes.value[t.id],
  })),
)

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  valid: { label: 'Valide', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  used: { label: 'Utilisé', color: 'text-surface-500 bg-surface-100', icon: Clock },
  cancelled: { label: 'Annulé', color: 'text-red-600 bg-red-50', icon: XCircle },
  expired: { label: 'Expiré', color: 'text-amber-600 bg-amber-50', icon: XCircle },
}

/** Le QR encode le code du billet : c'est ce que lit le scanner de check-in. */
async function generateQrCodes() {
  for (const t of myTickets.value) {
    if (qrCodes.value[t.id]) continue
    qrCodes.value[t.id] = await QRCode.toDataURL(JSON.stringify({ code: t.qr_code }), {
      width: 280,
      margin: 2,
      color: { dark: '#18181b', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  }
}

function openQr(ticket: TicketCard) {
  selectedTicket.value = ticket
  showQrModal.value = true
}

function closeQr() {
  showQrModal.value = false
  selectedTicket.value = null
}

function downloadTicket(ticket: TicketCard) {
  if (!ticket.qrDataUrl) return
  const link = document.createElement('a')
  link.download = `${ticket.reference}-${ticket.event.replace(/\s/g, '_')}.png`
  link.href = ticket.qrDataUrl
  link.click()
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  if (auth.user) await store.fetchMyTickets(auth.user.id)
})

watch(myTickets, generateQrCodes, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-surface-900">Mes tickets</h1>
      <p class="text-surface-500 mt-1">Consultez et gérez vos billets</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="ticket in tickets" :key="ticket.id" class="card-premium overflow-hidden group">
        <div class="gradient-primary p-5 text-white relative overflow-hidden">
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono opacity-80">{{ ticket.reference }}</span>
            <Ticket class="w-5 h-5 opacity-60" />
          </div>
          <h3 class="font-bold text-lg">{{ ticket.event }}</h3>
          <p class="text-sm text-white/70 mt-1">{{ ticket.type }}</p>
        </div>
        <div class="p-5 space-y-3">
          <div class="flex items-center gap-2 text-sm text-surface-600">
            <Calendar class="w-4 h-4 text-primary-500" /> {{ ticket.date }}
          </div>
          <div class="flex items-center gap-2 text-sm text-surface-600">
            <MapPin class="w-4 h-4 text-primary-500" /> <span class="truncate">{{ ticket.location }}</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-surface-100">
            <div :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', statusConfig[ticket.status].color]">
              <component :is="statusConfig[ticket.status].icon" class="w-3.5 h-3.5" />
              {{ statusConfig[ticket.status].label }}
            </div>
            <span class="font-bold text-surface-900">{{ ticket.price }}</span>
          </div>
          <div class="flex gap-2 pt-2">
            <button class="btn-ghost flex-1 !text-xs !py-2" @click="openQr(ticket)">
              <img v-if="ticket.qrDataUrl" :src="ticket.qrDataUrl" class="w-4 h-4" alt="" />
              QR Code
            </button>
            <button class="btn-ghost flex-1 !text-xs !py-2" @click="downloadTicket(ticket)">
              <Download class="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="card-premium p-16 text-center text-surface-500">Chargement de vos billets…</div>

    <div v-else-if="tickets.length === 0" class="card-premium p-16 text-center">
      <Ticket class="w-12 h-12 text-surface-300 mx-auto mb-4" />
      <h3 class="text-lg font-bold text-surface-900 mb-2">Aucun ticket</h3>
      <p class="text-surface-500 mb-6">Vous n'avez pas encore de billets.</p>
      <router-link to="/events" class="btn-primary">Explorer les événements</router-link>
    </div>

    <!-- QR Code Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showQrModal && selectedTicket" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeQr" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
            <div class="gradient-primary p-6 text-white text-center">
              <button @click="closeQr" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X class="w-4 h-4" />
              </button>
              <h3 class="font-bold text-lg">{{ selectedTicket.event }}</h3>
              <p class="text-white/70 text-sm mt-1">{{ selectedTicket.type }} — {{ selectedTicket.reference }}</p>
            </div>
            <div class="p-8 flex flex-col items-center">
              <div class="bg-white p-3 rounded-xl shadow-card border border-surface-100">
                <img v-if="selectedTicket.qrDataUrl" :src="selectedTicket.qrDataUrl" :alt="selectedTicket.qrCode" class="w-56 h-56" />
              </div>
              <p class="text-xs text-surface-400 mt-4 font-mono">{{ selectedTicket.qrCode }}</p>
              <div class="flex gap-3 mt-6 w-full">
                <button class="btn-secondary flex-1" @click="downloadTicket(selectedTicket)">
                  <Download class="w-4 h-4" /> Télécharger
                </button>
                <button class="btn-primary flex-1" @click="closeQr">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
