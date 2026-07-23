# EventSphere

Plateforme de gestion d'événements : billetterie, QR codes, check-in et back-office.
Vue 3 + TypeScript + Vite, Tailwind CSS 4, Pinia, Supabase (Postgres + Auth + Storage).

## Démarrage

```bash
npm install
```

Copiez `.env.example` vers `.env` et renseignez les clés de votre projet Supabase :

```
VITE_SUPABASE_URL=https://<projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé anon>
VITE_APP_NAME=EventSphere
VITE_APP_URL=http://localhost:5173
```

```bash
npm run dev
```

## Base de données

Dans le SQL Editor de Supabase, exécutez dans l'ordre :

1. `supabase/schema.sql` — tables, enums, triggers, RLS et buckets Storage
2. `supabase/migrations/0002_checkin_admin_policies.sql` — policies manquantes pour
   le check-in, la galerie et le back-office admin

Sans la migration 0002, le compteur `sold` reste à zéro, le check-in ne peut pas
marquer un billet comme utilisé et les pages `/admin` restent vides.

Pour vous donner le rôle admin :

```sql
update profiles set role = 'admin' where email = 'vous@exemple.com';
```

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement sur le port 5173 |
| `npm run build` | Build de production dans `dist/` |
| `npm run typecheck` | Vérification TypeScript (`vue-tsc`) |
| `npm run preview` | Sert le build de production |

## Paiement

Aucun prestataire de paiement n'est branché. `src/lib/payments.ts` simule
l'autorisation ; la commande et les billets, eux, sont réellement enregistrés en
base. L'intégration réelle (Orange Money, MTN MoMo, carte, PayPal) doit se faire
côté serveur via une Edge Function — voir les notes en tête de ce fichier.

## Structure

```
src/
  components/common/   Navbar, Footer
  composables/         useTheme
  features/            admin, auth, checkin, dashboard, events, gallery, payments, profile, tickets
  layouts/             PublicLayout, AuthLayout, DashboardLayout
  lib/                 supabase, payments, utils
  pages/               pages publiques (accueil, événements, checkout, billet)
  router/              routes et guards
  stores/              auth, events, tickets, notifications
  types/               types générés de la base + types applicatifs
```
