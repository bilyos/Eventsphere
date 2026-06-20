<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  MapPin, Tag, DollarSign,
  Globe, Lock, ArrowLeft, ArrowRight, Loader2, Check, Upload, Trash2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const currentStep = ref(0)
const loading = ref(false)

const steps = [
  { label: 'Informations', icon: Tag },
  { label: 'Date & Lieu', icon: MapPin },
  { label: 'Billetterie', icon: DollarSign },
  { label: 'Publication', icon: Globe },
]

const form = ref({
  title: 'Douala Tech Summit 2026',
  description: 'Le plus grand événement tech du Cameroun. Rejoignez plus de 2000 participants pour une journée d\'inspiration, de networking et d\'innovation.',
  category: 'Conférence',
  bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  venue: 'Palais des Congrès',
  address: 'Boulevard de la Liberté, Douala',
  startDate: '2026-07-15',
  startTime: '09:00',
  endDate: '2026-07-15',
  endTime: '18:00',
  capacity: 2000,
  isPublic: true,
  isFree: false,
  tags: 'tech, innovation, networking, startup',
})

const ticketTypes = ref([
  { name: 'Standard', price: 15000, quantity: 1500, description: 'Accès général, déjeuner inclus' },
  { name: 'VIP', price: 50000, quantity: 300, description: 'Accès VIP, déjeuner premium, networking exclusif' },
  { name: 'Early Bird', price: 10000, quantity: 200, description: 'Tarif réduit, places limitées' },
])

function addTicketType() {
  ticketTypes.value.push({ name: '', price: 0, quantity: 50, description: '' })
}

function removeTicketType(index: number) {
  ticketTypes.value.splice(index, 1)
}

