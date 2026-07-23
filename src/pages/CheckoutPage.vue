<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  CreditCard, Smartphone, Shield, Lock, ArrowLeft,
  CheckCircle, Loader2, Ticket,
} from 'lucide-vue-next'
import { useEventsStore } from '@/stores/events'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import type { PaymentMethod } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useEventsStore()
const tickets = useTicketsStore()
const auth = useAuthStore()

const eventId = route.params.eventId as string
const initializing = ref(true)
const loading = ref(false)
const unavailable = ref('')
const step = ref<'payment' | 'success'>('payment')
const paymentMethod = ref<PaymentMethod>('card')
const reference = ref('')

const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const phoneNumber = ref('')

const quantity = ref(Math.max(1, Number(route.query.qty) || 1))
const ticketTypeId = ref((route.query.ticket as string) || '')

const paymentMethods = [
  { id: 'card' as const, label: 'Carte bancaire', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  { id: 'orange_money' as const, label: 'Orange Money', icon: Smartphone, color: 'text-orange-600 bg-orange-50' },
  { id: 'mtn_momo' as const, label: 'MTN MoMo', icon: Smartphone, color: 'text-yellow-600 bg-yellow-50' },
  { id: 'paypal' as const, label: 'PayPal', icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
]

const selectedType = computed(
  () => store.currentEvent?.ticket_types?.find(t => t.id === ticketTypeId.value) ?? null,
)

const order = computed(() => ({
  event: store.currentEvent?.title ?? '',
  ticket: selectedType.value?.name ?? '',
  quantity: quantity.value,
  unitPrice: store.currentEvent?.is_free ? 0 : Number(selectedType.value?.price ?? 0),
  currency: selectedType.value?.currency ?? 'XAF',
}))

const total = computed(() => order.value.unitPrice * order.value.quantity)
const isFree = computed(() => total.value === 0)

function formatPrice(price: number) {
  if (price === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF'
}

async function handlePayment() {
  if (!auth.user) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (!selectedType.value) {
    toast.error('Aucun billet sélectionné')
    return
  }

  loading.value = true
  try {
    const result = await tickets.purchase(auth.user.id, {
      eventId,
      ticketTypeId: ticketTypeId.value,
      quantity: quantity.value,
      method: paymentMethod.value,
      phone: phoneNumber.value,
      isFree: isFree.value,
    })
    reference.value = result.reference
    step.value = 'success'
    toast.success(isFree.value ? 'Billet réservé !' : 'Paiement réussi !')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'La commande a échoué')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  try {
    const event = await store.fetchEvent(eventId)
    if (!event) {
      unavailable.value = 'Événement introuvable'
      return
    }
    const types = event.ticket_types ?? []
    if (!ticketTypeId.value) ticketTypeId.value = types[0]?.id ?? ''
    const type = types.find(t => t.id === ticketTypeId.value)
    if (!type) {
      unavailable.value = 'Ce billet n\'est plus disponible'
      return
    }
    const available = type.quantity - type.sold
    if (available <= 0) {
      unavailable.value = 'Ce type de billet est complet'
      return
    }
    quantity.value = Math.min(quantity.value, available, type.max_per_order)
  } catch (err: unknown) {
    unavailable.value = err instanceof Error ? err.message : 'Chargement impossible'
  } finally {
    initializing.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-50 py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Back -->
      <button @click="router.back()" class="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-8 font-medium">
        <ArrowLeft class="w-4 h-4" /> Retour
      </button>

      <div v-if="initializing" class="card-premium p-16 text-center text-surface-500">
        <Loader2 class="w-6 h-6 mx-auto mb-3 animate-spin text-primary-500" />
        Chargement de la commande…
      </div>

      <div v-else-if="unavailable" class="card-premium p-16 text-center">
        <p class="font-semibold text-surface-900 mb-2">{{ unavailable }}</p>
        <p class="text-sm text-surface-500 mb-6">Choisissez un autre billet ou un autre événement.</p>
        <router-link to="/events" class="btn-primary">Voir les événements</router-link>
      </div>

      <template v-else-if="step === 'payment'">
        <h1 class="text-2xl font-bold text-surface-900 mb-8">Finaliser la commande</h1>

        <div class="grid lg:grid-cols-5 gap-8">
          <!-- Payment form -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Payment method -->
            <div v-if="!isFree" class="card-premium p-6">
              <h2 class="text-lg font-bold text-surface-900 mb-4">Mode de paiement</h2>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  @click="paymentMethod = method.id"
                  :class="[
                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                    paymentMethod === method.id ? 'border-primary-500 bg-primary-50' : 'border-surface-100 hover:border-surface-200'
                  ]"
                >
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', method.color]">
                    <component :is="method.icon" class="w-5 h-5" />
                  </div>
                  <span class="text-sm font-semibold text-surface-900">{{ method.label }}</span>
                </button>
              </div>
            </div>

            <!-- Card form -->
            <div v-if="!isFree && paymentMethod === 'card'" class="card-premium p-6 space-y-4">
              <h2 class="text-lg font-bold text-surface-900 mb-2">Détails de la carte</h2>
              <div>
                <label class="block text-sm font-medium text-surface-700 mb-2">Numéro de carte</label>
                <input v-model="cardNumber" type="text" placeholder="4242 4242 4242 4242" class="input-field" maxlength="19" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-surface-700 mb-2">Expiration</label>
                  <input v-model="cardExpiry" type="text" placeholder="MM/AA" class="input-field" maxlength="5" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-700 mb-2">CVC</label>
                  <input v-model="cardCvc" type="text" placeholder="123" class="input-field" maxlength="3" />
                </div>
              </div>
            </div>

            <!-- Mobile Money form -->
            <div v-if="!isFree && (paymentMethod === 'orange_money' || paymentMethod === 'mtn_momo')" class="card-premium p-6">
              <h2 class="text-lg font-bold text-surface-900 mb-4">Numéro {{ paymentMethod === 'orange_money' ? 'Orange' : 'MTN' }}</h2>
              <input v-model="phoneNumber" type="tel" placeholder="+237 6XX XXX XXX" class="input-field" />
              <p class="text-xs text-surface-500 mt-2">Vous recevrez une demande de paiement sur votre téléphone.</p>
            </div>

            <!-- Security note -->
            <div v-if="!isFree" class="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 rounded-xl p-4">
              <Shield class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p>
                <span class="font-semibold">Mode démonstration :</span> aucun prestataire de paiement
                n'est encore branché. Les informations saisies ici ne sont envoyées nulle part et
                aucun montant n'est débité — seuls la commande et les billets sont réellement
                enregistrés.
              </p>
            </div>
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-2">
            <div class="card-premium p-6 sticky top-24">
              <h2 class="text-lg font-bold text-surface-900 mb-4">Résumé</h2>
              <div class="space-y-3 pb-4 border-b border-surface-100">
                <div class="flex justify-between text-sm">
                  <span class="text-surface-600">{{ order.event }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-surface-500">{{ order.ticket }} x{{ order.quantity }}</span>
                  <span class="font-medium">{{ formatPrice(order.unitPrice) }}</span>
                </div>
              </div>
              <div class="flex justify-between pt-4 mb-6">
                <span class="font-bold text-surface-900">Total</span>
                <span class="font-bold text-xl text-primary-600">{{ formatPrice(total) }}</span>
              </div>
              <button @click="handlePayment" :disabled="loading" class="btn-primary w-full !py-3.5">
                <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
                <template v-else-if="isFree">
                  <Ticket class="w-4 h-4" /> Réserver ma place
                </template>
                <template v-else>
                  <Lock class="w-4 h-4" /> Payer {{ formatPrice(total) }}
                </template>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Success -->
      <template v-if="step === 'success'">
        <div class="max-w-lg mx-auto text-center py-20">
          <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-8 animate-scale-in">
            <CheckCircle class="w-10 h-10 text-emerald-600" />
          </div>
          <h1 class="text-3xl font-bold text-surface-900 mb-3">{{ isFree ? 'Place réservée !' : 'Paiement réussi !' }}</h1>
          <p class="text-lg text-surface-500 mb-8">Retrouvez votre billet et son QR code dans « Mes tickets ».</p>
          <div class="card-premium p-6 mb-8">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Ticket class="w-6 h-6 text-primary-600" />
              </div>
              <div class="text-left">
                <p class="font-bold text-surface-900">{{ order.event }}</p>
                <p class="text-sm text-surface-500">{{ order.ticket }} — {{ formatPrice(total) }}</p>
              </div>
            </div>
            <p class="text-xs text-surface-400">Référence : {{ reference }}</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <router-link to="/dashboard/tickets" class="btn-primary">Voir mes tickets</router-link>
            <router-link to="/events" class="btn-secondary">Explorer d'autres événements</router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
