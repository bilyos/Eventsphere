<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left - Branding -->
    <div class="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDZjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      <div class="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
        <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
          <Sparkles class="w-8 h-8" />
        </div>
        <h1 class="text-4xl font-bold mb-4 text-center">EventSphere</h1>
        <p class="text-lg text-white/80 text-center max-w-md leading-relaxed">
          Créez, gérez et vivez des événements extraordinaires avec la plateforme la plus moderne.
        </p>
        <div class="mt-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <p class="text-3xl font-bold">10K+</p>
            <p class="text-sm text-white/60 mt-1">Événements</p>
          </div>
          <div>
            <p class="text-3xl font-bold">500K+</p>
            <p class="text-sm text-white/60 mt-1">Participants</p>
          </div>
          <div>
            <p class="text-3xl font-bold">98%</p>
            <p class="text-sm text-white/60 mt-1">Satisfaction</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right - Form -->
    <div class="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white dark:bg-surface-950">
      <div class="w-full max-w-md">
        <RouterLink to="/" class="flex items-center gap-2 mb-10 lg:hidden">
          <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold gradient-text">EventSphere</span>
        </RouterLink>
        <RouterView />
      </div>
    </div>
  </div>
</template>
