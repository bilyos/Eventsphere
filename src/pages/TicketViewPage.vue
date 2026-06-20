<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { Ticket, Calendar, MapPin, User, Download, CheckCircle } from 'lucide-vue-next'

const ticket = ref({
  id: 'TKT-001',
  event: 'Douala Tech Summit 2026',
  type: 'VIP',
  date: '15 Juillet 2026',
  time: '09:00 - 18:00',
  location: 'Palais des Congrès, Douala',
  holder: 'Richard Ty',
  status: 'valid',
  qrCode: 'EVS-VIP-001-2026',
})

const qrDataUrl = ref('')

onMounted(async () => {
  const data = JSON.stringify({
    ticketId: ticket.value.id,
    code: ticket.value.qrCode,
    event: ticket.value.event,
    type: ticket.value.type,
  })
  qrDataUrl.value = await QRCode.toDataURL(data, {
    width: 320,
    margin: 2,
    color: { dark: '#18181b', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
})

function downloadTicket() {
  if (!qrDataUrl.value) return
  const link = document.createElement('a')
  link.download = `${ticket.value.id}-${ticket.value.event.replace(/\s/g, '_')}.png`
  link.href = qrDataUrl.value
  link.click()
}
</script>

<template>
  <div class="min-h-screen bg-surface-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="card-premium overflow-hidden">
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
            <CheckCircle class="w-5 h-5 text-emerald-500" />
            <div>
              <p class="text-xs text-surface-500">Statut</p>
              <p class="font-medium text-emerald-600">Valide</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 pt-0">
          <button class="btn-primary w-full" @click="downloadTicket"><Download class="w-4 h-4" /> Télécharger PDF</button>
        </div>
      </div>
    </div>
  </div>
</template>
