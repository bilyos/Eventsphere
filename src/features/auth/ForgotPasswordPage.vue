<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-vue-next'

const auth = useAuthStore()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleReset() {
  if (!email.value) {
    toast.error('Veuillez entrer votre email')
    return
  }
  loading.value = true
  try {
    await auth.resetPassword(email.value)
    sent.value = true
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de l\'envoi')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <template v-if="!sent">
      <h2 class="text-2xl font-bold text-surface-900 mb-2">Mot de passe oublié</h2>
      <p class="text-surface-500 mb-8">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>

      <form @submit.prevent="handleReset" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-2">Email</label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input v-model="email" type="email" placeholder="vous@exemple.com" class="input-field pl-12" required />
          </div>
        </div>
        <button type="submit" :disabled="loading" class="btn-primary w-full !py-3.5">
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <span v-else>Envoyer le lien</span>
        </button>
      </form>
    </template>

    <template v-else>
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle class="w-8 h-8 text-emerald-600" />
        </div>
        <h2 class="text-2xl font-bold text-surface-900 mb-2">Email envoyé !</h2>
        <p class="text-surface-500 mb-8">Vérifiez votre boîte mail pour le lien de réinitialisation.</p>
      </div>
    </template>

    <p class="text-center mt-8">
      <RouterLink to="/auth/login" class="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-700">
        <ArrowLeft class="w-4 h-4" /> Retour à la connexion
      </RouterLink>
    </p>
  </div>
</template>
