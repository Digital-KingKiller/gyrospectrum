-- Migration: 002_enable_rls
-- Enable Row Level Security on all tables and create user-scoped policies
-- This is CRITICAL for production security

-- ============================================
-- 1. Enable RLS on all tables
-- ============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Businesses — users can only access their own
-- ============================================
CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create businesses"
  ON businesses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own businesses"
  ON businesses FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own businesses"
  ON businesses FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 3. Competitors — scoped through business ownership
-- ============================================
CREATE POLICY "Users can view competitors of own businesses"
  ON competitors FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create competitors for own businesses"
  ON competitors FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update competitors of own businesses"
  ON competitors FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete competitors of own businesses"
  ON competitors FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- 4. Content Templates — scoped through business ownership
-- ============================================
CREATE POLICY "Users can view content of own businesses"
  ON content_templates FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create content for own businesses"
  ON content_templates FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update content of own businesses"
  ON content_templates FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete content of own businesses"
  ON content_templates FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- 5. Social Posts — scoped through business ownership
-- ============================================
CREATE POLICY "Users can view posts of own businesses"
  ON social_posts FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create posts for own businesses"
  ON social_posts FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update posts of own businesses"
  ON social_posts FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete posts of own businesses"
  ON social_posts FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- 6. Leads — scoped through business ownership
-- ============================================
CREATE POLICY "Users can view leads of own businesses"
  ON leads FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create leads for own businesses"
  ON leads FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update leads of own businesses"
  ON leads FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete leads of own businesses"
  ON leads FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- 7. Conversations — scoped through business ownership
-- ============================================
CREATE POLICY "Users can view conversations of own businesses"
  ON conversations FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create conversations for own businesses"
  ON conversations FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update conversations of own businesses"
  ON conversations FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete conversations of own businesses"
  ON conversations FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- 8. Bookings — scoped through business ownership
-- ============================================
CREATE POLICY "Users can view bookings of own businesses"
  ON bookings FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create bookings for own businesses"
  ON bookings FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update bookings of own businesses"
  ON bookings FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete bookings of own businesses"
  ON bookings FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- 9. Service role bypass for webhooks / server-side operations
--    The service_role key automatically bypasses RLS, so
--    lead capture webhooks and cron jobs using the service key
--    will continue to work without additional policies.
-- ============================================

-- ============================================
-- 10. Add foreign key constraint for user_id on businesses
-- ============================================
ALTER TABLE businesses
  ADD CONSTRAINT fk_businesses_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;
