-- AI Marketing & Sales Automation System - Initial Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  industry VARCHAR(100),
  target_audience TEXT,
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- hex color
  secondary_color VARCHAR(7),
  brand_voice VARCHAR(50), -- professional, casual, friendly, authoritative
  unique_value_proposition TEXT,
  
  -- Social media connections
  facebook_page_id VARCHAR(255),
  instagram_account_id VARCHAR(255),
  linkedin_page_id VARCHAR(255),
  tiktok_account_id VARCHAR(255),
  whatsapp_business_id VARCHAR(255),
  
  -- Settings
  auto_post_enabled BOOLEAN DEFAULT false,
  auto_respond_enabled BOOLEAN DEFAULT false,
  
  user_id UUID -- For multi-tenant support later
);

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  website_url TEXT,
  competitor_type VARCHAR(50), -- direct, indirect, macro
  
  -- Analysis results
  social_media_presence JSONB, -- URLs and follower counts
  content_strategy JSONB, -- posting frequency, content types, hashtags
  engagement_metrics JSONB, -- likes, comments, shares averages
  success_factors TEXT[], -- array of identified success factors
  techniques TEXT[], -- array of techniques they're using
  sentiment_score DECIMAL(3, 2), -- -1.0 to 1.0
  
  -- Analysis metadata
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  analysis_status VARCHAR(50) DEFAULT 'pending' -- pending, in_progress, completed, failed
);

-- Content templates table
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  title VARCHAR(255),
  content_type VARCHAR(50), -- text, image, video, carousel
  platform VARCHAR(50), -- facebook, instagram, linkedin, tiktok, whatsapp, all
  
  -- Content
  text_content TEXT,
  media_urls TEXT[],
  hashtags TEXT[],
  call_to_action TEXT,
  
  -- Metadata
  based_on_competitor_id UUID REFERENCES competitors(id),
  performance_score DECIMAL(3, 2), -- predicted or actual performance
  status VARCHAR(50) DEFAULT 'draft' -- draft, approved, published
);

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES content_templates(id),
  
  platform VARCHAR(50) NOT NULL,
  
  -- Content (may be customized from template)
  text_content TEXT,
  media_urls TEXT[],
  hashtags TEXT[],
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  
  -- Platform-specific data
  platform_post_id VARCHAR(255), -- ID from the social platform
  platform_response JSONB, -- raw response from API
  
  -- Analytics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  status VARCHAR(50) DEFAULT 'scheduled' -- scheduled, posted, failed
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Lead information
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Source
  source_platform VARCHAR(50), -- facebook, instagram, linkedin, etc.
  source_post_id UUID REFERENCES social_posts(id),
  source_url TEXT,
  
  -- Qualification
  qualification_score DECIMAL(3, 2), -- 0.0 to 1.0
  intent VARCHAR(50), -- inquiry, booking, support, complaint
  
  -- Tags and notes
  tags TEXT[],
  notes TEXT,
  
  status VARCHAR(50) DEFAULT 'new' -- new, contacted, qualified, converted, lost
);

-- Conversations table (AI sales agent interactions)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  platform VARCHAR(50) NOT NULL,
  
  -- Conversation data
  messages JSONB DEFAULT '[]'::jsonb, -- array of message objects
  
  -- Context
  detected_intent VARCHAR(50),
  sentiment VARCHAR(50), -- positive, neutral, negative
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, closed, escalated
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings/Requests table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  
  -- Booking details
  booking_type VARCHAR(100), -- car_wash, hotel, isp_connection, etc.
  service_date TIMESTAMP WITH TIME ZONE,
  service_details JSONB, -- flexible JSON for different booking types
  
  -- Payment
  total_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
  payment_provider VARCHAR(50), -- stripe, paypal, etc.
  payment_transaction_id VARCHAR(255),
  
  -- Confirmation
  confirmation_sent BOOLEAN DEFAULT false,
  confirmation_email_sent_at TIMESTAMP WITH TIME ZONE,
  confirmation_sms_sent_at TIMESTAMP WITH TIME ZONE,
  
  status VARCHAR(50) DEFAULT 'pending' -- pending, confirmed, completed, cancelled
);

-- Create indexes for better query performance
CREATE INDEX idx_competitors_business_id ON competitors(business_id);
CREATE INDEX idx_content_templates_business_id ON content_templates(business_id);
CREATE INDEX idx_social_posts_business_id ON social_posts(business_id);
CREATE INDEX idx_social_posts_scheduled_for ON social_posts(scheduled_for);
CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_service_date ON bookings(service_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
