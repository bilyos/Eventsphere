-- ============================================================
-- EventSphere — Schema complet Supabase
-- Exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
create type user_role as enum ('attendee', 'organizer', 'staff', 'admin');
create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type ticket_status as enum ('valid', 'used', 'cancelled', 'expired');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
create type payment_method as enum ('card', 'orange_money', 'mtn_momo', 'paypal');
create type notification_type as enum ('info', 'success', 'warning', 'error');

-- 3. TABLES

-- Profiles (étend auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  phone text,
  role user_role not null default 'attendee',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Catégories d'événements
create table event_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text not null default 'Calendar',
  color text not null default '#f97316',
  created_at timestamptz not null default now()
);

-- Événements
create table events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  short_description text,
  banner_url text,
  category_id uuid references event_categories(id) on delete set null,
  venue_name text not null default '',
  venue_address text not null default '',
  latitude double precision,
  longitude double precision,
  start_date timestamptz not null,
  end_date timestamptz not null,
  capacity integer not null default 100,
  is_free boolean not null default false,
  is_public boolean not null default true,
  status event_status not null default 'draft',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Types de tickets
create table ticket_types (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'XAF',
  quantity integer not null default 100,
  sold integer not null default 0,
  max_per_order integer not null default 10,
  sale_start timestamptz,
  sale_end timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tickets (billets achetés)
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_type_id uuid not null references ticket_types(id) on delete cascade,
  attendee_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  qr_code text not null unique,
  status ticket_status not null default 'valid',
  checked_in_at timestamptz,
  checked_in_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Paiements
create table payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'XAF',
  method payment_method not null,
  status payment_status not null default 'pending',
  reference text not null unique,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Check-ins
create table checkins (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  scanned_by uuid not null references profiles(id),
  scanned_at timestamptz not null default now(),
  location text
);

-- Images galerie
create table gallery_images (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  url text not null,
  caption text,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type not null default 'info',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- Avis / Reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- 4. INDEX pour performances
create index idx_events_organizer on events(organizer_id);
create index idx_events_category on events(category_id);
create index idx_events_status on events(status);
create index idx_events_start_date on events(start_date);
create index idx_events_slug on events(slug);
create index idx_tickets_attendee on tickets(attendee_id);
create index idx_tickets_event on tickets(event_id);
create index idx_tickets_qr on tickets(qr_code);
create index idx_payments_user on payments(user_id);
create index idx_payments_event on payments(event_id);
create index idx_checkins_event on checkins(event_id);
create index idx_checkins_ticket on checkins(ticket_id);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(user_id, read);
create index idx_reviews_event on reviews(event_id);

-- 5. FONCTIONS

-- Auto-créer un profil quand un user s'inscrit
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Mettre à jour updated_at automatiquement
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger events_updated_at before update on events
  for each row execute function update_updated_at();

-- Incrémenter sold quand un ticket est créé
create or replace function increment_ticket_sold()
returns trigger as $$
begin
  update ticket_types set sold = sold + 1 where id = new.ticket_type_id;
  return new;
end;
$$ language plpgsql;

create trigger on_ticket_created
  after insert on tickets
  for each row execute function increment_ticket_sold();

-- 6. ROW LEVEL SECURITY (RLS)

alter table profiles enable row level security;
alter table events enable row level security;
alter table event_categories enable row level security;
alter table ticket_types enable row level security;
alter table tickets enable row level security;
alter table payments enable row level security;
alter table checkins enable row level security;
alter table gallery_images enable row level security;
alter table notifications enable row level security;
alter table reviews enable row level security;

-- PROFILES
create policy "Profiles visibles publiquement"
  on profiles for select using (true);

create policy "Users modifient leur profil"
  on profiles for update using (auth.uid() = id);

-- EVENT CATEGORIES
create policy "Catégories visibles par tous"
  on event_categories for select using (true);

-- EVENTS
create policy "Événements publics visibles"
  on events for select using (is_public = true and status = 'published');

create policy "Organisateurs voient leurs événements"
  on events for select using (auth.uid() = organizer_id);

create policy "Organisateurs créent des événements"
  on events for insert with check (auth.uid() = organizer_id);

create policy "Organisateurs modifient leurs événements"
  on events for update using (auth.uid() = organizer_id);

create policy "Organisateurs suppriment leurs événements"
  on events for delete using (auth.uid() = organizer_id);

-- TICKET TYPES
create policy "Types tickets visibles si événement public"
  on ticket_types for select using (
    exists (select 1 from events where events.id = ticket_types.event_id and (events.is_public = true or events.organizer_id = auth.uid()))
  );

create policy "Organisateurs gèrent types tickets"
  on ticket_types for all using (
    exists (select 1 from events where events.id = ticket_types.event_id and events.organizer_id = auth.uid())
  );

-- TICKETS
create policy "Users voient leurs tickets"
  on tickets for select using (auth.uid() = attendee_id);

create policy "Organisateurs voient tickets de leurs events"
  on tickets for select using (
    exists (select 1 from events where events.id = tickets.event_id and events.organizer_id = auth.uid())
  );

create policy "Users achètent des tickets"
  on tickets for insert with check (auth.uid() = attendee_id);

-- PAYMENTS
create policy "Users voient leurs paiements"
  on payments for select using (auth.uid() = user_id);

create policy "Organisateurs voient paiements de leurs events"
  on payments for select using (
    exists (select 1 from events where events.id = payments.event_id and events.organizer_id = auth.uid())
  );

create policy "Users créent des paiements"
  on payments for insert with check (auth.uid() = user_id);

-- CHECKINS
create policy "Staff/organisateurs gèrent checkins"
  on checkins for all using (
    exists (select 1 from events where events.id = checkins.event_id and events.organizer_id = auth.uid())
  );

create policy "Users voient leurs propres checkins"
  on checkins for select using (
    exists (select 1 from tickets where tickets.id = checkins.ticket_id and tickets.attendee_id = auth.uid())
  );

-- GALLERY IMAGES
create policy "Galerie visible publiquement"
  on gallery_images for select using (true);

create policy "Organisateurs gèrent galerie"
  on gallery_images for all using (
    exists (select 1 from events where events.id = gallery_images.event_id and events.organizer_id = auth.uid())
  );

-- NOTIFICATIONS
create policy "Users voient leurs notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users modifient leurs notifications"
  on notifications for update using (auth.uid() = user_id);

-- REVIEWS
create policy "Reviews visibles publiquement"
  on reviews for select using (true);

create policy "Users créent des reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users modifient leurs reviews"
  on reviews for update using (auth.uid() = user_id);

create policy "Users suppriment leurs reviews"
  on reviews for delete using (auth.uid() = user_id);

-- 7. STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('events', 'events', true);
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);

-- Storage policies
create policy "Avatars publics" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Event images publics" on storage.objects for select using (bucket_id = 'events');
create policy "Organisateurs upload event images" on storage.objects for insert with check (bucket_id = 'events' and auth.role() = 'authenticated');

create policy "Gallery publique" on storage.objects for select using (bucket_id = 'gallery');
create policy "Authenticated upload gallery" on storage.objects for insert with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

-- 8. DONNÉES DE DÉMO (catégories)
insert into event_categories (name, slug, icon, color) values
  ('Conférence', 'conference', 'Presentation', '#f97316'),
  ('Concert', 'concert', 'Music', '#ec4899'),
  ('Festival', 'festival', 'PartyPopper', '#8b5cf6'),
  ('Workshop', 'workshop', 'Wrench', '#06b6d4'),
  ('Sport', 'sport', 'Trophy', '#10b981'),
  ('Networking', 'networking', 'Users', '#f59e0b'),
  ('Exposition', 'exposition', 'Frame', '#6366f1'),
  ('Gala', 'gala', 'Sparkles', '#e11d48');

-- 9. REALTIME (activer pour notifications et checkins)
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table checkins;
alter publication supabase_realtime add table tickets;
