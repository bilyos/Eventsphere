<script setup lang="ts">
import { ref } from 'vue'
import { Search, Calendar, Eye, MoreVertical } from 'lucide-vue-next'

const events = ref([
  { id: '1', title: 'Douala Tech Summit 2026', organizer: 'TechCam Events', status: 'published', attendees: 1250, revenue: '1 200 000 XAF', date: '15 Juil 2026' },
  { id: '2', title: 'Afro Music Festival', organizer: 'AfroBeats Prod', status: 'published', attendees: 5000, revenue: '850 000 XAF', date: '22 Juil 2026' },
  { id: '3', title: 'Startup Weekend', organizer: 'Startup237', status: 'draft', attendees: 0, revenue: '0 XAF', date: '5 Août 2026' },
])

const statusColors: Record<string, string> = { published: 'bg-emerald-100 text-emerald-700', draft: 'bg-surface-100 text-surface-600', cancelled: 'bg-red-100 text-red-700' }
const statusLabels: Record<string, string> = { published: 'Publié', draft: 'Brouillon', cancelled: 'Annulé' }
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-surface-900">Gestion événements</h1>
      <p class="text-surface-500 mt-1">Tous les événements de la plateforme</p>
    </div>
    <div class="relative max-w-md">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input type="text" placeholder="Rechercher..." class="input-field pl-11 !py-2.5" />
    </div>
    <div class="card-premium overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Événement</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden sm:table-cell">Organisateur</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4">Statut</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden md:table-cell">Revenus</th>
              <th class="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.id" class="border-b border-surface-50 hover:bg-surface-50">
              <td class="px-6 py-4">
                <p class="font-medium text-surface-900">{{ event.title }}</p>
                <p class="text-xs text-surface-500 flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ event.date }}</p>
              </td>
              <td class="px-4 py-4 hidden sm:table-cell text-sm text-surface-600">{{ event.organizer }}</td>
              <td class="px-4 py-4"><span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', statusColors[event.status]]">{{ statusLabels[event.status] }}</span></td>
              <td class="px-4 py-4 hidden md:table-cell text-sm font-semibold text-surface-900">{{ event.revenue }}</td>
              <td class="px-4 py-4"><button class="p-2 rounded-lg hover:bg-surface-100"><MoreVertical class="w-4 h-4 text-surface-400" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
