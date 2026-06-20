<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { Mail, Lock, User, Eye, EyeOff, Loader2, Check } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const acceptTerms = ref(false)

const passwordChecks = [
  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un chiffre', test: (p: string) => /[0-9]/.test(p) },
]

async function handleSignup() {
  if (!fullName.value || !email.value || !password.value) {
    toast.error('Veuillez remplir tous les champs')
    return
  }
  if (!acceptTerms.value) {
    toast.error('Veuillez accepter les conditions')
    return
  }
  if (password.value.length < 8) {
    toast.error('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  loading.value = true
  try {
    await auth.signUp(email.value, password.value, fullName.value)
    toast.success('Compte créé ! Vérifiez votre email.')
    router.push('/auth/login')
  } catch (err: any) {
    toast.error(err.message || 'Échec de l\'inscription')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-surface-900 mb-2">Créer un compte</h2>
    <p class="text-surface-500 mb-8">Rejoignez EventSphere et créez des événements incroyables</p>

    <form @submit.prevent="handleSignup" class="space-y-5">
      <!-- Full Name -->
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Nom complet</label>
        <div class="relative">
          <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            v-model="fullName"
            type="text"
            placeholder="John Doe"
            class="input-field pl-12"
            required
          />
        </div>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Email</label>
        <div class="relative">
          <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            v-model="email"
            type="email"
            placeholder="vous@exemple.com"
            class="input-field pl-12"
            required
          />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-2">Mot de passe</label>
        <div class="relative">
          <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="input-field pl-12 pr-12"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            <EyeOff v-if="showPassword" class="w-5 h-5" />
            <Eye v-else class="w-5 h-5" />
          </button>
        </div>
        <!-- Password strength -->
        <div v-if="password" class="mt-3 space-y-1.5">
          <div
            v-for="check in passwordChecks"
            :key="check.label"
            class="flex items-center gap-2 text-xs"
          >
            <div
              :class="[
                'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
                check.test(password)
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-surface-100 text-surface-400'
              ]"
            >
              <Check class="w-3 h-3" />
            </div>
            <span :class="check.test(password) ? 'text-emerald-600' : 'text-surface-500'">
              {{ check.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Terms -->
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="acceptTerms"
          type="checkbox"
          class="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="text-sm text-surface-600">
          J'accepte les
          <a href="#" class="text-primary-600 font-medium hover:underline">conditions d'utilisation</a>
          et la
          <a href="#" class="text-primary-600 font-medium hover:underline">politique de confidentialité</a>
        </span>
      </label>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="btn-primary w-full !py-3.5 text-base"
      >
        <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
        <span v-else>Créer mon compte</span>
      </button>
    </form>

    <!-- Login link -->
    <p class="text-center text-sm text-surface-500 mt-8">
      Déjà un compte ?
      <RouterLink to="/auth/login" class="text-primary-600 font-semibold hover:text-primary-700">
        Se connecter
      </RouterLink>
    </p>
  </div>
</template>
