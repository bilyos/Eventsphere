<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import {
  TrendingUp, Users, Ticket, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, QrCode, Clock,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/lib/utils'
import type { Event, Payment, Ticket as TicketRow } from '@/types'

const store = useEventsStore()
const auth = useAuthStore()

const loading = ref(true)
// shallowRef : ces collections sont remplacées en bloc, et le typage profond de
// `ref` sur ces objets imbriqués dépasse la limite d'instanciation de TypeScript.
const payments = shallowRef<Payment[]>([])
const tickets = shallowRef<TicketRow[]>([])
const checkins = shallowRef<{ scanned_at: string; event_id: string }[]>([])

const myEvents = computed<Event[]>(() => store.myEvents)

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

/** Les 6 derniers mois, du plus ancien au plus récent. */
const lastSixMonths = computed(() => {
  const out: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] })
  }
  return out
})

function monthKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}`
}

const completedPayments = computed<Payment[]>(() => payments.value.filter(p => p.status === 'completed'))

const totalRevenue = computed(() => completedPayments.value.reduce((s, p) => s + Number(p.amount), 0))
const ticketsSold = computed(() => tickets.value.length)
const uniqueAttendees = computed(() => new Set(tickets.value.map(t => t.attendee_id)).size)
const activeEvents = computed(
  () => myEvents.value.filter(e => e.status === 'published' && new Date(e.end_date) >= new Date()).length,
)

/** Variation du mois en cours par rapport au mois précédent. */
function monthOverMonth(values: number[]) {
  const current = values[values.length - 1] ?? 0
  const previous = values[values.length - 2] ?? 0
  if (!previous) return { change: current ? '+100%' : '—', up: current >= 0 }
  const delta = ((current - previous) / previous) * 100
  return { change: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`, up: delta >= 0 }
}

const revenueByMonth = computed(() =>
  lastSixMonths.value.map(m =>
    completedPayments.value
      .filter(p => monthKey(p.created_at) === m.key)
      .reduce((s, p) => s + Number(p.amount), 0),
  ),
)

const ticketsByMonth = computed(() =>
  lastSixMonths.value.map(m => tickets.value.filter(t => monthKey(t.created_at) === m.key).length),
)

const stats = computed(() => {
  const revenueTrend = monthOverMonth(revenueByMonth.value)
  const ticketTrend = monthOverMonth(ticketsByMonth.value)
  return [
    {
      label: 'Revenus totaux',
      value: new Intl.NumberFormat('fr-FR').format(totalRevenue.value) + ' XAF',
      change: revenueTrend.change, up: revenueTrend.up,
      icon: DollarSign, color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Tickets vendus',
      value: ticketsSold.value.toLocaleString('fr-FR'),
      change: ticketTrend.change, up: ticketTrend.up,
      icon: Ticket, color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'Participants',
      value: uniqueAttendees.value.toLocaleString('fr-FR'),
      change: '', up: true,
      icon: Users, color: 'text-cyan-600 bg-cyan-50',
    },
    {
      label: 'Événements actifs',
      value: String(activeEvents.value),
      change: '', up: true,
      icon: Calendar, color: 'text-amber-600 bg-amber-50',
    },
  ]
})

const revenueChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area' as const, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', sparkline: { enabled: false } },
  colors: ['#f97316', '#f59e0b'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2.5 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
  },
  xaxis: {
    categories: lastSixMonths.value.map(m => m.label),
    labels: { style: { colors: '#71717a', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#71717a', fontSize: '12px' },
      formatter: (v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v)),
    },
  },
  grid: { borderColor: '#e4e4e7', strokeDashArray: 4, padding: { left: 8, right: 8 } },
  tooltip: { y: { formatter: (v: number) => v.toLocaleString('fr-FR') } },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', markers: { size: 6, offsetX: -4 } },
}))

const revenueSeries = computed(() => [
  { name: 'Revenus (XAF)', data: revenueByMonth.value },
  { name: 'Billets vendus', data: ticketsByMonth.value },
])

