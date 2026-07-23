-- ============================================================
-- EventSphere — Migration 0002
-- Corrige les manques RLS qui bloquent la billetterie, le check-in
-- et les pages admin.
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- (à appliquer APRÈS supabase/schema.sql)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Le compteur `sold` ne s'incrémentait jamais
-- ------------------------------------------------------------
-- Le trigger tourne avec les droits de l'acheteur, qui n'a pas le droit
-- de modifier ticket_types (policy réservée à l'organisateur) : l'UPDATE
-- était silencieusement filtré par RLS. SECURITY DEFINER le corrige.
create or replace function increment_ticket_sold()
returns trigger as $$
begin
  update ticket_types set sold = sold + 1 where id = new.ticket_type_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ------------------------------------------------------------
-- 2. Helper admin (SECURITY DEFINER pour éviter la récursion RLS
--    quand une policy sur `profiles` interroge `profiles`)
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_event_staff(target_event_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from events
    where events.id = target_event_id and events.organizer_id = auth.uid()
  ) or exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role in ('staff', 'admin')
  );
$$;

-- ------------------------------------------------------------
-- 3. TICKETS — le check-in doit pouvoir passer un billet en `used`
-- ------------------------------------------------------------
drop policy if exists "Staff valide les tickets" on tickets;
create policy "Staff valide les tickets"
  on tickets for update
  using (public.is_event_staff(event_id))
  with check (public.is_event_staff(event_id));

drop policy if exists "Admins voient tous les tickets" on tickets;
create policy "Admins voient tous les tickets"
  on tickets for select using (public.is_admin());

-- ------------------------------------------------------------
-- 4. CHECKINS — ouvrir au rôle staff, pas seulement à l'organisateur
-- ------------------------------------------------------------
drop policy if exists "Staff scanne les checkins" on checkins;
create policy "Staff scanne les checkins"
  on checkins for insert
  with check (public.is_event_staff(event_id) and scanned_by = auth.uid());

drop policy if exists "Staff consulte les checkins" on checkins;
create policy "Staff consulte les checkins"
  on checkins for select using (public.is_event_staff(event_id));

-- ------------------------------------------------------------
-- 5. NOTIFICATIONS — l'app crée ses propres notifications
-- ------------------------------------------------------------
drop policy if exists "Users créent leurs notifications" on notifications;
create policy "Users créent leurs notifications"
  on notifications for insert with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 6. ADMIN — accès transversal pour le back-office
-- ------------------------------------------------------------
drop policy if exists "Admins voient tous les événements" on events;
create policy "Admins voient tous les événements"
  on events for select using (public.is_admin());

drop policy if exists "Admins modifient tous les événements" on events;
create policy "Admins modifient tous les événements"
  on events for update using (public.is_admin());

drop policy if exists "Admins suppriment tous les événements" on events;
create policy "Admins suppriment tous les événements"
  on events for delete using (public.is_admin());

drop policy if exists "Admins voient tous les paiements" on payments;
create policy "Admins voient tous les paiements"
  on payments for select using (public.is_admin());

drop policy if exists "Admins modifient les profils" on profiles;
create policy "Admins modifient les profils"
  on profiles for update using (public.is_admin());

drop policy if exists "Admins voient tous les types de tickets" on ticket_types;
create policy "Admins voient tous les types de tickets"
  on ticket_types for select using (public.is_admin());

-- ------------------------------------------------------------
-- 7. GALERIE — l'uploader peut gérer ses propres images
-- ------------------------------------------------------------
drop policy if exists "Uploaders gèrent leurs images" on gallery_images;
create policy "Uploaders gèrent leurs images"
  on gallery_images for all
  using (auth.uid() = uploaded_by)
  with check (auth.uid() = uploaded_by);

-- ------------------------------------------------------------
-- 8. Compteur de participants exposé aux pages publiques
-- ------------------------------------------------------------
create or replace function public.event_attendee_count(target_event_id uuid)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::int from tickets
  where tickets.event_id = target_event_id and tickets.status <> 'cancelled';
$$;
