<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function handleReset() {
  if (password.value !== confirmPassword.value) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }
  if (password.value.length < 8) {
    toast.error('Minimum 8 caractères')
    return
  }
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    toast.success('Mot de passe mis à jour !')
    router.push('/auth/login')
  } catch (err: any) {
    toast.error(err.message || 'Erreur')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-surface-900 mb-2">Nouveau mot de passe</h2>
    <p class="text-surface-500 mb-8">Choisissez un mot de passe sécurisé.</p>

    <form @submit.prevent="handleReset" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Nouveau mot de passe</label>
        <div class="relative">
          <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="input-field pl-12 pr-12" required />
          <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">
            <EyeOff v-if="showPassword" class="w-5 h-5" /><Eye v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Confirmer</label>
        <div class="relative">
          <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input v-model="confirmPassword" type="password" placeholder="••••••••" class="input-field pl-12" required />
        </div>
      </div>
      <button type="submit" :disabled="loading" class="btn-primary w-full !py-3.5">
        <Loader2 v-if="loading" class="w-5 h-5 animate-spin" /><span v-else>Réinitialiser</span>
      </button>
    </form>
  </div>
</template>
