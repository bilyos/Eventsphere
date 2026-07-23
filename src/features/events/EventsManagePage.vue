<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { Plus, Search, MoreVertical, Eye, Edit3, Trash2, Calendar, Users, Ticket, Send } from 'lucide-vue-next'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/lib/utils'

const store = useEventsStore()
const auth = useAuthStore()
const { myEvents, loading } = storeToRefs(store)

const searchQuery = ref('')
const activeMenu = ref<string | null>(null)

const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop'

const events = computed(() =>
  myEvents.value
    .filter(e => !searchQuery.value || e.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .map(e => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      status: e.status,
      date: formatDate(e.start_date),
      capacity: e.capacity,
      attendees: store.soldCount(e),
      ticketsSold: store.soldCount(e),
      revenue: new Intl.NumberFormat('fr-FR').format(store.revenue(e)) + ' XAF',
      image: e.banner_url || FALLBACK_BANNER,
    })),
)

const statusColors: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-surface-100 text-surface-600',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  published: 'Publié',
  draft: 'Brouillon',
  cancelled: 'Annulé',
  completed: 'Terminé',
}

async function publish(id: string) {
  activeMenu.value = null
  try {
    await store.updateStatus(id, 'published')
    toast.success('Événement publié')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Publication impossible')
  }
}

async function remove(id: string, title: string) {
  activeMenu.value = null
  if (!confirm(`Supprimer « ${title} » ? Cette action est irréversible.`)) return
  try {
    await store.deleteEvent(id)
    toast.success('Événement supprimé')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Suppression impossible')
  }
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  if (auth.user) await store.fetchMyEvents(auth.user.id)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Mes événements</h1>
        <p class="text-surface-500 mt-1">Gérez et créez vos événements</p>
      </div>
      <RouterLink to="/dashboard/events/create" class="btn-primary">
        <Plus class="w-4 h-4" /> Créer un événement
      </RouterLink>
    </div>

    <!-- Search -->
    <div class="relative max-w-md">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input v-model="searchQuery" type="text" placeholder="Rechercher..." class="input-field pl-11 !py-2.5" />
    </div>

    <!-- Events table -->
    <div class="card-premium overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Événement</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4">Statut</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Date</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden lg:table-cell">Tickets</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden lg:table-cell">Revenus</th>
              <th class="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.id" class="border-b border-surface-50 hover:bg-surface-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <img :src="event.image" class="w-12 h-12 rounded-xl object-cover" :alt="event.title" />
                  <div>
                    <p class="font-semibold text-surface-900">{{ event.title }}</p>
                    <p class="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                      <Users class="w-3 h-3" /> {{ event.attendees }}/{{ event.capacity }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', statusColors[event.status]]">
                  {{ statusLabels[event.status] }}
                </span>
              </td>
              <td class="px-4 py-4 hidden md:table-cell">
                <span class="text-sm text-surface-600 flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5" /> {{ event.date }}</span>
              </td>
              <td class="px-4 py-4 hidden lg:table-cell">
                <span class="text-sm text-surface-600 flex items-center gap-1.5"><Ticket class="w-3.5 h-3.5" /> {{ event.ticketsSold }}</span>
              </td>
              <td class="px-4 py-4 hidden lg:table-cell">
                <span class="text-sm font-semibold text-surface-900">{{ event.revenue }}</span>
              </td>
              <td class="px-4 py-4">
                <div class="relative">
                  <button @click="activeMenu = activeMenu === event.id ? null : event.id" class="p-2 rounded-lg hover:bg-surface-100">
                    <MoreVertical class="w-4 h-4 text-surface-400" />
                  </button>
                  <div v-if="activeMenu === event.id" class="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-surface-100 py-1 z-10" @mouseleave="activeMenu = null">
                    <RouterLink :to="`/events/${event.slug}`" class="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"><Eye class="w-4 h-4" /> Voir</RouterLink>
                    <RouterLink :to="`/dashboard/events/${event.id}/edit`" class="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"><Edit3 class="w-4 h-4" /> Modifier</RouterLink>
                    <RouterLink :to="`/dashboard/checkin/${event.id}`" class="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"><Ticket class="w-4 h-4" /> Check-in</RouterLink>
                    <button v-if="event.status === 'draft'" @click="publish(event.id)" class="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full"><Send class="w-4 h-4" /> Publier</button>
                    <button @click="remove(event.id, event.title)" class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"><Trash2 class="w-4 h-4" /> Supprimer</button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-surface-500">Chargement…</div>
      <div v-else-if="!events.length" class="px-6 py-16 text-center">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Calendar class="w-8 h-8 text-surface-300" />
        </div>
        <p class="font-semibold text-surface-900 mb-1">Aucun événement</p>
        <p class="text-sm text-surface-500 mb-6">Créez votre premier événement pour commencer à vendre des billets.</p>
        <RouterLink to="/dashboard/events/create" class="btn-primary"><Plus class="w-4 h-4" /> Créer un événement</RouterLink>
      </div>
    </div>
  </div>
</template>
