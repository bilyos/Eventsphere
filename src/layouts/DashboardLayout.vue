<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import {
  Sparkles, LayoutDashboard, Calendar, Ticket, ScanLine,
  Image, UserCircle, CreditCard, Shield, Users, BarChart3,
  Bell, LogOut, Menu, X, ChevronLeft, Settings, Sun, Moon
} from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const notifications = useNotificationsStore()
const route = useRoute()
const router = useRouter()

const { isDark, toggleTheme } = useTheme()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

interface NavItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
  badge?: number
}

const mainNav = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Événements', to: '/dashboard/events', icon: Calendar },
    { label: 'Tickets', to: '/dashboard/tickets', icon: Ticket },
    { label: 'Paiements', to: '/dashboard/payments', icon: CreditCard },
    { label: 'Galerie', to: '/dashboard/gallery', icon: Image },
    { label: 'Profil', to: '/dashboard/profile', icon: UserCircle },
  ]
  return items
})

const adminNav = computed<NavItem[]>(() => {
  if (!auth.isAdmin) return []
  return [
    { label: 'Admin', to: '/admin', icon: Shield },
    { label: 'Utilisateurs', to: '/admin/users', icon: Users },
    { label: 'Analytics', to: '/admin/events', icon: BarChart3 },
  ]
})

function isActive(path: string) {
  if (path === '/dashboard' || path === '/admin') return route.path === path
  return route.path.startsWith(path)
}

async function handleSignOut() {
  await auth.signOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-surface-100 dark:border-surface-800">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span v-if="!sidebarCollapsed" class="text-lg font-bold gradient-text">EventSphere</span>
        </RouterLink>
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="hidden md:flex w-7 h-7 rounded-lg hover:bg-surface-100 items-center justify-center transition-colors"
          v-if="!sidebarCollapsed"
        >
          <ChevronLeft class="w-4 h-4 text-surface-400" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <RouterLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            isActive(item.to)
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          <span
            v-if="item.badge && !sidebarCollapsed"
            class="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold"
          >
            {{ item.badge }}
          </span>
        </RouterLink>

        <!-- Admin section -->
        <template v-if="adminNav.length">
          <div class="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800">
            <p v-if="!sidebarCollapsed" class="px-3 mb-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
              Administration
            </p>
            <RouterLink
              v-for="item in adminNav"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
              ]"
              @click="sidebarOpen = false"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </RouterLink>
          </div>
        </template>
      </nav>

      <!-- User section -->
      <div class="p-3 border-t border-surface-100 dark:border-surface-800">
        <div
          :class="[
            'flex items-center gap-3 p-2 rounded-xl',
            sidebarCollapsed ? 'justify-center' : ''
          ]"
        >
          <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <img
              v-if="auth.profile?.avatar_url"
              :src="auth.profile.avatar_url"
              class="w-9 h-9 rounded-full object-cover"
              alt=""
            />
            <UserCircle v-else class="w-5 h-5 text-primary-600" />
          </div>
          <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{{ auth.profile?.full_name || 'Mon compte' }}</p>
            <p class="text-xs text-surface-500 truncate">{{ auth.profile?.role || 'attendee' }}</p>
          </div>
          <button
            v-if="!sidebarCollapsed"
            @click="handleSignOut"
            class="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600 transition-colors"
            title="Déconnexion"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Backdrop mobile -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 md:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Main content -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64']">
      <!-- Top bar -->
      <header class="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <button @click="sidebarOpen = true" class="md:hidden p-2 rounded-lg hover:bg-surface-100">
            <Menu class="w-5 h-5" />
          </button>
          <h1 class="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {{ (route.meta as any).title || 'Dashboard' }}
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <button @click="toggleTheme" class="p-2 rounded-xl hover:bg-surface-100 transition-colors" title="Changer le thème">
            <Moon v-if="!isDark" class="w-5 h-5 text-surface-600" />
            <Sun v-else class="w-5 h-5 text-amber-500" />
          </button>
          <button class="relative p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <Bell class="w-5 h-5 text-surface-600" />
            <span
              v-if="notifications.unreadCount > 0"
              class="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full"
            />
          </button>
          <button class="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <Settings class="w-5 h-5 text-surface-600" />
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
