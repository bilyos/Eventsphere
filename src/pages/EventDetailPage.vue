<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Calendar, MapPin, Users, Clock, Share2,
  Ticket, ArrowLeft, Star, CheckCircle,
} from 'lucide-vue-next'
import { useEventsStore } from '@/stores/events'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

const route = useRoute()
const store = useEventsStore()

const loading = ref(true)
const notFound = ref(false)
const rating = ref(0)
const reviewsCount = ref(0)
const selectedTicket = ref<string | null>(null)
const quantity = ref(1)

const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop'
const FALLBACK_AVATAR = 'https://api.dicebear.com/7.x/initials/svg?seed=EventSphere'

function timeRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(start).toLocaleTimeString('fr-FR', opts)} - ${new Date(end).toLocaleTimeString('fr-FR', opts)}`
}

/** Vue d'affichage dérivée de l'événement chargé depuis Supabase. */
const event = computed(() => {
  const e = store.currentEvent
  if (!e) return null
  return {
    id: e.id,
    title: e.title,
    description: e.description || '<p>Aucune description pour cet événement.</p>',
    image: e.banner_url || FALLBACK_BANNER,
    date: formatDate(e.start_date),
    time: timeRange(e.start_date, e.end_date),
    location: [e.venue_name, e.venue_address].filter(Boolean).join(', '),
    category: e.category?.name ?? 'Événement',
    attendees: store.soldCount(e),
    capacity: e.capacity,
    organizer: {
      name: e.organizer?.full_name || 'Organisateur',
      avatar: e.organizer?.avatar_url || FALLBACK_AVATAR,
    },
  }
})

const ticketTypes = computed(() =>
  (store.currentEvent?.ticket_types ?? [])
    .filter(t => t.is_active)
    .map(t => ({
      id: t.id,
      name: t.name,
      price: Number(t.price),
      description: t.description ?? '',
      available: Math.max(0, t.quantity - t.sold),
    })),
)

const maxQuantity = computed(() => {
  const t = ticketTypes.value.find(t => t.id === selectedTicket.value)
  return Math.min(10, t?.available ?? 1)
})

const checkoutTo = computed(() => ({
  path: `/checkout/${event.value?.id ?? ''}`,
  query: { ticket: selectedTicket.value ?? '', qty: String(quantity.value) },
}))

function formatPrice(price: number) {
  if (price === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF'
}

async function share() {
  const url = window.location.href
  if (navigator.share) {
    try {
      await navigator.share({ title: event.value?.title, url })
      return
    } catch {
      // partage annulé par l'utilisateur : on retombe sur le presse-papier
    }
  }
  await navigator.clipboard.writeText(url)
  toast.success('Lien copié dans le presse-papier')
}

async function loadReviews(eventId: string) {
  const { data } = await supabase.from('reviews').select('rating').eq('event_id', eventId)
  reviewsCount.value = data?.length ?? 0
  rating.value = data?.length
    ? Math.round((data.reduce((s, r) => s + r.rating, 0) / data.length) * 10) / 10
    : 0
}

async function load(slug: string) {
  loading.value = true
  notFound.value = false
  selectedTicket.value = null
  quantity.value = 1
  try {
    const found = await store.fetchEvent(slug)
    if (!found) {
      notFound.value = true
      return
    }
    await loadReviews(found.id)
  } catch (err: unknown) {
    notFound.value = true
    toast.error(err instanceof Error ? err.message : 'Impossible de charger cet événement')
  } finally {
    loading.value = false
  }
}

onMounted(() => load(route.params.slug as string))
watch(() => route.params.slug, slug => slug && load(slug as string))
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Loading -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div class="h-[40vh] rounded-2xl bg-surface-100 mb-10" />
      <div class="grid lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-4">
          <div class="h-24 bg-surface-100 rounded-2xl" />
          <div class="h-64 bg-surface-100 rounded-2xl" />
        </div>
        <div class="h-96 bg-surface-100 rounded-2xl" />
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound || !event" class="max-w-2xl mx-auto px-4 py-32 text-center">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-6">
        <Calendar class="w-10 h-10 text-surface-300" />
      </div>
      <h1 class="text-2xl font-bold text-surface-900 mb-2">Événement introuvable</h1>
      <p class="text-surface-500 mb-8">Cet événement n'existe pas ou n'est plus publié.</p>
      <RouterLink to="/events" class="btn-primary">Voir tous les événements</RouterLink>
    </div>

    <template v-else>
      <!-- Banner -->
      <div class="relative h-[40vh] lg:h-[50vh] overflow-hidden">
        <img :src="event.image" :alt="event.title" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div class="absolute top-6 left-6">
          <RouterLink to="/events" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors">
            <ArrowLeft class="w-4 h-4" /> Retour
          </RouterLink>
        </div>
        <div class="absolute top-6 right-6 flex gap-2">
          <button @click="share" class="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors" aria-label="Partager">
            <Share2 class="w-5 h-5" />
          </button>
        </div>
        <div class="absolute bottom-6 left-6 right-6">
          <span class="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-3">{{ event.category }}</span>
          <h1 class="text-3xl lg:text-4xl font-bold text-white">{{ event.title }}</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid lg:grid-cols-3 gap-10">
          <!-- Main content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Info cards -->
            <div class="grid sm:grid-cols-3 gap-4">
              <div class="card-premium p-5 flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center"><Calendar class="w-5 h-5 text-primary-600" /></div>
                <div>
                  <p class="text-xs text-surface-500">Date</p>
                  <p class="font-semibold text-surface-900 text-sm">{{ event.date }}</p>
                </div>
              </div>
              <div class="card-premium p-5 flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center"><Clock class="w-5 h-5 text-primary-500" /></div>
                <div>
                  <p class="text-xs text-surface-500">Horaire</p>
                  <p class="font-semibold text-surface-900 text-sm">{{ event.time }}</p>
                </div>
              </div>
              <div class="card-premium p-5 flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center"><MapPin class="w-5 h-5 text-accent-emerald" /></div>
                <div>
                  <p class="text-xs text-surface-500">Lieu</p>
                  <p class="font-semibold text-surface-900 text-sm">{{ event.location }}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="card-premium p-8">
              <h2 class="text-xl font-bold text-surface-900 mb-4">À propos</h2>
              <div class="prose prose-surface max-w-none text-surface-600 leading-relaxed whitespace-pre-line">{{ event.description }}</div>
            </div>

            <!-- Organizer -->
            <div class="card-premium p-6 flex items-center gap-4">
              <img :src="event.organizer.avatar" class="w-12 h-12 rounded-full object-cover" alt="" />
              <div class="flex-1">
                <p class="text-xs text-surface-500">Organisé par</p>
                <p class="font-semibold text-surface-900">{{ event.organizer.name }}</p>
              </div>
              <div v-if="reviewsCount" class="flex items-center gap-1 text-amber-500">
                <Star class="w-4 h-4 fill-current" />
                <span class="font-semibold text-sm">{{ rating }}</span>
                <span class="text-xs text-surface-400">({{ reviewsCount }})</span>
              </div>
            </div>
          </div>

          <!-- Sidebar - Tickets -->
          <div class="lg:col-span-1">
            <div class="card-premium p-6 sticky top-24">
              <h3 class="text-lg font-bold text-surface-900 mb-1">Choisir un billet</h3>
              <p class="text-sm text-surface-500 mb-6">
                <Users class="w-4 h-4 inline mr-1" />{{ event.attendees.toLocaleString() }} / {{ event.capacity.toLocaleString() }} participants
              </p>

              <p v-if="!ticketTypes.length" class="text-sm text-surface-500 mb-6">
                Aucun billet n'est en vente pour le moment.
              </p>

              <div class="space-y-3 mb-6">
                <button
                  v-for="ticket in ticketTypes"
                  :key="ticket.id"
                  :disabled="ticket.available === 0"
                  @click="selectedTicket = ticket.id; quantity = 1"
                  :class="[
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    ticket.available === 0 ? 'opacity-50 cursor-not-allowed border-surface-100' : '',
                    selectedTicket === ticket.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-surface-100 hover:border-surface-200'
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-surface-900">{{ ticket.name }}</span>
                    <span class="font-bold text-primary-600">{{ formatPrice(ticket.price) }}</span>
                  </div>
                  <p v-if="ticket.description" class="text-xs text-surface-500 mb-2">{{ ticket.description }}</p>
                  <p :class="['text-xs mt-2 font-medium', ticket.available < 20 ? 'text-amber-600' : 'text-surface-400']">
                    <CheckCircle v-if="ticket.available > 0" class="w-3 h-3 inline mr-1" />
                    {{ ticket.available }} places restantes
                  </p>
                </button>
              </div>

              <!-- Quantity -->
              <div v-if="selectedTicket" class="flex items-center justify-between mb-6 p-3 bg-surface-50 rounded-xl">
                <span class="text-sm font-medium text-surface-700">Quantité</span>
                <div class="flex items-center gap-3">
                  <button @click="quantity = Math.max(1, quantity - 1)" class="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100">−</button>
                  <span class="font-bold w-6 text-center">{{ quantity }}</span>
                  <button @click="quantity = Math.min(maxQuantity, quantity + 1)" class="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100">+</button>
                </div>
              </div>

              <RouterLink
                :to="checkoutTo"
                :class="['btn-primary w-full !py-3.5 text-base', !selectedTicket ? 'opacity-50 pointer-events-none' : '']"
              >
                <Ticket class="w-5 h-5" />
                Réserver maintenant
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
