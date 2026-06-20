import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/pages/HomePage.vue') },
        { path: 'events', name: 'events', component: () => import('@/pages/EventsPage.vue') },
        { path: 'events/:slug', name: 'event-detail', component: () => import('@/pages/EventDetailPage.vue'), props: true },
        { path: 'checkout/:eventId', name: 'checkout', component: () => import('@/pages/CheckoutPage.vue'), props: true, meta: { requiresAuth: true } },
      ],
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: 'login', name: 'login', component: () => import('@/features/auth/LoginPage.vue') },
        { path: 'signup', name: 'signup', component: () => import('@/features/auth/SignupPage.vue') },
        { path: 'forgot-password', name: 'forgot-password', component: () => import('@/features/auth/ForgotPasswordPage.vue') },
        { path: 'reset-password', name: 'reset-password', component: () => import('@/features/auth/ResetPasswordPage.vue') },
      ],
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/features/dashboard/DashboardPage.vue') },
        { path: 'events', name: 'dashboard-events', component: () => import('@/features/events/EventsManagePage.vue') },
        { path: 'events/create', name: 'create-event', component: () => import('@/features/events/CreateEventPage.vue') },
        { path: 'events/:id/edit', name: 'edit-event', component: () => import('@/features/events/EditEventPage.vue'), props: true },
        { path: 'tickets', name: 'dashboard-tickets', component: () => import('@/features/tickets/TicketsPage.vue') },
        { path: 'checkin/:eventId', name: 'checkin', component: () => import('@/features/checkin/CheckInPage.vue'), props: true },
        { path: 'gallery', name: 'dashboard-gallery', component: () => import('@/features/gallery/GalleryPage.vue') },
        { path: 'profile', name: 'profile', component: () => import('@/features/profile/ProfilePage.vue') },
        { path: 'payments', name: 'dashboard-payments', component: () => import('@/features/payments/PaymentsPage.vue') },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', name: 'admin', component: () => import('@/features/admin/AdminDashboard.vue') },
        { path: 'users', name: 'admin-users', component: () => import('@/features/admin/UsersPage.vue') },
        { path: 'events', name: 'admin-events', component: () => import('@/features/admin/AdminEventsPage.vue') },
      ],
    },
    {
      path: '/ticket/:ticketId',
      name: 'ticket-view',
      component: () => import('@/pages/TicketViewPage.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

export function installRouterGuards() {
  router.beforeEach(async (to) => {
    const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co'
    if (isDemoMode) return

    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    if (!auth.initialized) await auth.initialize()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.meta.requiresAdmin && !auth.isAdmin) {
      return { name: 'dashboard' }
    }
  })
}

export default router
