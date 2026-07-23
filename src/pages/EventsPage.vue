<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Search, MapPin, Calendar, Users, SlidersHorizontal } from 'lucide-vue-next'
import { useEventsStore } from '@/stores/events'
import { formatDate } from '@/lib/utils'
import type { Event } from '@/types'

const store = useEventsStore()
const { events, categories: dbCategories, loading } = storeToRefs(store)

const searchQuery = ref('')
const selectedCategory = ref('')
const showFilters = ref(false)

const categories = computed(() => [
  { id: '', name: 'Toutes' },
  ...dbCategories.value.map(c => ({ id: c.id, name: c.name })),
])

const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop'

/** Projection des événements Supabase vers les champs affichés par la carte. */
const cards = computed(() =>
  events.value.map((e: Event) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.short_description || e.description,
    image: e.banner_url || FALLBACK_BANNER,
    date: formatDate(e.start_date),
    location: [e.venue_name, e.venue_address].filter(Boolean).join(', '),
    price: store.minPrice(e),
    categoryId: e.category_id ?? '',
    categoryLabel: e.category?.name ?? 'Événement',
    attendees: store.soldCount(e),
    capacity: e.capacity,
  })),
)

const filteredEvents = computed(() =>
  cards.value.filter(e => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    const matchesCategory = !selectedCategory.value || e.categoryId === selectedCategory.value
    return matchesSearch && matchesCategory
  }),
)

function formatPrice(price: number) {
  if (price === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF'
}

function fillPercent(attendees: number, capacity: number) {
  if (!capacity) return 0
  return Math.min(100, Math.round((attendees / capacity) * 100))
}

onMounted(async () => {
  await Promise.all([store.fetchCategories(), store.fetchEvents()])
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl lg:text-5xl font-bold text-white mb-4">Explorer les événements</h1>
        <p class="text-lg text-white/60 mb-10 max-w-xl mx-auto">Découvrez des événements incroyables près de chez vous</p>

        <!-- Search bar -->
        <div class="max-w-2xl mx-auto relative">
          <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un événement, un lieu, un artiste..."
            class="w-full pl-14 pr-14 py-4 rounded-2xl bg-white text-surface-900 placeholder:text-surface-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 text-base"
          />
          <button
            @click="showFilters = !showFilters"
            :class="['absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-colors', showFilters ? 'bg-primary-100 text-primary-600' : 'hover:bg-surface-100 text-surface-500']"
          >
            <SlidersHorizontal class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Categories filter -->
      <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          :class="[
            'px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
            selectedCategory === cat.id
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Results count -->
      <p class="text-sm text-surface-500 mb-6">{{ filteredEvents.length }} événement{{ filteredEvents.length > 1 ? 's' : '' }} trouvé{{ filteredEvents.length > 1 ? 's' : '' }}</p>

      <!-- Loading skeletons -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="card-premium overflow-hidden animate-pulse">
          <div class="h-52 bg-surface-100" />
          <div class="p-5 space-y-3">
            <div class="h-5 bg-surface-100 rounded w-3/4" />
            <div class="h-4 bg-surface-100 rounded" />
            <div class="h-4 bg-surface-100 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Events grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="event in filteredEvents"
          :key="event.id"
          :to="`/events/${event.slug}`"
          class="group card-premium overflow-hidden"
        >
          <div class="relative h-52 overflow-hidden">
            <img :src="event.image" :alt="event.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div class="absolute top-3 left-3">
              <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-surface-700">{{ event.categoryLabel }}</span>
            </div>
            <div class="absolute bottom-3 right-3">
              <span :class="['px-3 py-1.5 rounded-full text-xs font-bold', event.price === 0 ? 'bg-emerald-500 text-white' : 'bg-white text-surface-900']">
                {{ formatPrice(event.price) }}
              </span>
            </div>
          </div>
          <div class="p-5">
            <h3 class="font-bold text-surface-900 mb-3 text-lg group-hover:text-primary-600 transition-colors">{{ event.title }}</h3>
            <p class="text-sm text-surface-500 mb-4 line-clamp-2">{{ event.description }}</p>
            <div class="space-y-2 text-sm text-surface-500">
              <div class="flex items-center gap-2"><Calendar class="w-4 h-4 text-primary-500" /> {{ event.date }}</div>
              <div class="flex items-center gap-2"><MapPin class="w-4 h-4 text-primary-500" /><span class="truncate">{{ event.location }}</span></div>
            </div>
            <!-- Fill bar -->
            <div class="mt-4">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="text-surface-500"><Users class="w-3.5 h-3.5 inline mr-1" />{{ event.attendees.toLocaleString() }} / {{ event.capacity.toLocaleString() }}</span>
                <span :class="fillPercent(event.attendees, event.capacity) > 80 ? 'text-amber-600 font-semibold' : 'text-surface-400'">
                  {{ fillPercent(event.attendees, event.capacity) }}%
                </span>
              </div>
              <div class="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="fillPercent(event.attendees, event.capacity) > 80 ? 'bg-amber-500' : 'bg-primary-500'"
                  :style="{ width: fillPercent(event.attendees, event.capacity) + '%' }"
                />
              </div>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && filteredEvents.length === 0" class="text-center py-20">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-6">
          <Search class="w-10 h-10 text-surface-300" />
        </div>
        <h3 class="text-xl font-bold text-surface-900 mb-2">Aucun événement trouvé</h3>
        <p class="text-surface-500 mb-6">Essayez de modifier vos critères de recherche</p>
        <button @click="searchQuery = ''; selectedCategory = ''" class="btn-primary">Réinitialiser les filtres</button>
      </div>
    </div>
  </div>
</template>
