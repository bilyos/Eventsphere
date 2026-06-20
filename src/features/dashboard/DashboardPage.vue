<script setup lang="ts">
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import {
  TrendingUp, Users, Ticket, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, QrCode, Clock
} from 'lucide-vue-next'

const stats = ref([
  { label: 'Revenus totaux', value: '2 450 000 XAF', change: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Tickets vendus', value: '1 847', change: '+8.2%', up: true, icon: Ticket, color: 'text-primary-600 bg-primary-50' },
  { label: 'Participants', value: '1 523', change: '+15.3%', up: true, icon: Users, color: 'text-cyan-600 bg-cyan-50' },
  { label: 'Événements actifs', value: '12', change: '-2', up: false, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
])

const revenueChartOptions = computed(() => ({
  chart: { type: 'area' as const, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', sparkline: { enabled: false } },
  colors: ['#f97316', '#f59e0b'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2.5 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
  },
  xaxis: {
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    labels: { style: { colors: '#71717a', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#71717a', fontSize: '12px' },
      formatter: (v: number) => (v / 1000).toFixed(0) + 'K',
    },
  },
  grid: { borderColor: '#e4e4e7', strokeDashArray: 4, padding: { left: 8, right: 8 } },
  tooltip: {
    y: { formatter: (v: number) => v.toLocaleString('fr-FR') + ' XAF' },
  },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', markers: { size: 6, offsetX: -4 } },
}))

const revenueSeries = ref([
  { name: 'Revenus', data: [320000, 450000, 380000, 520000, 610000, 490000] },
  { name: 'Tickets', data: [180000, 220000, 250000, 310000, 380000, 350000] },
])

const ticketTypesOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
  colors: ['#f97316', '#06b6d4', '#ec4899', '#f59e0b'],
  labels: ['Standard', 'VIP', 'Early Bird', 'Groupe'],
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: { show: true, label: 'Total', fontSize: '14px', color: '#71717a',
            formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString()
          },
          value: { fontSize: '20px', fontWeight: '700', color: '#18181b' },
        },
      },
    },
  },
  legend: { position: 'bottom', fontSize: '12px', markers: { size: 6, offsetX: -4 } },
  stroke: { width: 3, colors: ['#fff'] },
}))

const ticketTypesSeries = ref([980, 420, 310, 137])

const weeklyCheckinsOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  colors: ['#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c'],
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: '55%', distributed: true },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    labels: { style: { colors: '#71717a', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#71717a', fontSize: '12px' } } },
  grid: { borderColor: '#e4e4e7', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => v + ' check-ins' } },
  legend: { show: false },
}))

const weeklyCheckinsSeries = ref([{ name: 'Check-ins', data: [45, 68, 52, 89, 112, 186, 143] }])

const recentActivity = ref([
  { type: 'ticket', message: 'Marie Nguemo a acheté 2 tickets VIP pour Douala Tech Summit', time: 'Il y a 3 min', icon: Ticket, color: 'text-primary-600 bg-primary-50' },
  { type: 'checkin', message: 'Jean-Pierre a scanné son QR code à Afro Music Festival', time: 'Il y a 12 min', icon: QrCode, color: 'text-emerald-600 bg-emerald-50' },
  { type: 'event', message: 'Startup Weekend Cameroun a atteint 80% de capacité', time: 'Il y a 25 min', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
  { type: 'ticket', message: 'Aminata Diallo a acheté 1 ticket Standard', time: 'Il y a 1h', icon: Ticket, color: 'text-primary-600 bg-primary-50' },
  { type: 'view', message: 'Gala Étoiles d\'Afrique a reçu 250 vues aujourd\'hui', time: 'Il y a 2h', icon: Eye, color: 'text-cyan-600 bg-cyan-50' },
])

const topEvents = ref([
  { name: 'Douala Tech Summit 2026', sold: 1250, capacity: 2000, revenue: '1 200 000 XAF' },
  { name: 'Afro Music Festival', sold: 5000, capacity: 8000, revenue: '850 000 XAF' },
  { name: 'Gala Étoiles d\'Afrique', sold: 350, capacity: 400, revenue: '400 000 XAF' },
])
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome -->
    <div>
      <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Bonjour ! 👋</h1>
      <p class="text-surface-500 dark:text-surface-400 mt-1">Voici un aperçu de votre activité.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card-premium p-6">
        <div class="flex items-center justify-between mb-4">
          <div :class="['w-11 h-11 rounded-xl flex items-center justify-center', stat.color]">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <div :class="['flex items-center gap-1 text-xs font-semibold', stat.up ? 'text-emerald-600' : 'text-red-500']">
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
        <div class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.message" class="flex items-start gap-4">
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
