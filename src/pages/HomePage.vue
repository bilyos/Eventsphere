<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Sparkles, ArrowRight, Zap, Shield, BarChart3, QrCode,
  Ticket, Users, Globe, Star, ChevronRight, Play,
  Calendar, MapPin, Clock, TrendingUp, CheckCircle, Check,
  CreditCard, Smartphone, ScanLine, Bell, ArrowUpRight,
  CircleCheck, Cpu, Layers, MousePointerClick, Headphones,
  Award, Timer, Lock, Wifi, WifiOff, Heart
} from 'lucide-vue-next'

const heroVisible = ref(false)
const counters = ref({ events: 0, tickets: 0, countries: 0, uptime: 0 })

function animateCounters() {
  const targets = { events: 50, tickets: 2, countries: 120, uptime: 99.9 }
  const duration = 2000
  const start = Date.now()
  const step = () => {
    const progress = Math.min((Date.now() - start) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    counters.value.events = Math.floor(targets.events * ease)
    counters.value.tickets = Math.round(targets.tickets * ease * 10) / 10
    counters.value.countries = Math.floor(targets.countries * ease)
    counters.value.uptime = Math.round(targets.uptime * ease * 10) / 10
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  setTimeout(() => { heroVisible.value = true }, 50)
  setTimeout(animateCounters, 600)
})

const features = [
  {
    icon: Zap,
    title: 'Création en 60 secondes',
    description: 'Un flow intelligent guide chaque étape. Titres, dates, billets — tout se construit sans friction.',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Ticket,
    title: 'Billetterie intelligente',
    description: 'QR codes sécurisés, tarification dynamique, early bird, VIP, groupes — automatisé de A à Z.',
    gradient: 'from-primary-500 to-primary-700',
    bg: 'bg-primary-50 dark:bg-primary-950/30',
  },
  {
    icon: ScanLine,
    title: 'Check-in temps réel',
    description: 'Scannez en un clic. Anti-doublon intégré, mode hors-ligne, notifications live pour votre équipe.',
    gradient: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Dashboard',
    description: 'Graphiques dynamiques, revenus temps réel, taux de remplissage, insights audience en un coup d\'œil.',
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: CreditCard,
    title: 'Paiements multi-canal',
    description: 'Carte bancaire, Orange Money, MTN MoMo, PayPal — vos participants paient comme ils veulent.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Shield,
    title: 'Sécurité enterprise',
    description: 'Chiffrement bout en bout, Row Level Security, auth multi-facteurs, conformité RGPD.',
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
]

const howItWorks = [
  { step: '01', title: 'Créez', description: 'Configurez votre événement en quelques clics : titre, lieu, dates, billetterie.', icon: MousePointerClick },
  { step: '02', title: 'Vendez', description: 'Partagez votre page événement. Les participants achètent et reçoivent leur QR code.', icon: Ticket },
  { step: '03', title: 'Scannez', description: 'Le jour J, scannez les QR codes à l\'entrée. Check-in instantané, zéro file d\'attente.', icon: ScanLine },
  { step: '04', title: 'Analysez', description: 'Suivez vos métriques en temps réel : revenus, participants, tendances, satisfaction.', icon: BarChart3 },
]

const testimonials = [
  {
    name: 'Marie Nguemo',
    role: 'Organisatrice, TEDx Douala',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    text: 'EventSphere a transformé notre TEDx. Le check-in QR a réduit notre temps d\'entrée de 80%. L\'interface est tout simplement magnifique.',
    rating: 5,
    company: 'TEDx',
  },
  {
    name: 'Jean-Pierre Kamga',
    role: 'Directeur, Festival Douala Art',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    text: 'Les analytics en temps réel nous ont permis d\'optimiser nos ventes en plein festival. On a augmenté nos revenus de 45% cette année.',
    rating: 5,
    company: 'Douala Art',
  },
  {
    name: 'Aminata Diallo',
    role: 'CEO, TechMeet Africa',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    text: 'L\'intégration Orange Money a été un game-changer. On a doublé nos ventes en ouvrant les paiements mobile money. Indispensable.',
    rating: 5,
    company: 'TechMeet',
  },
]

const popularEvents = [
  {
    id: '1',
    title: 'Douala Tech Summit 2026',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    date: '15 Juil 2026',
    location: 'Palais des Congrès',
    price: '15 000 XAF',
    category: 'Tech',
    attendees: 1250,
    capacity: 2000,
  },
  {
    id: '2',
    title: 'Afro Music Festival',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
    date: '22 Juil 2026',
    location: 'Stade Omnisports',
    price: '10 000 XAF',
    category: 'Concert',
    attendees: 5000,
    capacity: 8000,
  },
  {
    id: '3',
    title: 'Startup Weekend Cameroun',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop',
    date: '5 Août 2026',
    location: 'Hub Innovation',
    price: 'Gratuit',
    category: 'Workshop',
    attendees: 200,
    capacity: 250,
  },
]

const pricingHighlights = [
  'Création d\'événements illimitée',
  'Billetterie QR sécurisée',
  'Check-in temps réel',
  'Dashboard analytics',
  'Paiements multi-canal',
  'Support prioritaire 24/7',
]
</script>

<template>
  <div class="overflow-hidden">

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- HERO — Inspiré Reelers/Linear/Stripe                -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="relative min-h-screen flex items-center bg-white dark:bg-surface-950">
      <!-- Subtle grid bg -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <!-- Ambient glow -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary-100/60 via-transparent to-transparent dark:from-primary-900/20 rounded-full blur-3xl" />
      <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-100/40 via-transparent to-transparent dark:from-amber-900/10 rounded-full blur-3xl" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 w-full">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[85vh]">
          <!-- Left column — copy -->
          <div>
            <!-- Social proof badge -->
            <div
              :class="['inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 mb-8 transition-all duration-700', heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
            >
              <div class="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-800" alt="" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-800" alt="" />
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face" class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-800" alt="" />
              </div>
              <span class="text-sm font-medium text-surface-600 dark:text-surface-300">
                Rejoint par <span class="font-bold text-surface-900 dark:text-white">20 000+</span> organisateurs
              </span>
              <div class="flex items-center gap-0.5">
                <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span class="text-sm font-bold text-surface-900 dark:text-white">4.9</span>
              </div>
            </div>

            <!-- Headline -->
            <h1
              :class="['transition-all duration-700 delay-100', heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
            >
              <span class="block text-5xl sm:text-6xl lg:text-[4.25rem] font-black text-surface-900 dark:text-white leading-[1.05] tracking-tight">
                Événements
              </span>
              <span class="block text-5xl sm:text-6xl lg:text-[4.25rem] font-black leading-[1.05] tracking-tight gradient-text mt-1">
                extraordinaires.
              </span>
            </h1>

            <!-- Subheadline -->
            <p
              :class="['text-lg sm:text-xl text-surface-500 dark:text-surface-400 mt-6 max-w-lg leading-relaxed transition-all duration-700 delay-200', heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
            >
              Billetterie intelligente, check-in QR temps réel, analytics avancés — créez des expériences mémorables <span class="font-semibold text-surface-700 dark:text-surface-200">jusqu'à 10x plus vite</span>.
            </p>

            <!-- CTAs -->
            <div
              :class="['flex flex-col sm:flex-row items-start gap-4 mt-10 transition-all duration-700 delay-300', heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
            >
              <RouterLink
                to="/auth/signup"
                class="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 font-bold text-base hover:bg-surface-800 dark:hover:bg-surface-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Commencer — C'est gratuit
                <ArrowRight class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </RouterLink>
              <RouterLink
                to="/events"
                class="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl border-2 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-semibold text-base hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all"
              >
                Voir les tarifs
                <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </RouterLink>
            </div>

            <!-- Mini trust bar -->
            <div
              :class="['flex items-center gap-6 mt-10 transition-all duration-700 delay-500', heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
            >
              <div class="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                <CheckCircle class="w-4 h-4 text-emerald-500" />
                Aucune carte requise
              </div>
              <div class="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                <CheckCircle class="w-4 h-4 text-emerald-500" />
                Configuration en 2 min
              </div>
            </div>
          </div>

          <!-- Right column — floating UI composition -->
          <div
            :class="['relative transition-all duration-1000 delay-300', heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
          >
            <!-- Main image card -->
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-surface-200/50 dark:border-surface-700/50">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=500&fit=crop"
                alt="Événement"
                class="w-full h-[400px] lg:h-[480px] object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <!-- Overlay badge -->
              <div class="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span class="inline-block px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-primary-700 mb-2">TENDANCE</span>
                  <h3 class="text-white font-bold text-xl">Douala Tech Summit 2026</h3>
                  <p class="text-white/70 text-sm flex items-center gap-1.5 mt-1"><Calendar class="w-3.5 h-3.5" /> 15 Juillet 2026</p>
                </div>
                <div class="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full">
                  <Play class="w-4 h-4 text-primary-600 fill-primary-600" />
                </div>
              </div>
            </div>

            <!-- Floating card — stats -->
            <div class="absolute -top-4 -right-4 lg:-right-8 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700 p-4 w-44 animate-slide-down">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <TrendingUp class="w-4 h-4 text-white" />
                </div>
                <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">+60%</span>
              </div>
              <p class="text-xs text-surface-500 dark:text-surface-400">Ventes cette semaine</p>
              <p class="text-lg font-black text-surface-900 dark:text-white">1 847</p>
            </div>

            <!-- Floating card — check-in -->
            <div class="absolute top-1/3 -left-6 lg:-left-12 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700 p-3.5 animate-slide-up flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <CircleCheck class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-xs font-bold text-surface-900 dark:text-white">Check-in confirmé</p>
                <p class="text-[10px] text-surface-400">Marie N. — VIP #247</p>
              </div>
            </div>

            <!-- Floating card — product card -->
            <div class="absolute -bottom-6 -right-2 lg:-right-6 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700 p-3 w-48 animate-fade-in">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop" alt="" class="w-full h-full object-cover" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-surface-900 dark:text-white truncate">Afro Music Fest</p>
                  <p class="text-sm font-black text-primary-600">10 000 XAF</p>
                  <div class="flex items-center gap-1 mt-0.5">
                    <Star class="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span class="text-[10px] font-bold text-surface-600 dark:text-surface-300">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom fade to next section -->
      <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-50 dark:from-surface-900 to-transparent" />
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- LOGOS / TRUST BAR                                    -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-12 bg-surface-50 dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-[0.2em] mb-8">
          Choisi par les meilleurs organisateurs d'Afrique et du monde
        </p>
        <div class="flex items-center justify-between gap-8 opacity-40 dark:opacity-30 flex-wrap justify-center">
          <span class="text-2xl font-black tracking-tight text-surface-900 dark:text-white">TEDx</span>
          <span class="text-2xl font-black tracking-tight text-surface-900 dark:text-white">AfricaTech</span>
          <span class="text-xl font-extrabold tracking-tight text-surface-900 dark:text-white italic">FESTI<span class="text-primary-500">VAL</span></span>
          <span class="text-2xl font-black tracking-tight text-surface-900 dark:text-white">StartupCM</span>
          <span class="text-xl font-extrabold tracking-tight text-surface-900 dark:text-white">DIGI<span class="text-primary-500">MEET</span></span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- STATS — Animated counters                            -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-20 bg-surface-50 dark:bg-surface-900">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <p class="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight">{{ counters.events }}K<span class="text-primary-500">+</span></p>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-2 font-medium">Événements créés</p>
          </div>
          <div class="text-center">
            <p class="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight">{{ counters.tickets }}M<span class="text-primary-500">+</span></p>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-2 font-medium">Tickets vendus</p>
          </div>
          <div class="text-center">
            <p class="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight">{{ counters.countries }}<span class="text-primary-500">+</span></p>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-2 font-medium">Pays couverts</p>
          </div>
          <div class="text-center">
            <p class="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight">{{ counters.uptime }}<span class="text-primary-500">%</span></p>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-2 font-medium">Uptime garanti</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- FEATURES GRID                                        -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-24 lg:py-32 bg-white dark:bg-surface-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section header -->
        <div class="max-w-2xl mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Layers class="w-3.5 h-3.5" /> Fonctionnalités
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 dark:text-white tracking-tight leading-tight">
            Tout ce qu'il faut<br />pour <span class="gradient-text">réussir.</span>
          </h2>
          <p class="text-lg text-surface-500 dark:text-surface-400 mt-4 leading-relaxed">
            Des outils pensés par des organisateurs, pour des organisateurs. Chaque détail est conçu pour vous faire gagner du temps.
          </p>
        </div>

        <!-- Grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-8 hover:border-surface-200 dark:hover:border-surface-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center mb-6', feature.bg]">
              <div :class="['w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center', feature.gradient]">
                <component :is="feature.icon" class="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 class="text-lg font-bold text-surface-900 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-surface-500 dark:text-surface-400 leading-relaxed text-[15px]">{{ feature.description }}</p>
            <ArrowUpRight class="absolute top-8 right-8 w-5 h-5 text-surface-300 dark:text-surface-600 group-hover:text-primary-500 transition-colors" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- HOW IT WORKS — 4-step process                       -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-24 lg:py-32 bg-surface-50 dark:bg-surface-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Timer class="w-3.5 h-3.5" /> Comment ça marche
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 dark:text-white tracking-tight">
            Simple comme <span class="gradient-text">1, 2, 3, 4.</span>
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="item in howItWorks" :key="item.step" class="relative text-center">
            <div class="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-center mx-auto mb-6">
              <component :is="item.icon" class="w-7 h-7 text-primary-600" />
            </div>
            <span class="text-xs font-black text-primary-600 uppercase tracking-wider">Étape {{ item.step }}</span>
            <h3 class="text-xl font-bold text-surface-900 dark:text-white mt-2 mb-3">{{ item.title }}</h3>
            <p class="text-surface-500 dark:text-surface-400 leading-relaxed text-sm">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- POPULAR EVENTS PREVIEW                               -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-24 lg:py-32 bg-white dark:bg-surface-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles class="w-3.5 h-3.5" /> Tendances
            </div>
            <h2 class="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white tracking-tight">Événements populaires</h2>
          </div>
          <RouterLink to="/events" class="group inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:gap-2.5 transition-all">
            Voir tout <ChevronRight class="w-4 h-4" />
          </RouterLink>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <RouterLink
            v-for="event in popularEvents"
            :key="event.id"
            :to="`/events/${event.id}`"
            class="group relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden hover:shadow-xl hover:border-surface-200 dark:hover:border-surface-700 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="relative h-52 overflow-hidden">
              <img :src="event.image" :alt="event.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-surface-700">{{ event.category }}</span>
              <span class="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-bold">{{ event.price }}</span>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-surface-900 dark:text-white group-hover:text-primary-600 transition-colors mb-3">{{ event.title }}</h3>
              <div class="space-y-2 text-sm text-surface-500 dark:text-surface-400">
                <div class="flex items-center gap-2"><Calendar class="w-4 h-4 text-primary-400" /> {{ event.date }}</div>
                <div class="flex items-center gap-2"><MapPin class="w-4 h-4 text-primary-400" /> {{ event.location }}</div>
              </div>
              <!-- Fill bar -->
              <div class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-medium text-surface-500 dark:text-surface-400">{{ event.attendees.toLocaleString() }} / {{ event.capacity.toLocaleString() }}</span>
                  <span class="text-xs font-bold" :class="(event.attendees / event.capacity) > 0.7 ? 'text-amber-600' : 'text-emerald-600'">{{ Math.round(event.attendees / event.capacity * 100) }}%</span>
                </div>
                <div class="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="(event.attendees / event.capacity) > 0.7 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'"
                    :style="{ width: Math.round(event.attendees / event.capacity * 100) + '%' }"
                  />
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- TESTIMONIALS                                         -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-24 lg:py-32 bg-surface-50 dark:bg-surface-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 text-xs font-bold uppercase tracking-wider mb-4">
            <Heart class="w-3.5 h-3.5" /> Témoignages
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 dark:text-white tracking-tight">
            Aimé par <span class="gradient-text">20 000+</span> organisateurs.
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="t in testimonials"
            :key="t.name"
            class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 p-8 hover:shadow-lg transition-all duration-300"
          >
            <!-- Stars -->
            <div class="flex items-center gap-0.5 mb-5">
              <Star v-for="i in t.rating" :key="i" class="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
            </div>
            <!-- Quote -->
            <p class="text-surface-600 dark:text-surface-300 leading-relaxed mb-8 text-[15px]">"{{ t.text }}"</p>
            <!-- Author -->
            <div class="flex items-center gap-3 pt-6 border-t border-surface-100 dark:border-surface-700">
              <img :src="t.avatar" :alt="t.name" class="w-11 h-11 rounded-full object-cover ring-2 ring-surface-100 dark:ring-surface-600" />
              <div>
                <p class="font-bold text-surface-900 dark:text-white text-sm">{{ t.name }}</p>
                <p class="text-xs text-surface-500 dark:text-surface-400">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- CTA — Final conversion block                         -->
    <!-- ═══════════════════════════════════════════════════ -->
    <section class="py-24 lg:py-32 bg-white dark:bg-surface-950">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-[2rem] overflow-hidden bg-surface-950 dark:bg-white p-12 sm:p-16 lg:p-20">
          <!-- Background elements -->
          <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div class="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div class="absolute bottom-0 left-0 w-72 h-72 bg-accent-amber/10 rounded-full blur-3xl" />

          <div class="relative z-10 text-center">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white dark:text-surface-900 tracking-tight leading-tight mb-6">
              Prêt à créer quelque chose<br class="hidden sm:block" />d'extraordinaire ?
            </h2>
            <p class="text-lg text-white/60 dark:text-surface-500 mb-8 max-w-xl mx-auto">
              Rejoignez des milliers d'organisateurs qui font confiance à EventSphere.
            </p>

            <!-- Checkmarks -->
            <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10">
              <div v-for="h in pricingHighlights" :key="h" class="flex items-center gap-2 text-sm text-white/70 dark:text-surface-500">
                <Check class="w-4 h-4 text-emerald-400" /> {{ h }}
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <RouterLink
                to="/auth/signup"
                class="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white dark:bg-surface-900 text-surface-900 dark:text-white font-bold text-base hover:bg-surface-100 dark:hover:bg-surface-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Commencer gratuitement
                <ArrowRight class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </RouterLink>
              <RouterLink
                to="/events"
                class="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-white/20 dark:border-surface-300 text-white dark:text-surface-700 font-semibold hover:bg-white/10 dark:hover:bg-surface-100 transition-all"
              >
                Explorer les événements
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
