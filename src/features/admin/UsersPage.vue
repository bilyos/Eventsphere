<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { Search, Users } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import type { Profile, UserRole } from '@/types'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref<string | null>(null)
const searchQuery = ref('')
const profiles = shallowRef<Profile[]>([])
const eventCounts = ref<Record<string, number>>({})

const users = computed(() =>
  profiles.value.filter(p => {
    const q = searchQuery.value.toLowerCase()
    return !q || p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  }),
)

const roles: UserRole[] = ['attendee', 'organizer', 'staff', 'admin']
const roleLabels: Record<string, string> = { organizer: 'Organisateur', attendee: 'Participant', staff: 'Staff', admin: 'Admin' }
const roleColors: Record<string, string> = { organizer: 'bg-primary-100 text-primary-700', attendee: 'bg-surface-100 text-surface-700', staff: 'bg-cyan-100 text-cyan-700', admin: 'bg-red-100 text-red-700' }

async function changeRole(user: Profile, role: UserRole) {
  if (role === user.role) return
  saving.value = user.id
  try {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id)
    if (error) throw error
    profiles.value = profiles.value.map(p => (p.id === user.id ? { ...p, role } : p))
    toast.success(`${user.full_name || user.email} est maintenant ${roleLabels[role]}`)
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Modification impossible')
  } finally {
    saving.value = null
  }
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  try {
    const [profilesRes, eventsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('organizer_id'),
    ])
    profiles.value = (profilesRes.data ?? []) as Profile[]
    eventCounts.value = (eventsRes.data ?? []).reduce<Record<string, number>>((acc, e) => {
      acc[e.organizer_id] = (acc[e.organizer_id] ?? 0) + 1
      return acc
    }, {})
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Gestion utilisateurs</h1>
        <p class="text-surface-500 mt-1">{{ profiles.length }} utilisateur(s) enregistré(s)</p>
      </div>
    </div>

    <div class="relative max-w-md">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input v-model="searchQuery" type="text" placeholder="Rechercher un utilisateur..." class="input-field pl-11 !py-2.5" />
    </div>

    <div class="card-premium overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-6 py-4">Utilisateur</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4">Rôle</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden md:table-cell">Événements</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4 hidden lg:table-cell">Inscription</th>
              <th class="text-left text-xs font-semibold text-surface-500 uppercase px-4 py-4">Changer le rôle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-surface-50 hover:bg-surface-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img v-if="user.avatar_url" :src="user.avatar_url" alt="" class="w-9 h-9 rounded-full object-cover" />
                  <div v-else class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users class="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p class="font-medium text-surface-900">{{ user.full_name || 'Sans nom' }}</p>
                    <p class="text-xs text-surface-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', roleColors[user.role]]">{{ roleLabels[user.role] }}</span>
              </td>
              <td class="px-4 py-4 hidden md:table-cell text-sm text-surface-600">{{ eventCounts[user.id] ?? 0 }}</td>
              <td class="px-4 py-4 hidden lg:table-cell text-sm text-surface-500">{{ formatDate(user.created_at) }}</td>
              <td class="px-4 py-4">
                <select
                  :value="user.role"
                  :disabled="saving === user.id || user.id === auth.user?.id"
                  @change="changeRole(user, ($event.target as HTMLSelectElement).value as UserRole)"
                  class="input-field !py-1.5 !text-sm max-w-[10rem]"
                >
                  <option v-for="role in roles" :key="role" :value="role">{{ roleLabels[role] }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-surface-500">Chargement…</div>
      <div v-else-if="!users.length" class="px-6 py-16 text-center text-sm text-surface-500">
        Aucun utilisateur ne correspond à cette recherche.
      </div>
    </div>
  </div>
</template>
