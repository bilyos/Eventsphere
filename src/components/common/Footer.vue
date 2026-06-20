<script setup lang="ts">
import { Sparkles, Github, Twitter, Instagram, Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-surface-950 text-surface-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-bold text-white">EventSphere</span>
          </div>
          <p class="text-sm leading-relaxed mb-6">
            La plateforme premium pour créer, gérer et vivre des événements extraordinaires.
          </p>
          <div class="flex items-center gap-3">
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center hover:bg-surface-700 transition-colors">
              <Twitter class="w-4 h-4" />
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center hover:bg-surface-700 transition-colors">
              <Instagram class="w-4 h-4" />
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center hover:bg-surface-700 transition-colors">
              <Github class="w-4 h-4" />
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center hover:bg-surface-700 transition-colors">
              <Mail class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h4 class="text-white font-semibold text-sm mb-4">Produit</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">Fonctionnalités</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Tarifs</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Intégrations</a></li>
            <li><a href="#" class="hover:text-white transition-colors">API</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold text-sm mb-4">Entreprise</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">À propos</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Carrières</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold text-sm mb-4">Légal</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">Confidentialité</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Conditions</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Mentions légales</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-surface-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm">&copy; {{ new Date().getFullYear() }} EventSphere. Tous droits réservés.</p>
        <p class="text-xs text-surface-600">Fait avec ❤️ à Douala, Cameroun</p>
      </div>
    </div>
  </footer>
</template>
