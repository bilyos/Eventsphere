<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { Html5Qrcode } from 'html5-qrcode'
import {
  CheckCircle, XCircle, Users, Ticket,
  Camera, CameraOff, History, AlertTriangle, Wifi, Keyboard,
} from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import { formatDate } from '@/lib/utils'

const route = useRoute()
const store = useTicketsStore()
const events = useEventsStore()
const auth = useAuthStore()

const eventId = route.params.eventId as string
const READER_ID = 'qr-reader'

const scanning = ref(false)
const processing = ref(false)
const manualCode = ref('')
const scanResult = ref<null | { success: boolean; name: string; ticketType: string; message: string }>(null)
const recentScans = ref<{ name: string; type: string; time: string; success: boolean; reason?: string }[]>([])

let scanner: Html5Qrcode | null = null
let lastCode = ''
let lastCodeAt = 0
let resultTimer: ReturnType<typeof setTimeout> | null = null

const totalTickets = computed(() => store.eventTickets.length)
const totalScanned = computed(() => store.eventTickets.filter(t => t.status === 'used').length)
const checkInRate = computed(() =>
  totalTickets.value ? Math.round((totalScanned.value / totalTickets.value) * 100) : 0,
)
const eventTitle = computed(() => events.currentEvent?.title ?? '')

function showResult(success: boolean, name: string, ticketType: string, message: string) {
  scanResult.value = { success, name, ticketType, message }
  if (resultTimer) clearTimeout(resultTimer)
  resultTimer = setTimeout(() => (scanResult.value = null), 3000)
}

async function handleCode(raw: string) {
  // html5-qrcode déclenche en continu tant que le QR est dans le cadre.
  const now = Date.now()
  if (processing.value) return
  if (raw === lastCode && now - lastCodeAt < 4000) return
  lastCode = raw
  lastCodeAt = now

  if (!auth.user) return
  processing.value = true
  try {
    const result = await store.checkIn(raw, eventId, auth.user.id)
    const name = result.ticket?.attendee?.full_name || result.ticket?.attendee?.email || 'Participant'
    const type = result.ticket?.ticket_type?.name ?? '—'

    if (result.success) {
      showResult(true, name, type, 'Billet validé')
      recentScans.value.unshift({ name, type, time: 'À l\'instant', success: true })
      toast.success('Check-in validé !')
    } else {
      showResult(false, name, type, result.reason ?? 'Billet refusé')
      recentScans.value.unshift({ name, type, time: 'À l\'instant', success: false, reason: result.reason ?? undefined })
      toast.error(result.reason ?? 'Billet refusé')
    }
    recentScans.value = recentScans.value.slice(0, 20)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de validation'
    showResult(false, 'Erreur', '—', message)
    toast.error(message)
  } finally {
    processing.value = false
  }
}

async function startScanner() {
  try {
    scanner = new Html5Qrcode(READER_ID)
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      decoded => void handleCode(decoded),
      () => {
        // Aucune correspondance sur cette frame : cas normal, on ignore.
      },
    )
    scanning.value = true
  } catch (err: unknown) {
    scanning.value = false
    scanner = null
    toast.error(
      err instanceof Error
        ? `Caméra indisponible : ${err.message}`
        : 'Impossible d\'accéder à la caméra',
    )
  }
}

async function stopScanner() {
  if (!scanner) return
  try {
    await scanner.stop()
    scanner.clear()
  } catch {
    // le scanner était déjà arrêté
  }
  scanner = null
  scanning.value = false
}

async function toggleScanner() {
  if (scanning.value) await stopScanner()
  else await startScanner()
}

async function submitManualCode() {
  if (!manualCode.value.trim()) return
  await handleCode(manualCode.value)
  manualCode.value = ''
}

async function loadHistory() {
  await store.fetchEventTickets(eventId)
  recentScans.value = store.eventTickets
    .filter(t => t.status === 'used' && t.checked_in_at)
    .sort((a, b) => (b.checked_in_at ?? '').localeCompare(a.checked_in_at ?? ''))
    .slice(0, 20)
    .map(t => ({
      name: t.attendee?.full_name || t.attendee?.email || 'Participant',
      type: t.ticket_type?.name ?? '—',
      time: formatDate(t.checked_in_at as string, 'relative'),
      success: true,
    }))
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  await Promise.all([events.fetchEvent(eventId), loadHistory()])
})

onUnmounted(() => {
  if (resultTimer) clearTimeout(resultTimer)
  void stopScanner()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-surface-900">Check-in en direct</h1>
      <p class="text-surface-500 mt-1 flex items-center gap-2">
        <Wifi class="w-4 h-4 text-emerald-500" /> {{ eventTitle || 'Chargement…' }}
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
        <p class="text-3xl font-bold text-surface-900">{{ checkInRate }}%</p>
        <p class="text-sm text-surface-500">Taux check-in</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Scanner -->
      <div class="card-premium p-6">
        <h2 class="text-lg font-bold text-surface-900 mb-4">Scanner QR</h2>

        <div class="relative aspect-square max-w-sm mx-auto bg-surface-900 rounded-2xl overflow-hidden mb-6">
          <!-- html5-qrcode injecte le flux vidéo ici -->
          <div :id="READER_ID" class="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

          <div v-if="!scanning" class="absolute inset-0 flex flex-col items-center justify-center text-white/50">
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

        <!-- Saisie manuelle : indispensable si la caméra est refusée -->
        <form @submit.prevent="submitManualCode" class="mt-4 flex gap-2">
          <div class="relative flex-1">
            <Keyboard class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              v-model="manualCode"
              type="text"
              placeholder="Saisir le code du billet"
              class="input-field pl-10 !py-2.5 text-sm"
            />
          </div>
          <button type="submit" :disabled="processing" class="btn-secondary !py-2.5">Valider</button>
        </form>
      </div>

      <!-- Recent scans -->
      <div class="card-premium p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-surface-900 flex items-center gap-2">
            <History class="w-5 h-5 text-surface-400" /> Scans récents
          </h2>
        </div>
        <p v-if="!recentScans.length" class="text-sm text-surface-500 py-8 text-center">
          Aucun check-in pour le moment.
        </p>
        <div class="space-y-3">
          <div v-for="(scan, i) in recentScans" :key="scan.name + scan.time + i" class="flex items-center gap-4 p-3 rounded-xl bg-surface-50">
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
