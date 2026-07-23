import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile, ProfileUpdate, UserRole } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed<UserRole>(() => profile.value?.role ?? 'attendee')
  const isOrganizer = computed(() => ['organizer', 'admin'].includes(userRole.value))
  const isAdmin = computed(() => userRole.value === 'admin')
  const isStaff = computed(() => ['staff', 'admin'].includes(userRole.value))

  async function initialize() {
    if (initialized.value) return
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        session.value = data.session
        user.value = data.session.user
        await fetchProfile()
      }
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
        if (newSession?.user) {
          await fetchProfile()
        } else {
          profile.value = null
        }
      })
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    if (data) profile.value = data as Profile
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signInWithProvider(provider: 'google' | 'github' | 'facebook') {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    profile.value = null
    session.value = null
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  async function updateProfile(updates: ProfileUpdate) {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    if (error) throw error
    if (data) profile.value = data as Profile
  }

  return {
    user, profile, session, loading, initialized,
    isAuthenticated, userRole, isOrganizer, isAdmin, isStaff,
    initialize, signUp, signIn, signInWithProvider, signOut,
    resetPassword, updateProfile, fetchProfile,
  }
})
