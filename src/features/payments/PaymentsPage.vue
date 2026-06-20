<script setup lang="ts">
import { ref } from 'vue'
import { CreditCard, Smartphone, DollarSign, ArrowUpRight, Calendar, CheckCircle, Clock, XCircle } from 'lucide-vue-next'

const payments = ref([
  { id: 'PAY-001', event: 'Douala Tech Summit 2026', amount: '50 000 XAF', method: 'card', status: 'completed', date: '10 Jun 2026', reference: 'EVS-PAY-2026-001' },
  { id: 'PAY-002', event: 'Afro Music Festival', amount: '10 000 XAF', method: 'orange_money', status: 'completed', date: '8 Jun 2026', reference: 'EVS-PAY-2026-002' },
  { id: 'PAY-003', event: 'Workshop Python', amount: '5 000 XAF', method: 'mtn_momo', status: 'pending', date: '5 Jun 2026', reference: 'EVS-PAY-2026-003' },
])

const methodLabels: Record<string, string> = { card: 'Carte', orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', paypal: 'PayPal' }
const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: 'Complété', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  pending: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
  failed: { label: 'Échoué', color: 'text-red-600 bg-red-50', icon: XCircle },
}
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
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><DollarSign class="w-5 h-5 text-emerald-600" /></div>
          <div class="flex items-center gap-1 text-xs font-semibold text-emerald-600"><ArrowUpRight class="w-3 h-3" /> +12%</div>
        </div>
        <p class="text-2xl font-bold text-surface-900">65 000 XAF</p>
        <p class="text-sm text-surface-500">Total dépensé</p>
      </div>
      <div class="card-premium p-6">
        <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3"><CreditCard class="w-5 h-5 text-primary-600" /></div>
        <p class="text-2xl font-bold text-surface-900">3</p>
        <p class="text-sm text-surface-500">Transactions</p>
      </div>
      <div class="card-premium p-6">
        <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3"><Clock class="w-5 h-5 text-amber-600" /></div>
        <p class="text-2xl font-bold text-surface-900">1</p>
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
    </div>
  </div>
</template>
