<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  QrCode, CheckCircle, XCircle, Users, Ticket,
  Camera, CameraOff, History, AlertTriangle, Wifi
} from 'lucide-vue-next'

const route = useRoute()
const scanning = ref(false)
const scanResult = ref<null | { success: boolean; name: string; ticketType: string; message: string }>(null)
const totalScanned = ref(847)
const totalTickets = ref(1250)
const recentScans = ref([
  { name: 'Marie Nguemo', type: 'VIP', time: 'Il y a 2 min', success: true },
  { name: 'Jean-Pierre Kamga', type: 'Standard', time: 'Il y a 5 min', success: true },
  { name: 'Ticket #EVS-003', type: 'Standard', time: 'Il y a 8 min', success: false, reason: 'Déjà scanné' },
  { name: 'Aminata Diallo', type: 'VIP', time: 'Il y a 12 min', success: true },
  { name: 'Paul Mbarga', type: 'Standard', time: 'Il y a 15 min', success: true },
])

function toggleScanner() {
  scanning.value = !scanning.value
  if (scanning.value) {
    setTimeout(() => simulateScan(), 3000)
  }
}

function simulateScan() {
  if (!scanning.value) return
  const names = ['Sophie Ekambi', 'David Fotso', 'Claire Ngo', 'Bernard Atangana']
  const types = ['Standard', 'VIP', 'Early Bird']
  const success = Math.random() > 0.2

  scanResult.value = {
    success,
    name: names[Math.floor(Math.random() * names.length)],
    ticketType: types[Math.floor(Math.random() * types.length)],
    message: success ? 'Billet validé avec succès' : 'Billet déjà utilisé',
  }

  if (success) {
    totalScanned.value++
    toast.success('Check-in validé !')
  } else {
    toast.error('Billet invalide')
  }

  recentScans.value.unshift({
    name: scanResult.value.name,
    type: scanResult.value.ticketType,
    time: 'À l\'instant',
    success,
    reason: success ? undefined : 'Déjà scanné',
  })

  setTimeout(() => {
    scanResult.value = null
  }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-surface-900">Check-in en direct</h1>
      <p class="text-surface-500 mt-1 flex items-center gap-2">
        <Wifi class="w-4 h-4 text-emerald-500" /> Temps réel activé
      </p>
    </div>

    <!-- Stats -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="card-premium p-6 text-center">
        <Users class="w-8 h-8 text-primary-600 mx-auto mb-2" />
        <p class="text-3xl font-bold text-surface-900">{{ totalScanned }}</p>
        <p class="text-sm text-surface-500">Scannés</p>
      </div>
      <div class="card-premium p-6 text-center">
        <Ticket class="w-8 h-8 text-primary-500 mx-auto mb-2" />
        <p class="text-3xl font-bold text-surface-900">{{ totalTickets }}</p>
        <p class="text-sm text-surface-500">Total tickets</p>
      </div>
      <div class="card-premium p-6 text-center">
        <CheckCircle class="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p class="text-3xl font-bold text-surface-900">{{ Math.round((totalScanned / totalTickets) * 100) }}%</p>
        <p class="text-sm text-surface-500">Taux check-in</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Scanner -->
      <div class="card-premium p-6">
        <h2 class="text-lg font-bold text-surface-900 mb-4">Scanner QR</h2>

        <div class="relative aspect-square max-w-sm mx-auto bg-surface-900 rounded-2xl overflow-hidden mb-6">
          <div v-if="scanning" class="w-full h-full flex items-center justify-center">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-48 h-48 border-2 border-white/50 rounded-2xl relative">
                <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg" />
                <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-lg" />
                <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-lg" />
                <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-lg" />
                <div class="absolute left-0 right-0 h-0.5 bg-primary-400 animate-[scan_2s_ease-in-out_infinite]" style="animation: scan 2s ease-in-out infinite" />
              </div>
            </div>
            <Camera class="w-10 h-10 text-white/30" />
          </div>
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-white/50">
            <CameraOff class="w-12 h-12 mb-3" />
            <p class="text-sm">Scanner désactivé</p>
          </div>

          <!-- Scan Result Overlay -->
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 scale-90"
            leave-active-class="transition-all duration-300"
            leave-to-class="opacity-0 scale-90"
          >
            <div v-if="scanResult" :class="['absolute inset-0 flex flex-col items-center justify-center', scanResult.success ? 'bg-emerald-600/90' : 'bg-red-600/90']">
              <component :is="scanResult.success ? CheckCircle : XCircle" class="w-16 h-16 text-white mb-4" />
              <p class="text-xl font-bold text-white">{{ scanResult.message }}</p>
              <p class="text-white/80 mt-2">{{ scanResult.name }} — {{ scanResult.ticketType }}</p>
            </div>
          </Transition>
        </div>

        <button @click="toggleScanner" :class="['w-full !py-3.5 text-base', scanning ? 'btn-secondary' : 'btn-primary']">
          <component :is="scanning ? CameraOff : Camera" class="w-5 h-5" />
          {{ scanning ? 'Arrêter le scan' : 'Démarrer le scan' }}
        </button>
      </div>

      <!-- Recent scans -->
      <div class="card-premium p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-surface-900 flex items-center gap-2">
            <History class="w-5 h-5 text-surface-400" /> Scans récents
          </h2>
        </div>
        <div class="space-y-3">
          <div v-for="scan in recentScans" :key="scan.name + scan.time" class="flex items-center gap-4 p-3 rounded-xl bg-surface-50">
            <div :class="['w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', scan.success ? 'bg-emerald-100' : 'bg-red-100']">
              <component :is="scan.success ? CheckCircle : AlertTriangle" :class="['w-4 h-4', scan.success ? 'text-emerald-600' : 'text-red-600']" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-900">{{ scan.name }}</p>
              <p class="text-xs text-surface-500">{{ scan.type }} · {{ scan.time }}</p>
              <p v-if="!scan.success" class="text-xs text-red-500 mt-0.5">{{ scan.reason }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0%, 100% { top: 10%; }
  50% { top: 85%; }
}
</style>
