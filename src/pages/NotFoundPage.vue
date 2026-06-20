<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Home, ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4">
    <div class="text-center">
      <p class="text-8xl font-bold gradient-text mb-6">404</p>
      <h1 class="text-2xl font-bold text-surface-900 mb-3">Page introuvable</h1>
      <p class="text-surface-500 mb-8 max-w-md mx-auto">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink to="/" class="btn-primary"><Home class="w-4 h-4" /> Accueil</RouterLink>
        <button onclick="history.back()" class="btn-secondary"><ArrowLeft class="w-4 h-4" /> Retour</button>
      </div>
    </div>
  </div>
</template>
