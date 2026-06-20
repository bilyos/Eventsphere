<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.initialize()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-surface-950">
    <RouterView />
    <Toaster
      position="top-right"
      :toastOptions="{
        style: {
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
        },
      }"
    />
  </div>
</template>
