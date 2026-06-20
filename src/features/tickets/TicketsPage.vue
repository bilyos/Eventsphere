<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { Ticket, Calendar, MapPin, Download, CheckCircle, XCircle, Clock, X } from 'lucide-vue-next'

interface TicketItem {
  id: string
  event: string
  type: string
  date: string
  location: string
  status: 'valid' | 'used' | 'cancelled'
  price: string
  qrCode: string
  qrDataUrl?: string
}

const tickets = ref<TicketItem[]>([
  { id: 'TKT-001', event: 'Douala Tech Summit 2026', type: 'VIP', date: '15 Juil 2026', location: 'Palais des Congrès, Douala', status: 'valid', price: '50 000 XAF', qrCode: 'EVS-VIP-001-2026' },
  { id: 'TKT-002', event: 'Afro Music Festival', type: 'Standard', date: '22 Juil 2026', location: 'Stade Omnisports, Yaoundé', status: 'valid', price: '10 000 XAF', qrCode: 'EVS-STD-002-2026' },
  { id: 'TKT-003', event: 'Workshop Python Avancé', type: 'Standard', date: '1 Mar 2026', location: 'Hub Innovation, Douala', status: 'used', price: '5 000 XAF', qrCode: 'EVS-STD-003-2026' },
])

const showQrModal = ref(false)
const selectedTicket = ref<TicketItem | null>(null)

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  valid: { label: 'Valide', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  used: { label: 'Utilisé', color: 'text-surface-500 bg-surface-100', icon: Clock },
  cancelled: { label: 'Annulé', color: 'text-red-600 bg-red-50', icon: XCircle },
}

async function generateQrCodes() {
  for (const ticket of tickets.value) {
    const data = JSON.stringify({
      ticketId: ticket.id,
      code: ticket.qrCode,
      event: ticket.event,
      type: ticket.type,
    })
    ticket.qrDataUrl = await QRCode.toDataURL(data, {
      width: 280,
      margin: 2,
      color: { dark: '#18181b', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  }
}

function openQr(ticket: TicketItem) {
  selectedTicket.value = ticket
  showQrModal.value = true
}

function closeQr() {
  showQrModal.value = false
  selectedTicket.value = null
}

function downloadTicket(ticket: TicketItem) {
  if (!ticket.qrDataUrl) return
  const link = document.createElement('a')
  link.download = `${ticket.id}-${ticket.event.replace(/\s/g, '_')}.png`
  link.href = ticket.qrDataUrl
  link.click()
}

onMounted(generateQrCodes)
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
            <span class="text-xs font-mono opacity-80">{{ ticket.id }}</span>
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

    <div v-if="tickets.length === 0" class="card-premium p-16 text-center">
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
              <p class="text-white/70 text-sm mt-1">{{ selectedTicket.type }} — {{ selectedTicket.id }}</p>
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
