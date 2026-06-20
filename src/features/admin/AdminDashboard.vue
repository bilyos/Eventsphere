<script setup lang="ts">
import { ref } from 'vue'
import { Users, Calendar, DollarSign, TrendingUp, ArrowUpRight, Shield, Activity, Eye } from 'lucide-vue-next'

const stats = ref([
  { label: 'Utilisateurs total', value: '12 458', change: '+5.2%', icon: Users, color: 'text-primary-600 bg-primary-50' },
  { label: 'Événements total', value: '3 847', change: '+12%', icon: Calendar, color: 'text-cyan-600 bg-cyan-50' },
  { label: 'Revenus plateforme', value: '24 500 000 XAF', change: '+18%', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Taux de conversion', value: '68%', change: '+3.5%', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
])

const recentUsers = ref([
  { name: 'Marie Nguemo', email: 'marie@example.com', role: 'organizer', joined: '15 Jun 2026' },
  { name: 'Jean-Pierre Kamga', email: 'jp@example.com', role: 'attendee', joined: '14 Jun 2026' },
  { name: 'Aminata Diallo', email: 'aminata@example.com', role: 'organizer', joined: '13 Jun 2026' },
  { name: 'Paul Mbarga', email: 'paul@example.com', role: 'staff', joined: '12 Jun 2026' },
])

const roleLabels: Record<string, string> = { organizer: 'Organisateur', attendee: 'Participant', staff: 'Staff', admin: 'Admin' }
const roleColors: Record<string, string> = { organizer: 'bg-primary-100 text-primary-700', attendee: 'bg-surface-100 text-surface-700', staff: 'bg-cyan-100 text-cyan-700', admin: 'bg-red-100 text-red-700' }
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
          <span class="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight class="w-3.5 h-3.5" /> {{ stat.change }}
          </span>
        </div>
        <p class="text-2xl font-bold text-surface-900">{{ stat.value }}</p>
        <p class="text-sm text-surface-500 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <div class="card-premium p-6">
      <h2 class="text-lg font-bold text-surface-900 mb-4">Derniers utilisateurs inscrits</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-3">Utilisateur</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-3 hidden sm:table-cell">Rôle</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-3 hidden md:table-cell">Inscription</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in recentUsers" :key="user.email" class="border-b border-surface-50 hover:bg-surface-50">
              <td class="px-4 py-3">
                <p class="font-medium text-surface-900">{{ user.name }}</p>
                <p class="text-xs text-surface-500">{{ user.email }}</p>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', roleColors[user.role]]">{{ roleLabels[user.role] }}</span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-sm text-surface-500">{{ user.joined }}</td>
              <td class="px-4 py-3">
                <button class="p-2 rounded-lg hover:bg-surface-100"><Eye class="w-4 h-4 text-surface-400" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