function nextStep() {
  if (currentStep.value < steps.length - 1) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

async function handleSave() {
  loading.value = true
  await new Promise(r => setTimeout(r, 1500))
  loading.value = false
  toast.success('Événement mis à jour avec succès !')
  router.push('/dashboard/events')
}

const categories = [
  'Conférence', 'Concert', 'Workshop', 'Gala', 'Sport', 'Art & Culture', 'Networking', 'Formation'
]
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <div class="flex items-center gap-4">
      <button @click="router.back()" class="p-2 rounded-xl hover:bg-surface-100"><ArrowLeft class="w-5 h-5 text-surface-600" /></button>
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Modifier l'événement</h1>
        <p class="text-surface-500">Étape {{ currentStep + 1 }} sur {{ steps.length }}</p>
      </div>
    </div>

    <!-- Progress -->
    <div class="flex items-center gap-2">
      <div v-for="(step, index) in steps" :key="step.label" class="flex items-center gap-2 flex-1">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all', index <= currentStep ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400']">
          <Check v-if="index < currentStep" class="w-4 h-4" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span :class="['text-sm font-medium hidden sm:block', index <= currentStep ? 'text-primary-600' : 'text-surface-400']">{{ step.label }}</span>
        <div v-if="index < steps.length - 1" :class="['flex-1 h-0.5 rounded', index < currentStep ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700']" />
      </div>
    </div>

    <!-- Step 1: Info -->
    <div v-if="currentStep === 0" class="card-premium p-8 space-y-6">
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Titre de l'événement *</label>
        <input v-model="form.title" type="text" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Catégorie *</label>
        <select v-model="form.category" class="input-field">
          <option value="">Sélectionner une catégorie</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Description *</label>
        <textarea v-model="form.description" rows="5" class="input-field resize-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Bannière</label>
        <div v-if="form.bannerUrl" class="relative rounded-xl overflow-hidden">
          <img :src="form.bannerUrl" alt="" class="w-full h-48 object-cover" />
          <button @click="form.bannerUrl = ''" class="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
        <div v-else class="border-2 border-dashed border-surface-200 rounded-xl p-10 text-center hover:border-primary-400 transition-colors cursor-pointer">
          <Upload class="w-8 h-8 text-surface-400 mx-auto mb-3" />
          <p class="text-sm text-surface-500">Glissez une image ou <span class="text-primary-600 font-semibold">parcourez</span></p>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Tags</label>
        <input v-model="form.tags" type="text" class="input-field" />
      </div>
    </div>

    <!-- Step 2: Date & Lieu -->
    <div v-if="currentStep === 1" class="card-premium p-8 space-y-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Date de début *</label>
          <input v-model="form.startDate" type="date" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Heure de début *</label>
          <input v-model="form.startTime" type="time" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Date de fin *</label>
          <input v-model="form.endDate" type="date" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Heure de fin *</label>
          <input v-model="form.endTime" type="time" class="input-field" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Nom du lieu *</label>
        <input v-model="form.venue" type="text" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Adresse *</label>
        <input v-model="form.address" type="text" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Capacité</label>
        <input v-model.number="form.capacity" type="number" min="1" class="input-field" />
      </div>
    </div>

    <!-- Step 3: Tickets -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="card-premium p-6">
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.isFree" type="checkbox" class="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          <div>
            <span class="font-semibold text-surface-900 dark:text-surface-100">Événement gratuit</span>
            <p class="text-xs text-surface-500">Aucun paiement requis pour participer</p>
          </div>
        </label>
      </div>

      <template v-if="!form.isFree">
        <div v-for="(ticket, index) in ticketTypes" :key="index" class="card-premium p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-surface-900 dark:text-surface-100">{{ ticket.name || 'Type ' + (index + 1) }}</h3>
            <button v-if="ticketTypes.length > 1" @click="removeTicketType(index)" class="text-xs text-red-600 hover:text-red-700 font-medium">Supprimer</button>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Nom *</label>
              <input v-model="ticket.name" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Prix (XAF) *</label>
              <input v-model.number="ticket.price" type="number" min="0" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Quantité *</label>
              <input v-model.number="ticket.quantity" type="number" min="1" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Description</label>
              <input v-model="ticket.description" type="text" class="input-field" />
            </div>
          </div>
        </div>
        <button @click="addTicketType" class="btn-secondary w-full">+ Ajouter un type de billet</button>
      </template>
    </div>

    <!-- Step 4: Publish -->
    <div v-if="currentStep === 3" class="card-premium p-8 space-y-6">
      <div>
        <h3 class="font-bold text-surface-900 dark:text-surface-100 mb-4">Visibilité</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <button @click="form.isPublic = true" :class="['p-5 rounded-xl border-2 text-left transition-all', form.isPublic ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-surface-100 dark:border-surface-700']">
            <Globe class="w-6 h-6 text-primary-600 mb-2" />
            <p class="font-semibold text-surface-900 dark:text-surface-100">Public</p>
            <p class="text-xs text-surface-500 mt-1">Visible par tout le monde</p>
          </button>
          <button @click="form.isPublic = false" :class="['p-5 rounded-xl border-2 text-left transition-all', !form.isPublic ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-surface-100 dark:border-surface-700']">
            <Lock class="w-6 h-6 text-surface-600 mb-2" />
            <p class="font-semibold text-surface-900 dark:text-surface-100">Privé</p>
            <p class="text-xs text-surface-500 mt-1">Accessible par lien uniquement</p>
          </button>
        </div>
      </div>

      <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
        <h3 class="font-bold text-surface-900 dark:text-surface-100 mb-4">Résumé</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between"><dt class="text-surface-500">Titre</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ form.title || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Catégorie</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ form.category || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Date</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ form.startDate || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Lieu</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ form.venue || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Capacité</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ form.capacity }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Billets</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ ticketTypes.length }} types</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Visibilité</dt><dd class="font-medium text-surface-900 dark:text-surface-100">{{ form.isPublic ? 'Public' : 'Privé' }}</dd></div>
        </dl>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between pt-4">
      <button v-if="currentStep > 0" @click="prevStep" class="btn-secondary">
        <ArrowLeft class="w-4 h-4" /> Précédent
      </button>
      <div v-else />
      <button v-if="currentStep < steps.length - 1" @click="nextStep" class="btn-primary">
        Suivant <ArrowRight class="w-4 h-4" />
      </button>
      <button v-else @click="handleSave" :disabled="loading" class="btn-primary">
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <template v-else><Check class="w-4 h-4" /> Enregistrer les modifications</template>
      </button>
    </div>
  </div>
</template>
