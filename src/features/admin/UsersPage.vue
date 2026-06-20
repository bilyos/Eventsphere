<script setup lang="ts">
import { ref } from 'vue'
import { Search, Users, MoreVertical, Eye, Shield, Trash2 } from 'lucide-vue-next'

const users = ref([
  { id: '1', name: 'Marie Nguemo', email: 'marie@example.com', role: 'organizer', events: 5, status: 'active', joined: '10 Jan 2026' },
  { id: '2', name: 'Jean-Pierre Kamga', email: 'jp@example.com', role: 'attendee', events: 0, status: 'active', joined: '15 Mar 2026' },
  { id: '3', name: 'Aminata Diallo', email: 'aminata@example.com', role: 'organizer', events: 12, status: 'active', joined: '5 Fev 2026' },
  { id: '4', name: 'Paul Mbarga', email: 'paul@example.com', role: 'staff', events: 0, status: 'suspended', joined: '20 Avr 2026' },
])

const roleLabels: Record<string, string> = { organizer: 'Organisateur', attendee: 'Participant', staff: 'Staff', admin: 'Admin' }
const roleColors: Record<string, string> = { organizer: 'bg-primary-100 text-primary-700', attendee: 'bg-surface-100 text-surface-700', staff: 'bg-cyan-100 text-cyan-700', admin: 'bg-red-100 text-red-700' }
const statusColors: Record<string, string> = { active: 'bg-emerald-100 text-emerald-700', suspended: 'bg-red-100 text-red-700' }
const statusLabels: Record<string, string> = { active: 'Actif', suspended: 'Suspendu' }
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Gestion utilisateurs</h1>
        <p class="text-surface-500 mt-1">{{ users.length }} utilisateurs enregistrés</p>
      </div>
    </div>

    <div class="relative max-w-md">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input type="text" placeholder="Rechercher un utilisateur..." class="input-field pl-11 !py-2.5" />
    </div>

    <div class="card-premium overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Utilisateur</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4">Rôle</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden md:table-cell">Statut</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden lg:table-cell">Inscription</th>
              <th class="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-surface-50 hover:bg-surface-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center"><Users class="w-4 h-4 text-primary-600" /></div>
                  <div>
                    <p class="font-medium text-surface-900">{{ user.name }}</p>
                    <p class="text-xs text-surface-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4"><span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', roleColors[user.role]]">{{ roleLabels[user.role] }}</span></td>
              <td class="px-4 py-4 hidden md:table-cell"><span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', statusColors[user.status]]">{{ statusLabels[user.status] }}</span></td>
              <td class="px-4 py-4 hidden lg:table-cell text-sm text-surface-500">{{ user.joined }}</td>
              <td class="px-4 py-4">
                <button class="p-2 rounded-lg hover:bg-surface-100"><MoreVertical class="w-4 h-4 text-surface-400" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