/** Répartition des ventes par type de billet, tous événements confondus. */
const ticketTypeBreakdown = computed(() => {
  const totals = new Map<string, number>()
  for (const t of tickets.value) {
    const name = t.ticket_type?.name ?? 'Autre'
    totals.set(name, (totals.get(name) ?? 0) + 1)
  }
  const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  return { labels: entries.map(e => e[0]), values: entries.map(e => e[1]) }
})

const ticketTypesOptions = computed<ApexOptions>(() => ({
  chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
  colors: ['#f97316', '#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981'],
  labels: ticketTypeBreakdown.value.labels,
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true, label: 'Total', fontSize: '14px', color: '#71717a',
            formatter: (w: { globals: { seriesTotals: number[] } }) =>
              w.globals.seriesTotals.reduce((a, b) => a + b, 0).toString(),
          },
          value: { fontSize: '20px', fontWeight: '700', color: '#18181b' },
        },
      },
    },
  },
  legend: { position: 'bottom', fontSize: '12px', markers: { size: 6, offsetX: -4 } },
  stroke: { width: 3, colors: ['#fff'] },
}))

const ticketTypesSeries = computed(() => ticketTypeBreakdown.value.values)

/** Check-ins des 7 derniers jours. */
const lastSevenDays = computed(() => {
  const out: { key: string; label: string }[] = []
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({ key: d.toISOString().slice(0, 10), label: days[d.getDay()] })
  }
  return out
})

const weeklyCheckinsOptions = computed<ApexOptions>(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  colors: ['#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: lastSevenDays.value.map(d => d.label),
    labels: { style: { colors: '#71717a', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#71717a', fontSize: '12px' } } },
  grid: { borderColor: '#e4e4e7', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => v + ' check-ins' } },
  legend: { show: false },
}))

const weeklyCheckinsSeries = computed(() => [
  {
    name: 'Check-ins',
    data: lastSevenDays.value.map(
      d => checkins.value.filter(c => c.scanned_at.slice(0, 10) === d.key).length,
    ),
  },
])

const recentActivity = computed(() => {
  const fromTickets = tickets.value.slice(0, 6).map(t => ({
    key: `t-${t.id}`,
    at: t.created_at,
    message: `${t.attendee?.full_name || 'Un participant'} a réservé un billet « ${t.ticket_type?.name ?? '—'} »`,
    icon: Ticket,
    color: 'text-primary-600 bg-primary-50',
  }))
  const fromCheckins = checkins.value.slice(0, 6).map((c, i) => ({
    key: `c-${c.event_id}-${i}`,
    at: c.scanned_at,
    message: `Check-in validé sur ${myEvents.value.find(e => e.id === c.event_id)?.title ?? 'un événement'}`,
    icon: QrCode,
    color: 'text-emerald-600 bg-emerald-50',
  }))
  return [...fromTickets, ...fromCheckins]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6)
    .map(a => ({ ...a, time: formatDate(a.at, 'relative') }))
})

