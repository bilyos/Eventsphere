<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import {
  MapPin, Tag, DollarSign,
  Globe, Lock, ArrowLeft, ArrowRight, Loader2, Check, Upload,
} from 'lucide-vue-next'
import { useEventsStore, type EventFormValues, type TicketTypeFormValues } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useEventsStore()
const auth = useAuthStore()
const { categories } = storeToRefs(store)

const currentStep = ref(0)
const loading = ref(false)
const uploading = ref(false)
const bannerInput = ref<HTMLInputElement | null>(null)

const steps = [
  { label: 'Informations', icon: Tag },
  { label: 'Date & Lieu', icon: MapPin },
  { label: 'Billetterie', icon: DollarSign },
  { label: 'Publication', icon: Globe },
]

const form = ref<EventFormValues>({
  title: '',
  description: '',
  categoryId: '',
  bannerUrl: '',
  venue: '',
  address: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  capacity: 100,
  isPublic: true,
  isFree: false,
  tags: '',
})

const ticketTypes = ref<TicketTypeFormValues[]>([
  { name: 'Standard', price: 10000, quantity: 100, description: '' },
])

const categoryLabel = computed(
  () => categories.value.find(c => c.id === form.value.categoryId)?.name ?? '',
)

function addTicketType() {
  ticketTypes.value.push({ name: '', price: 0, quantity: 50, description: '' })
}

function removeTicketType(index: number) {
  ticketTypes.value.splice(index, 1)
}

/** Renvoie le message d'erreur de l'étape, ou null si elle est valide. */
function validateStep(step: number): string | null {
  const f = form.value
  if (step === 0) {
    if (!f.title.trim()) return 'Le titre est obligatoire'
    if (!f.categoryId) return 'Choisissez une catégorie'
    if (!f.description.trim()) return 'La description est obligatoire'
  }
  if (step === 1) {
    if (!f.startDate || !f.startTime) return 'La date et l\'heure de début sont obligatoires'
    if (!f.endDate || !f.endTime) return 'La date et l\'heure de fin sont obligatoires'
    if (new Date(`${f.endDate}T${f.endTime}`) <= new Date(`${f.startDate}T${f.startTime}`)) {
      return 'La fin doit être après le début'
    }
    if (!f.venue.trim()) return 'Le nom du lieu est obligatoire'
    if (!f.address.trim()) return 'L\'adresse est obligatoire'
  }
  if (step === 2 && !f.isFree) {
    const valid = ticketTypes.value.filter(t => t.name.trim() && t.quantity > 0)
    if (!valid.length) return 'Ajoutez au moins un type de billet valide'
  }
  return null
}

function nextStep() {
  const error = validateStep(currentStep.value)
  if (error) {
    toast.error(error)
    return
  }
  if (currentStep.value < steps.length - 1) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

async function onBannerSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !auth.user) return
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image trop lourde (5 Mo maximum)')
    return
  }
  uploading.value = true
  try {
    form.value.bannerUrl = await store.uploadBanner(file, auth.user.id)
    toast.success('Bannière téléversée')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Téléversement impossible')
  } finally {
    uploading.value = false
  }
}

