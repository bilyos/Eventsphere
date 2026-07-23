<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { Search, Calendar, Eye, Ban } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Event } from '@/types'

const loading = ref(true)
const saving = ref<string | null>(null)
const searchQuery = ref('')
const rows = shallowRef<Event[]>([])

const events = computed(() =>
  rows.value
    .filter(e => !searchQuery.value || e.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .map(e => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      status: e.status,
      date: formatDate(e.start_date),
      organizer: e.organizer?.full_name || e.organizer?.email || '—',
      sold: (e.ticket_types ?? []).reduce((s, t) => s + t.sold, 0),
      revenue:
        new Intl.NumberFormat('fr-FR').format(
          (e.ticket_types ?? []).reduce((s, t) => s + t.sold * Number(t.price), 0),
        ) + ' XAF',
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

async function cancelEvent(id: string, title: string) {
  if (!confirm(`Annuler « ${title} » ? L'événement ne sera plus visible publiquement.`)) return
  saving.value = id
  try {
    const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
    if (error) throw error
    rows.value = rows.value.map(e => (e.id === id ? { ...e, status: 'cancelled' as const } : e))
    toast.success('Événement annulé')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Annulation impossible')
  } finally {
    saving.value = null
  }
}

onMounted(async () => {
  try {
    // Visible grâce à la policy « Admins voient tous les événements » (migration 0002).
    const { data } = await supabase
      .from('events')
      .select('*, organizer:profiles!organizer_id(*), ticket_types(*)')
      .order('start_date', { ascending: false })
    rows.value = (data ?? []) as unknown as Event[]
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-surface-900">Gestion événements</h1>
      <p class="text-surface-500 mt-1">{{ rows.length }} événement(s) sur la plateforme</p>
    </div>
    <div class="relative max-w-md">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input v-model="searchQuery" type="text" placeholder="Rechercher..." class="input-field pl-11 !py-2.5" />
    </div>
    <div class="card-premium overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Événement</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden sm:table-cell">Organisateur</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4">Statut</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden lg:table-cell">Billets</th>
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
              <td class="px-4 py-4 hidden lg:table-cell text-sm text-surface-600">{{ event.sold }}</td>
              <td class="px-4 py-4 hidden md:table-cell text-sm font-semibold text-surface-900">{{ event.revenue }}</td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-1">
                  <RouterLink :to="`/events/${event.slug}`" class="p-2 rounded-lg hover:bg-surface-100" title="Voir">
                    <Eye class="w-4 h-4 text-surface-400" />
                  </RouterLink>
                  <button
                    v-if="event.status !== 'cancelled'"
                    @click="cancelEvent(event.id, event.title)"
                    :disabled="saving === event.id"
                    class="p-2 rounded-lg hover:bg-red-50"
                    title="Annuler l'événement"
                  >
                    <Ban class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-surface-500">Chargement…</div>
      <div v-else-if="!events.length" class="px-6 py-16 text-center text-sm text-surface-500">
        Aucun événement.
      </div>
    </div>
  </div>
</template>