const topEvents = computed(() =>
  myEvents.value
    .map(e => ({
      name: e.title,
      sold: store.soldCount(e),
      capacity: e.capacity || 1,
      revenue: new Intl.NumberFormat('fr-FR').format(store.revenue(e)) + ' XAF',
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3),
)

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  if (!auth.user) return
  try {
    await store.fetchMyEvents(auth.user.id)
    const eventIds = myEvents.value.map(e => e.id)
    if (!eventIds.length) return

    const [paymentsRes, ticketsRes, checkinsRes] = await Promise.all([
      supabase.from('payments').select('*').in('event_id', eventIds),
      supabase
        .from('tickets')
        .select('*, ticket_type:ticket_types(*), attendee:profiles!attendee_id(*)')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false }),
      supabase.from('checkins').select('scanned_at, event_id').in('event_id', eventIds),
    ])

    payments.value = (paymentsRes.data ?? []) as unknown as Payment[]
    tickets.value = (ticketsRes.data ?? []) as unknown as TicketRow[]
    checkins.value = checkinsRes.data ?? []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome -->
    <div>
      <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">
        Bonjour{{ auth.profile?.full_name ? ` ${auth.profile.full_name}` : '' }} ! 👋
      </h1>
      <p class="text-surface-500 dark:text-surface-400 mt-1">Voici un aperçu de votre activité.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card-premium p-6">
        <div class="flex items-center justify-between mb-4">
          <div :class="['w-11 h-11 rounded-xl flex items-center justify-center', stat.color]">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <div v-if="stat.change" :class="['flex items-center gap-1 text-xs font-semibold', stat.up ? 'text-emerald-600' : 'text-red-500']">
            <component :is="stat.up ? ArrowUpRight : ArrowDownRight" class="w-3.5 h-3.5" />
            {{ stat.change }}
          </div>
        </div>
        <p class="text-2xl font-bold text-surface-900">{{ stat.value }}</p>
        <p class="text-sm text-surface-500 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Revenue Chart -->
      <div class="lg:col-span-2 card-premium p-6">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-bold text-surface-900">Revenus & Ventes</h2>
          <span class="text-xs text-surface-400">6 derniers mois</span>
        </div>
        <VueApexCharts type="area" height="280" :options="revenueChartOptions" :series="revenueSeries" />
      </div>

      <!-- Ticket Types Donut -->
      <div class="card-premium p-6">
        <h2 class="text-lg font-bold text-surface-900 mb-2">Types de tickets</h2>
        <VueApexCharts type="donut" height="280" :options="ticketTypesOptions" :series="ticketTypesSeries" />
      </div>
    </div>

    <!-- Weekly Check-ins + Activity -->
    <div class="grid lg:grid-cols-5 gap-6">
      <!-- Weekly Check-ins Bar Chart -->
      <div class="lg:col-span-2 card-premium p-6">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-bold text-surface-900">Check-ins</h2>
          <span class="text-xs text-surface-400">Cette semaine</span>
        </div>
        <VueApexCharts type="bar" height="240" :options="weeklyCheckinsOptions" :series="weeklyCheckinsSeries" />
      </div>

      <!-- Recent Activity -->
      <div class="lg:col-span-3 card-premium p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-surface-900">Activité récente</h2>
          <button class="text-sm text-primary-600 font-semibold hover:text-primary-700">Voir tout</button>
        </div>
        <p v-if="!recentActivity.length" class="text-sm text-surface-500 py-6 text-center">
          Aucune activité pour le moment.
        </p>
        <div class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.key" class="flex items-start gap-4">
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', activity.color]">
              <component :is="activity.icon" class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-surface-700">{{ activity.message }}</p>
              <p class="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                <Clock class="w-3 h-3" /> {{ activity.time }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Events -->
    <div class="card-premium p-6">
      <h2 class="text-lg font-bold text-surface-900 mb-6">Top événements</h2>
      <p v-if="!topEvents.length" class="text-sm text-surface-500 py-6 text-center">
        Créez un événement pour voir vos statistiques ici.
      </p>
      <div class="grid sm:grid-cols-3 gap-6">
        <div v-for="(event, i) in topEvents" :key="event.name" class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {{ i + 1 }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-surface-900 truncate">{{ event.name }}</p>
              <p class="text-xs text-surface-500">{{ event.revenue }}</p>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-surface-500">Remplissage</span>
              <span class="text-xs font-semibold text-surface-700">{{ Math.round((event.sold / event.capacity) * 100) }}%</span>
            </div>
            <div class="h-2.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="(event.sold / event.capacity) > 0.8 ? 'bg-emerald-500' : 'bg-primary-500'"
                :style="{ width: Math.round((event.sold / event.capacity) * 100) + '%' }"
              />
            </div>
            <p class="text-xs text-surface-400 mt-1">{{ event.sold }} / {{ event.capacity }} places</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