async function submit(status: 'draft' | 'published') {
  for (let i = 0; i < steps.length - 1; i++) {
    const error = validateStep(i)
    if (error) {
      currentStep.value = i
      toast.error(error)
      return
    }
  }
  if (!auth.user) {
    toast.error('Vous devez être connecté')
    return
  }

  loading.value = true
  try {
    const types = form.value.isFree
      ? [{ name: 'Entrée libre', price: 0, quantity: form.value.capacity, description: '' }]
      : ticketTypes.value
    await store.createEvent(auth.user.id, form.value, types, status)
    toast.success(status === 'published' ? 'Événement publié !' : 'Brouillon enregistré')
    router.push('/dashboard/events')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Création impossible')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  await store.fetchCategories()
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <div class="flex items-center gap-4">
      <button @click="router.back()" class="p-2 rounded-xl hover:bg-surface-100"><ArrowLeft class="w-5 h-5 text-surface-600" /></button>
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Créer un événement</h1>
        <p class="text-surface-500">Étape {{ currentStep + 1 }} sur {{ steps.length }}</p>
      </div>
    </div>

    <!-- Progress -->
    <div class="flex items-center gap-2">
      <div v-for="(step, index) in steps" :key="step.label" class="flex items-center gap-2 flex-1">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all', index <= currentStep ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-400']">
          <Check v-if="index < currentStep" class="w-4 h-4" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span :class="['text-sm font-medium hidden sm:block', index <= currentStep ? 'text-primary-600' : 'text-surface-400']">{{ step.label }}</span>
        <div v-if="index < steps.length - 1" :class="['flex-1 h-0.5 rounded', index < currentStep ? 'bg-primary-500' : 'bg-surface-200']" />
      </div>
    </div>

    <!-- Step 1: Info -->
    <div v-if="currentStep === 0" class="card-premium p-8 space-y-6">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Titre de l'événement *</label>
        <input v-model="form.title" type="text" placeholder="Ex: Douala Tech Summit 2026" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Catégorie *</label>
        <select v-model="form.categoryId" class="input-field">
          <option value="">Sélectionner une catégorie</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Description *</label>
        <textarea v-model="form.description" rows="5" placeholder="Décrivez votre événement..." class="input-field resize-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Bannière</label>
        <input ref="bannerInput" type="file" accept="image/*" class="hidden" @change="onBannerSelected" />
        <div
          @click="bannerInput?.click()"
          class="border-2 border-dashed border-surface-200 rounded-xl p-10 text-center hover:border-primary-400 transition-colors cursor-pointer"
        >
          <img v-if="form.bannerUrl" :src="form.bannerUrl" alt="" class="max-h-40 mx-auto rounded-lg object-cover mb-3" />
          <Loader2 v-else-if="uploading" class="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" />
          <Upload v-else class="w-8 h-8 text-surface-400 mx-auto mb-3" />
          <p class="text-sm text-surface-500">
            {{ form.bannerUrl ? 'Cliquez pour remplacer l\'image' : 'Cliquez pour choisir une image' }}
          </p>
          <p class="text-xs text-surface-400 mt-1">PNG, JPG jusqu'à 5MB — 1200x600 recommandé</p>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Tags</label>
        <input v-model="form.tags" type="text" placeholder="tech, innovation, networking" class="input-field" />
      </div>
    </div>

    <!-- Step 2: Date & Lieu -->
    <div v-if="currentStep === 1" class="card-premium p-8 space-y-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-2">Date de début *</label>
          <input v-model="form.startDate" type="date" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-2">Heure de début *</label>
          <input v-model="form.startTime" type="time" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-2">Date de fin *</label>
          <input v-model="form.endDate" type="date" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-2">Heure de fin *</label>
          <input v-model="form.endTime" type="time" class="input-field" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Nom du lieu *</label>
        <input v-model="form.venue" type="text" placeholder="Ex: Palais des Congrès" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Adresse *</label>
        <input v-model="form.address" type="text" placeholder="Ex: Boulevard de la Liberté, Douala" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Capacité</label>
        <input v-model.number="form.capacity" type="number" min="1" class="input-field" />
      </div>
    </div>

    <!-- Step 3: Tickets -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="card-premium p-6">
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.isFree" type="checkbox" class="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          <div>
            <span class="font-semibold text-surface-900">Événement gratuit</span>
            <p class="text-xs text-surface-500">Aucun paiement requis pour participer</p>
          </div>
        </label>
      </div>

      <template v-if="!form.isFree">
        <div v-for="(ticket, index) in ticketTypes" :key="index" class="card-premium p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-surface-900">Type de billet {{ index + 1 }}</h3>
            <button v-if="ticketTypes.length > 1" @click="removeTicketType(index)" class="text-xs text-red-600 hover:text-red-700 font-medium">Supprimer</button>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Nom *</label>
              <input v-model="ticket.name" type="text" placeholder="Ex: VIP, Standard" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Prix (XAF) *</label>
              <input v-model.number="ticket.price" type="number" min="0" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Quantité *</label>
              <input v-model.number="ticket.quantity" type="number" min="1" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Description</label>
              <input v-model="ticket.description" type="text" placeholder="Avantages inclus..." class="input-field" />
            </div>
          </div>
        </div>
        <button @click="addTicketType" class="btn-secondary w-full">+ Ajouter un type de billet</button>
      </template>
    </div>

    <!-- Step 4: Publish -->
    <div v-if="currentStep === 3" class="card-premium p-8 space-y-6">
      <div>
        <h3 class="font-bold text-surface-900 mb-4">Visibilité</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <button @click="form.isPublic = true" :class="['p-5 rounded-xl border-2 text-left transition-all', form.isPublic ? 'border-primary-500 bg-primary-50' : 'border-surface-100']">
            <Globe class="w-6 h-6 text-primary-600 mb-2" />
            <p class="font-semibold text-surface-900">Public</p>
            <p class="text-xs text-surface-500 mt-1">Visible par tout le monde</p>
          </button>
          <button @click="form.isPublic = false" :class="['p-5 rounded-xl border-2 text-left transition-all', !form.isPublic ? 'border-primary-500 bg-primary-50' : 'border-surface-100']">
            <Lock class="w-6 h-6 text-surface-600 mb-2" />
            <p class="font-semibold text-surface-900">Privé</p>
            <p class="text-xs text-surface-500 mt-1">Accessible par lien uniquement</p>
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-surface-50 rounded-xl p-6">
        <h3 class="font-bold text-surface-900 mb-4">Résumé</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between"><dt class="text-surface-500">Titre</dt><dd class="font-medium text-surface-900">{{ form.title || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Catégorie</dt><dd class="font-medium text-surface-900">{{ categoryLabel || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Date</dt><dd class="font-medium text-surface-900">{{ form.startDate || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Lieu</dt><dd class="font-medium text-surface-900">{{ form.venue || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Capacité</dt><dd class="font-medium text-surface-900">{{ form.capacity }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Gratuit</dt><dd class="font-medium text-surface-900">{{ form.isFree ? 'Oui' : 'Non' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">Visibilité</dt><dd class="font-medium text-surface-900">{{ form.isPublic ? 'Public' : 'Privé' }}</dd></div>
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
      <div v-else class="flex items-center gap-3">
        <button @click="submit('draft')" :disabled="loading" class="btn-secondary">
          Enregistrer en brouillon
        </button>
        <button @click="submit('published')" :disabled="loading" class="btn-primary">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <template v-else><Check class="w-4 h-4" /> Publier l'événement</template>
        </button>
      </div>
    </div>
  </div>
</template>
