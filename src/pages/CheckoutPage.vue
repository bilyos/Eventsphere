<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  CreditCard, Smartphone, Shield, Lock, ArrowLeft,
  CheckCircle, Loader2, Ticket
} from 'lucide-vue-next'

const router = useRouter()
const loading = ref(false)
const paymentMethod = ref<string>('card')
const step = ref<'payment' | 'success'>('payment')

const order = ref({
  event: 'Douala Tech Summit 2026',
  ticket: 'Standard',
  quantity: 1,
  unitPrice: 15000,
  currency: 'XAF',
})

const total = computed(() => order.value.unitPrice * order.value.quantity)

const paymentMethods = [
  { id: 'card', label: 'Carte bancaire', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  { id: 'orange_money', label: 'Orange Money', icon: Smartphone, color: 'text-orange-600 bg-orange-50' },
  { id: 'mtn_momo', label: 'MTN MoMo', icon: Smartphone, color: 'text-yellow-600 bg-yellow-50' },
  { id: 'paypal', label: 'PayPal', icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
]

const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const phoneNumber = ref('')

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF'
}

async function handlePayment() {
  loading.value = true
  await new Promise(r => setTimeout(r, 2000))
  loading.value = false
  step.value = 'success'
  toast.success('Paiement réussi !')
}
</script>

<template>
  <div class="min-h-screen bg-surface-50 py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Back -->
      <button @click="router.back()" class="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-8 font-medium">
        <ArrowLeft class="w-4 h-4" /> Retour
      </button>

      <template v-if="step === 'payment'">
        <h1 class="text-2xl font-bold text-surface-900 mb-8">Finaliser la commande</h1>

        <div class="grid lg:grid-cols-5 gap-8">
          <!-- Payment form -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Payment method -->
            <div class="card-premium p-6">
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
            <div v-if="paymentMethod === 'card'" class="card-premium p-6 space-y-4">
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
            <div v-if="paymentMethod === 'orange_money' || paymentMethod === 'mtn_momo'" class="card-premium p-6">
              <h2 class="text-lg font-bold text-surface-900 mb-4">Numéro {{ paymentMethod === 'orange_money' ? 'Orange' : 'MTN' }}</h2>
              <input v-model="phoneNumber" type="tel" placeholder="+237 6XX XXX XXX" class="input-field" />
              <p class="text-xs text-surface-500 mt-2">Vous recevrez une demande de paiement sur votre téléphone.</p>
            </div>

            <!-- Security note -->
            <div class="flex items-center gap-3 text-sm text-surface-500">
              <Shield class="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p>Paiement sécurisé et chiffré. Vos données ne sont jamais stockées.</p>
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
          <h1 class="text-3xl font-bold text-surface-900 mb-3">Paiement réussi !</h1>
          <p class="text-lg text-surface-500 mb-8">Votre billet a été envoyé par email. Vous pouvez aussi le consulter dans votre dashboard.</p>
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
            <p class="text-xs text-surface-400">Référence: EVS-{{ Date.now().toString(36).toUpperCase() }}</p>
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
