import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'
import { useAuthStore } from './auth'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  async function fetchNotifications() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      notifications.value = (data ?? []) as Notification[]
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true } as any).eq('id', id)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  async function markAllAsRead() {
    const auth = useAuthStore()
    if (!auth.user) return
    await supabase
      .from('notifications')
      .update({ read: true } as any)
      .eq('user_id', auth.user.id)
      .eq('read', false)
    notifications.value.forEach(n => (n.read = true))
  }

  function subscribeToRealtime() {
    const auth = useAuthStore()
    if (!auth.user) return
    supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${auth.user.id}` },
        (payload) => {
          notifications.value.unshift(payload.new as Notification)
        }
      )
      .subscribe()
  }

  return {
    notifications, loading, unreadCount,
    fetchNotifications, markAsRead, markAllAsRead, subscribeToRealtime,
  }
})
