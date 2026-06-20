<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  Calendar, MapPin, Users, Clock, Share2, Heart,
  Ticket, ArrowLeft, Star, CheckCircle, Globe
} from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const event = ref({
  id: '1',
  title: 'Douala Tech Summit 2026',
  description: `<p>Le Douala Tech Summit est le plus grand événement technologique du Cameroun. Rejoignez plus de 2000 professionnels tech, entrepreneurs et investisseurs pour 3 jours de conférences, workshops et networking.</p>
  <h3>Au programme</h3>
  <ul>
    <li>50+ speakers internationaux</li>
    <li>Workshops pratiques IA, Cloud, Mobile</li>
    <li>Hackathon 24h avec 5M XAF de prix</li>
    <li>Zone exposition startups</li>
    <li>Networking cocktails</li>
  </ul>`,
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
  date: '15 Juillet 2026',
  endDate: '17 Juillet 2026',
  time: '09:00 - 18:00',
  location: 'Palais des Congrès, Douala',
  category: 'Conférence',
  attendees: 1250,
  capacity: 2000,
  organizer: { name: 'TechCam Events', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  rating: 4.8,
  reviewsCount: 124,
  isFavorite: false,
})

const ticketTypes = ref([
  { id: '1', name: 'Standard', price: 15000, currency: 'XAF', description: 'Accès à toutes les conférences', available: 500, perks: ['Accès conférences', 'Kit participant', 'Déjeuner inclus'] },
  { id: '2', name: 'VIP', price: 50000, currency: 'XAF', description: 'Accès VIP complet', available: 80, perks: ['Tout Standard +', 'Places VIP', 'Cocktail privé', 'Meet & Greet speakers'] },
  { id: '3', name: 'Early Bird', price: 10000, currency: 'XAF', description: 'Tarif réduit - places limitées', available: 12, perks: ['Accès conférences', 'Kit participant'] },
])

const selectedTicket = ref<string | null>(null)
const quantity = ref(1)

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF'
}

function toggleFavorite() {
  event.value.isFavorite = !event.value.isFavorite
}
</script>

<template>
  <div class="min-h-screen bg-white">
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
        <button class="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
          <Share2 class="w-5 h-5" />
        </button>
        <button @click="toggleFavorite" :class="['p-2.5 rounded-xl backdrop-blur-sm transition-colors', event.isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30']">
          <Heart class="w-5 h-5" :class="event.isFavorite ? 'fill-current' : ''" />
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
            <div class="prose prose-surface max-w-none text-surface-600 leading-relaxed" v-html="event.description" />
          </div>

          <!-- Organizer -->
          <div class="card-premium p-6 flex items-center gap-4">
            <img :src="event.organizer.avatar" class="w-12 h-12 rounded-full object-cover" alt="" />
            <div class="flex-1">
              <p class="text-xs text-surface-500">Organisé par</p>
              <p class="font-semibold text-surface-900">{{ event.organizer.name }}</p>
            </div>
            <div class="flex items-center gap-1 text-amber-500">
              <Star class="w-4 h-4 fill-current" />
              <span class="font-semibold text-sm">{{ event.rating }}</span>
              <span class="text-xs text-surface-400">({{ event.reviewsCount }})</span>
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

            <div class="space-y-3 mb-6">
              <button
                v-for="ticket in ticketTypes"
                :key="ticket.id"
                @click="selectedTicket = ticket.id"
                :class="[
                  'w-full text-left p-4 rounded-xl border-2 transition-all',
                  selectedTicket === ticket.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-100 hover:border-surface-200'
                ]"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-surface-900">{{ ticket.name }}</span>
                  <span class="font-bold text-primary-600">{{ formatPrice(ticket.price) }}</span>
                </div>
                <p class="text-xs text-surface-500 mb-2">{{ ticket.description }}</p>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="perk in ticket.perks" :key="perk" class="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle class="w-3 h-3" /> {{ perk }}
                  </span>
                </div>
                <p :class="['text-xs mt-2 font-medium', ticket.available < 20 ? 'text-amber-600' : 'text-surface-400']">
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
                <button @click="quantity = Math.min(10, quantity + 1)" class="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100">+</button>
              </div>
            </div>

            <RouterLink
              :to="selectedTicket ? `/checkout/${event.id}` : '#'"
              :class="['btn-primary w-full !py-3.5 text-base', !selectedTicket ? 'opacity-50 pointer-events-none' : '']"
            >
              <Ticket class="w-5 h-5" />
              Réserver maintenant
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
