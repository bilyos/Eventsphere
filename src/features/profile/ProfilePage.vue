<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { User, Mail, Phone, Camera, Shield, Key, Loader2 } from 'lucide-vue-next'

const auth = useAuthStore()
const loading = ref(false)
const activeTab = ref<'profile' | 'security'>('profile')

const form = ref({
  fullName: auth.profile?.full_name || 'Richard Ty',
  email: auth.profile?.email || 'richard@eventsphere.com',
  phone: auth.profile?.phone || '+237 691 234 567',
  bio: auth.profile?.bio || 'Organisateur d\'événements passionné.',
})

async function handleSave() {
  loading.value = true
  await new Promise(r => setTimeout(r, 1000))
  loading.value = false
  toast.success('Profil mis à jour !')
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-surface-900">Mon profil</h1>

    <!-- Tabs -->
    <div class="flex gap-1 bg-surface-100 rounded-xl p-1">
      <button @click="activeTab = 'profile'" :class="['flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all', activeTab === 'profile' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500']">
        <User class="w-4 h-4 inline mr-1.5" /> Profil
      </button>
      <button @click="activeTab = 'security'" :class="['flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all', activeTab === 'security' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500']">
        <Shield class="w-4 h-4 inline mr-1.5" /> Sécurité
      </button>
    </div>

    <template v-if="activeTab === 'profile'">
      <div class="card-premium p-8">
        <!-- Avatar -->
        <div class="flex items-center gap-6 mb-8">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User class="w-8 h-8 text-primary-600" />
            </div>
            <button class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700">
              <Camera class="w-4 h-4" />
            </button>
          </div>
          <div>
            <p class="font-bold text-surface-900 text-lg">{{ form.fullName }}</p>
            <p class="text-sm text-surface-500">{{ form.email }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSave" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Nom complet</label>
            <div class="relative">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input v-model="form.fullName" type="text" class="input-field pl-12" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Email</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input v-model="form.email" type="email" class="input-field pl-12" disabled />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Téléphone</label>
            <div class="relative">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input v-model="form.phone" type="tel" class="input-field pl-12" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Bio</label>
            <textarea v-model="form.bio" rows="3" class="input-field resize-none" />
          </div>
          <div class="flex justify-end">
            <button type="submit" :disabled="loading" class="btn-primary">
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </template>

    <template v-if="activeTab === 'security'">
      <div class="card-premium p-8 space-y-6">
        <div>
          <h3 class="font-bold text-surface-900 mb-4 flex items-center gap-2"><Key class="w-5 h-5" /> Changer le mot de passe</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Mot de passe actuel</label>
              <input type="password" class="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Nouveau mot de passe</label>
              <input type="password" class="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Confirmer</label>
              <input type="password" class="input-field" placeholder="••••••••" />
            </div>
            <button class="btn-primary">Mettre à jour</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
