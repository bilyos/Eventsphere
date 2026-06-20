<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import {
  Sparkles, Menu, X, Bell, User, LogOut, LayoutDashboard,
  ChevronDown, Search, Ticket, Sun, Moon
} from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const notifications = useNotificationsStore()
const router = useRouter()

const { isDark, toggleTheme } = useTheme()
const mobileMenuOpen = ref(false)
const profileMenuOpen = ref(false)

const unreadCount = computed(() => notifications.unreadCount)

async function handleSignOut() {
  await auth.signOut()
  profileMenuOpen.value = false
  router.push('/')
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold gradient-text hidden sm:block">EventSphere</span>
        </RouterLink>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-1">
          <RouterLink to="/events" class="btn-ghost">Événements</RouterLink>
          <RouterLink v-if="auth.isOrganizer" to="/dashboard" class="btn-ghost">Dashboard</RouterLink>
        </div>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center gap-3">
          <button class="btn-ghost p-2 rounded-xl">
            <Search class="w-5 h-5" />
          </button>
          <button @click="toggleTheme" class="btn-ghost p-2 rounded-xl" title="Changer le thème">
            <Moon v-if="!isDark" class="w-5 h-5" />
            <Sun v-else class="w-5 h-5 text-amber-500" />
          </button>

          <template v-if="auth.isAuthenticated">
            <!-- Notifications -->
            <button class="btn-ghost p-2 rounded-xl relative">
              <Bell class="w-5 h-5" />
              <span
                v-if="unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Profile dropdown -->
            <div class="relative">
              <button
                @click="profileMenuOpen = !profileMenuOpen"
                class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <img
                    v-if="auth.profile?.avatar_url"
                    :src="auth.profile.avatar_url"
                    class="w-8 h-8 rounded-full object-cover"
                    alt=""
                  />
                  <User v-else class="w-4 h-4 text-primary-600" />
                </div>
                <span class="text-sm font-medium text-surface-700 hidden lg:block">
                  {{ auth.profile?.full_name || 'Mon compte' }}
                </span>
                <ChevronDown class="w-4 h-4 text-surface-400" />
              </button>

              <!-- Dropdown -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-1"
              >
                <div
                  v-if="profileMenuOpen"
                  class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-100 py-2 z-50"
                  @mouseleave="profileMenuOpen = false"
                >
                  <div class="px-4 py-2 border-b border-surface-100">
                    <p class="text-sm font-semibold text-surface-900">{{ auth.profile?.full_name }}</p>
                    <p class="text-xs text-surface-500">{{ auth.profile?.email }}</p>
                  </div>
                  <RouterLink
                    to="/dashboard"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                    @click="profileMenuOpen = false"
                  >
                    <LayoutDashboard class="w-4 h-4" /> Dashboard
                  </RouterLink>
                  <RouterLink
                    to="/dashboard/tickets"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                    @click="profileMenuOpen = false"
                  >
                    <Ticket class="w-4 h-4" /> Mes tickets
                  </RouterLink>
                  <RouterLink
                    to="/dashboard/profile"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                    @click="profileMenuOpen = false"
                  >
                    <User class="w-4 h-4" /> Mon profil
                  </RouterLink>
                  <div class="border-t border-surface-100 mt-1 pt-1">
                    <button
                      @click="handleSignOut"
                      class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut class="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <template v-else>
            <RouterLink to="/auth/login" class="btn-ghost text-sm">Connexion</RouterLink>
            <RouterLink to="/auth/signup" class="btn-primary text-sm !px-5 !py-2.5">
              Commencer
            </RouterLink>
          </template>
        </div>

        <!-- Mobile menu button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden btn-ghost p-2">
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="md:hidden glass border-t border-surface-100">
        <div class="px-4 py-4 space-y-2">
          <RouterLink to="/events" class="block px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 font-medium" @click="mobileMenuOpen = false">
            Événements
          </RouterLink>
          <template v-if="auth.isAuthenticated">
            <RouterLink to="/dashboard" class="block px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 font-medium" @click="mobileMenuOpen = false">
              Dashboard
            </RouterLink>
            <RouterLink to="/dashboard/profile" class="block px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 font-medium" @click="mobileMenuOpen = false">
              Mon profil
            </RouterLink>
            <button @click="handleSignOut(); mobileMenuOpen = false" class="block w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">
              Déconnexion
            </button>
          </template>
          <template v-else>
            <RouterLink to="/auth/login" class="block px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 font-medium" @click="mobileMenuOpen = false">
              Connexion
            </RouterLink>
            <RouterLink to="/auth/signup" class="block px-4 py-3 rounded-xl bg-primary-600 text-white text-center font-semibold" @click="mobileMenuOpen = false">
              Commencer gratuitement
            </RouterLink>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>
