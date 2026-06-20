-- EventSphere Database Schema
-- Supabase PostgreSQL with Row Level Security

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('organizer', 'attendee', 'staff', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- EVENT CATEGORIES
-- ==========================================
CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'calendar',
  color TEXT NOT NULL DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- EVENTS
-- ==========================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT,
  banner_url TEXT,
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_public_published ON events(is_public, status) WHERE is_public = true AND status = 'published';

-- ==========================================
-- TICKET TYPES
-- ==========================================
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XAF',
  quantity INTEGER NOT NULL DEFAULT 100,
  sold INTEGER NOT NULL DEFAULT 0,
  max_per_order INTEGER NOT NULL DEFAULT 10,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- ==========================================
-- TICKETS
-- ==========================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  attendee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'expired')),
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_attendee ON tickets(attendee_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  method TEXT NOT NULL CHECK (method IN ('card', 'orange_money', 'mtn_momo', 'paypal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  reference TEXT NOT NULL UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ==========================================
-- CHECK-INS
-- ==========================================
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  scanned_by UUID NOT NULL REFERENCES profiles(id),
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT
);

CREATE INDEX idx_checkins_ticket ON checkins(ticket_id);
CREATE INDEX idx_checkins_event ON checkins(event_id);
CREATE INDEX idx_checkins_scanned_at ON checkins(scanned_at);

-- ==========================================
-- GALLERY IMAGES
-- ==========================================
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_event ON gallery_images(event_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_reviews_event ON reviews(event_id);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Event categories
CREATE POLICY "Categories are viewable by everyone" ON event_categories FOR SELECT USING (true);

-- Events
CREATE POLICY "Public events are viewable by everyone" ON events FOR SELECT USING (is_public = true AND status = 'published');
CREATE POLICY "Organizers can view own events" ON events FOR SELECT USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own events" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- Ticket types
CREATE POLICY "Ticket types are viewable by everyone" ON ticket_types FOR SELECT USING (true);
CREATE POLICY "Organizers can manage ticket types" ON ticket_types FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = ticket_types.event_id AND events.organizer_id = auth.uid())
);

-- Tickets
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = attendee_id);
CREATE POLICY "Organizers can view event tickets" ON tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = tickets.event_id AND events.organizer_id = auth.uid())
);
CREATE POLICY "Authenticated users can create tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = attendee_id);

-- Payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Check-ins
CREATE POLICY "Staff can view event check-ins" ON checkins FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = checkins.event_id AND events.organizer_id = auth.uid())
);
CREATE POLICY "Staff can create check-ins" ON checkins FOR INSERT WITH CHECK (auth.uid() = scanned_by);

-- Gallery
CREATE POLICY "Gallery images are viewable by everyone" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Organizers can manage gallery" ON gallery_images FOR ALL USING (auth.uid() = uploaded_by);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- SEED DATA
-- ==========================================
INSERT INTO event_categories (name, slug, icon, color) VALUES
  ('Conférences', 'conferences', 'mic', '#7c3aed'),
  ('Concerts', 'concerts', 'music', '#ec4899'),
  ('Workshops', 'workshops', 'lightbulb', '#f59e0b'),
  ('Galas', 'galas', 'sparkles', '#06b6d4'),
  ('Sport', 'sport', 'trophy', '#10b981'),
  ('Art & Culture', 'art-culture', 'palette', '#8b5cf6'),
  ('Networking', 'networking', 'users', '#3b82f6'),
  ('Formation', 'formation', 'graduation-cap', '#ef4444');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
