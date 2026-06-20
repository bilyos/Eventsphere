<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1 pt-16">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
