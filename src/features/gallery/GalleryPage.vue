<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { Upload, X, ZoomIn, Image, Trash2, Loader2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import type { GalleryImage } from '@/types'

const auth = useAuthStore()
const events = useEventsStore()

const loading = ref(true)
const uploading = ref(false)
const images = shallowRef<GalleryImage[]>([])
const selectedEventId = ref('')
const lightboxImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const myEvents = computed(() => events.myEvents)

const visibleImages = computed(() =>
  selectedEventId.value ? images.value.filter(i => i.event_id === selectedEventId.value) : images.value,
)

async function loadImages() {
  const eventIds = myEvents.value.map(e => e.id)
  if (!eventIds.length) {
    images.value = []
    return
  }
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .in('event_id', eventIds)
    .order('created_at', { ascending: false })
  if (error) throw error
  images.value = (data ?? []) as GalleryImage[]
}

async function onFilesSelected(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length || !auth.user) return
  if (!selectedEventId.value) {
    toast.error('Choisissez d\'abord l\'événement de destination')
    return
  }

  uploading.value = true
  try {
    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${auth.user.id}/${selectedEventId.value}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file)
      if (uploadError) throw uploadError

      const url = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl
      const { error: insertError } = await supabase.from('gallery_images').insert({
        event_id: selectedEventId.value,
        url,
        caption: file.name.replace(/\.[^.]+$/, ''),
        uploaded_by: auth.user.id,
      })
      if (insertError) throw insertError
    }
    await loadImages()
    toast.success(`${files.length} image(s) ajoutée(s)`)
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Téléversement impossible')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function removeImage(image: GalleryImage) {
  if (!confirm('Supprimer cette image ?')) return
  try {
    const { error } = await supabase.from('gallery_images').delete().eq('id', image.id)
    if (error) throw error
    images.value = images.value.filter(i => i.id !== image.id)
    toast.success('Image supprimée')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Suppression impossible')
  }
}

onMounted(async () => {
  if (!auth.initialized) await auth.initialize()
  try {
    if (auth.user) {
      await events.fetchMyEvents(auth.user.id)
      selectedEventId.value = myEvents.value[0]?.id ?? ''
      await loadImages()
    }
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Chargement impossible')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Galerie</h1>
        <p class="text-surface-500 mt-1">Photos et médias de vos événements</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="selectedEventId" class="input-field !py-2.5 max-w-[16rem]">
          <option value="">Tous mes événements</option>
          <option v-for="event in myEvents" :key="event.id" :value="event.id">{{ event.title }}</option>
        </select>
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFilesSelected" />
        <button @click="fileInput?.click()" :disabled="uploading || !myEvents.length" class="btn-primary">
          <Loader2 v-if="uploading" class="w-4 h-4 animate-spin" />
          <Upload v-else class="w-4 h-4" />
          Ajouter des photos
        </button>
      </div>
    </div>

    <div v-if="loading" class="card-premium p-16 text-center text-surface-500">Chargement…</div>

    <div v-else-if="!myEvents.length" class="card-premium p-16 text-center">
      <Image class="w-12 h-12 text-surface-300 mx-auto mb-4" />
      <p class="font-semibold text-surface-900 mb-1">Aucun événement</p>
      <p class="text-sm text-surface-500">Créez un événement avant d'y associer des photos.</p>
    </div>

    <div v-else-if="!visibleImages.length" class="card-premium p-16 text-center">
      <Image class="w-12 h-12 text-surface-300 mx-auto mb-4" />
      <p class="font-semibold text-surface-900 mb-1">Galerie vide</p>
      <p class="text-sm text-surface-500">Ajoutez vos premières photos avec le bouton ci-dessus.</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="image in visibleImages"
        :key="image.id"
        class="relative group rounded-xl overflow-hidden cursor-pointer aspect-[4/3]"
        @click="lightboxImage = image.url"
      >
        <img :src="image.url" :alt="image.caption ?? ''" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <ZoomIn class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <button
          @click.stop="removeImage(image)"
          class="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Supprimer"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <div v-if="image.caption" class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p class="text-sm text-white font-medium truncate">{{ image.caption }}</p>
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
