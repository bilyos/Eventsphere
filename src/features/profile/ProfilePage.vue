<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { User, Mail, Phone, Camera, Shield, Key, Loader2 } from 'lucide-vue-next'

const auth = useAuthStore()
const loading = ref(false)
const uploadingAvatar = ref(false)
const changingPassword = ref(false)
const activeTab = ref<'profile' | 'security'>('profile')
const avatarInput = ref<HTMLInputElement | null>(null)

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  bio: '',
  avatarUrl: '' as string | null,
})

const passwords = ref({ current: '', next: '', confirm: '' })

function syncFromProfile() {
  form.value = {
    fullName: auth.profile?.full_name ?? '',
    email: auth.profile?.email ?? auth.user?.email ?? '',
    phone: auth.profile?.phone ?? '',
    bio: auth.profile?.bio ?? '',
    avatarUrl: auth.profile?.avatar_url ?? '',
  }
}

async function handleSave() {
  loading.value = true
  try {
    await auth.updateProfile({
      full_name: form.value.fullName.trim(),
      phone: form.value.phone.trim() || null,
      bio: form.value.bio.trim() || null,
    })
    toast.success('Profil mis à jour !')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Mise à jour impossible')
  } finally {
    loading.value = false
  }
}

async function onAvatarSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !auth.user) return
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Image trop lourde (2 Mo maximum)')
    return
  }
  uploadingAvatar.value = true
  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    // Le bucket `avatars` exige que le 1er dossier corresponde à l'id de l'utilisateur.
    const path = `${auth.user.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error
    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    await auth.updateProfile({ avatar_url: `${url}?v=${Date.now()}` })
    form.value.avatarUrl = auth.profile?.avatar_url ?? url
    toast.success('Photo de profil mise à jour')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Téléversement impossible')
  } finally {
    uploadingAvatar.value = false
  }
}

async function handlePasswordChange() {
  const { current, next, confirm } = passwords.value
  if (!current || !next) {
    toast.error('Renseignez le mot de passe actuel et le nouveau')
    return
  }
  if (next.length < 8) {
    toast.error('Le nouveau mot de passe doit faire au moins 8 caractères')
    return
  }
  if (next !== confirm) {
    toast.error('Les deux mots de passe ne correspondent pas')
    return
  }
  changingPassword.value = true
  try {
    // Supabase ne vérifie pas le mot de passe actuel : on le contrôle nous-mêmes.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: current,
    })
    if (signInError) throw new Error('Mot de passe actuel incorrect')

    const { error } = await supabase.auth.updateUser({ password: next })
    if (error) throw error

    passwords.value = { current: '', next: '', confirm: '' }
    toast.success('Mot de passe mis à jour')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Changement impossible')
  } finally {
    changingPassword.value = false
  }
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  syncFromProfile()
})

watch(() => auth.profile, syncFromProfile)
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
            <img
              v-if="form.avatarUrl"
              :src="form.avatarUrl"
              alt=""
              class="w-20 h-20 rounded-full object-cover"
            />
            <div v-else class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User class="w-8 h-8 text-primary-600" />
            </div>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarSelected" />
            <button
              @click="avatarInput?.click()"
              :disabled="uploadingAvatar"
              class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 disabled:opacity-60"
              aria-label="Changer la photo de profil"
            >
              <Loader2 v-if="uploadingAvatar" class="w-4 h-4 animate-spin" />
              <Camera v-else class="w-4 h-4" />
            </button>
          </div>
          <div>
            <p class="font-bold text-surface-900 text-lg">{{ form.fullName || 'Sans nom' }}</p>
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
          <form @submit.prevent="handlePasswordChange" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Mot de passe actuel</label>
              <input v-model="passwords.current" type="password" autocomplete="current-password" class="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Nouveau mot de passe</label>
              <input v-model="passwords.next" type="password" autocomplete="new-password" class="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">Confirmer</label>
              <input v-model="passwords.confirm" type="password" autocomplete="new-password" class="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" :disabled="changingPassword" class="btn-primary">
              <Loader2 v-if="changingPassword" class="w-4 h-4 animate-spin" />
              <span v-else>Mettre à jour</span>
            </button>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
