<script setup lang="ts">
import { ref } from 'vue'
import { Upload, X, ZoomIn, Image } from 'lucide-vue-next'

const images = ref([
  { id: '1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop', caption: 'Tech Summit - Keynote' },
  { id: '2', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop', caption: 'Afro Music Festival' },
  { id: '3', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop', caption: 'Workshop collaboratif' },
  { id: '4', url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&h=400&fit=crop', caption: 'Gala de charité' },
  { id: '5', url: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=600&h=400&fit=crop', caption: 'Marathon Douala' },
  { id: '6', url: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=600&h=400&fit=crop', caption: 'Expo Art' },
])

const lightboxImage = ref<string | null>(null)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Galerie</h1>
        <p class="text-surface-500 mt-1">Photos et médias de vos événements</p>
      </div>
      <button class="btn-primary"><Upload class="w-4 h-4" /> Ajouter des photos</button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="image in images"
        :key="image.id"
        class="relative group rounded-xl overflow-hidden cursor-pointer aspect-[4/3]"
        @click="lightboxImage = image.url"
      >
        <img :src="image.url" :alt="image.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <ZoomIn class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p class="text-sm text-white font-medium">{{ image.caption }}</p>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
        <div v-if="lightboxImage" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" @click="lightboxImage = null">
          <button class="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20" @click.stop="lightboxImage = null">
            <X class="w-6 h-6" />
          </button>
          <img :src="lightboxImage" class="max-w-full max-h-[85vh] rounded-xl object-contain" @click.stop />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
