<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { CreditCard, Smartphone, DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/lib/utils'

const store = useTicketsStore()
const auth = useAuthStore()
const { payments: rows, loading } = storeToRefs(store)

const payments = computed(() =>
  rows.value.map(p => ({
    id: p.id,
    event: p.event?.title ?? 'Événement supprimé',
    amount: new Intl.NumberFormat('fr-FR').format(Number(p.amount)) + ' ' + p.currency,
    method: p.method,
    status: p.status,
    date: formatDate(p.created_at),
    reference: p.reference,
  })),
)

const totalSpent = computed(() =>
  rows.value
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0),
)
const pendingCount = computed(() => rows.value.filter(p => p.status === 'pending').length)

const methodLabels: Record<string, string> = { card: 'Carte', orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', paypal: 'PayPal' }
const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: 'Complété', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  pending: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
  failed: { label: 'Échoué', color: 'text-red-600 bg-red-50', icon: XCircle },
  refunded: { label: 'Remboursé', color: 'text-surface-600 bg-surface-100', icon: XCircle },
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  if (auth.user) await store.fetchMyPayments(auth.user.id)
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-surface-900">Paiements</h1>
      <p class="text-surface-500 mt-1">Historique de vos transactions</p>
    </div>

    <!-- Stats -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="card-premium p-6">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3"><DollarSign class="w-5 h-5 text-emerald-600" /></div>
        <p class="text-2xl font-bold text-surface-900">{{ new Intl.NumberFormat('fr-FR').format(totalSpent) }} XAF</p>
        <p class="text-sm text-surface-500">Total dépensé</p>
      </div>
      <div class="card-premium p-6">
        <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3"><CreditCard class="w-5 h-5 text-primary-600" /></div>
        <p class="text-2xl font-bold text-surface-900">{{ payments.length }}</p>
        <p class="text-sm text-surface-500">Transactions</p>
      </div>
      <div class="card-premium p-6">
        <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3"><Clock class="w-5 h-5 text-amber-600" /></div>
        <p class="text-2xl font-bold text-surface-900">{{ pendingCount }}</p>
        <p class="text-sm text-surface-500">En attente</p>
      </div>
    </div>

    <!-- Payments list -->
    <div class="card-premium overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Événement</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4">Montant</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Méthode</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4">Statut</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id" class="border-b border-surface-50 hover:bg-surface-50 transition-colors">
              <td class="px-6 py-4">
                <p class="font-medium text-surface-900">{{ payment.event }}</p>
                <p class="text-xs text-surface-400 font-mono">{{ payment.reference }}</p>
              </td>
              <td class="px-4 py-4 font-bold text-surface-900">{{ payment.amount }}</td>
              <td class="px-4 py-4 hidden sm:table-cell">
                <span class="text-sm text-surface-600 flex items-center gap-1.5">
                  <component :is="payment.method === 'card' ? CreditCard : Smartphone" class="w-4 h-4" />
                  {{ methodLabels[payment.method] }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', statusConfig[payment.status].color]">
                  <component :is="statusConfig[payment.status].icon" class="w-3.5 h-3.5" />
                  {{ statusConfig[payment.status].label }}
                </span>
              </td>
              <td class="px-4 py-4 hidden md:table-cell">
                <span class="text-sm text-surface-500 flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5" /> {{ payment.date }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-surface-500">Chargement…</div>
      <div v-else-if="!payments.length" class="px-6 py-16 text-center">
        <DollarSign class="w-10 h-10 text-surface-300 mx-auto mb-3" />
        <p class="font-semibold text-surface-900 mb-1">Aucune transaction</p>
        <p class="text-sm text-surface-500">Vos achats de billets apparaîtront ici.</p>
      </div>
    </div>
  </div>
</template>
