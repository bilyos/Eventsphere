<script setup lang="ts">
import { computed, onMounted, shallowRef, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Users, Calendar, DollarSign, Ticket, Shield } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types'

const loading = ref(true)
const recentUsers = shallowRef<Profile[]>([])
const counts = ref({ users: 0, events: 0, tickets: 0, revenue: 0 })

const stats = computed(() => [
  {
    label: 'Utilisateurs total',
    value: counts.value.users.toLocaleString('fr-FR'),
    icon: Users, color: 'text-primary-600 bg-primary-50',
  },
  {
    label: 'Événements total',
    value: counts.value.events.toLocaleString('fr-FR'),
    icon: Calendar, color: 'text-cyan-600 bg-cyan-50',
  },
  {
    label: 'Revenus plateforme',
    value: new Intl.NumberFormat('fr-FR').format(counts.value.revenue) + ' XAF',
    icon: DollarSign, color: 'text-emerald-600 bg-emerald-50',
  },
  {
    label: 'Billets vendus',
    value: counts.value.tickets.toLocaleString('fr-FR'),
    icon: Ticket, color: 'text-amber-600 bg-amber-50',
  },
])

const roleLabels: Record<string, string> = { organizer: 'Organisateur', attendee: 'Participant', staff: 'Staff', admin: 'Admin' }
const roleColors: Record<string, string> = { organizer: 'bg-primary-100 text-primary-700', attendee: 'bg-surface-100 text-surface-700', staff: 'bg-cyan-100 text-cyan-700', admin: 'bg-red-100 text-red-700' }

onMounted(async () => {
  try {
    const [usersRes, eventsRes, ticketsRes, paymentsRes, recentRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('tickets').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'completed'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(8),
    ])

    counts.value = {
      users: usersRes.count ?? 0,
      events: eventsRes.count ?? 0,
      tickets: ticketsRes.count ?? 0,
      revenue: (paymentsRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0),
    }
    recentUsers.value = (recentRes.data ?? []) as Profile[]
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <Shield class="w-7 h-7 text-primary-600" />
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Administration</h1>
        <p class="text-surface-500">Vue d'ensemble de la plateforme</p>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card-premium p-6">
        <div class="flex items-center justify-between mb-4">
          <div :class="['w-11 h-11 rounded-xl flex items-center justify-center', stat.color]">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
        </div>
        <p class="text-2xl font-bold text-surface-900">{{ loading ? '…' : stat.value }}</p>
        <p class="text-sm text-surface-500 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <div class="card-premium p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-surface-900">Derniers utilisateurs inscrits</h2>
        <RouterLink to="/admin/users" class="text-sm text-primary-600 font-semibold hover:text-primary-700">
          Tout voir
        </RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-3">Utilisateur</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-3 hidden sm:table-cell">Rôle</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-3 hidden md:table-cell">Inscription</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in recentUsers" :key="user.id" class="border-b border-surface-50 hover:bg-surface-50">
              <td class="px-4 py-3">
                <p class="font-medium text-surface-900">{{ user.full_name || 'Sans nom' }}</p>
                <p class="text-xs text-surface-500">{{ user.email }}</p>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', roleColors[user.role]]">{{ roleLabels[user.role] }}</span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-sm text-surface-500">{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!loading && !recentUsers.length" class="text-sm text-surface-500 py-8 text-center">
        Aucun utilisateur inscrit.
      </p>
    </div>
  </div>
</template>
