export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            businesses: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    name: string
                    description: string
                    industry: string | null
                    target_audience: string | null
                    logo_url: string | null
                    primary_color: string | null
                    secondary_color: string | null
                    brand_voice: string | null
                    unique_value_proposition: string | null
                    facebook_page_id: string | null
                    instagram_account_id: string | null
                    linkedin_page_id: string | null
                    tiktok_account_id: string | null
                    whatsapp_business_id: string | null
                    auto_post_enabled: boolean
                    auto_respond_enabled: boolean
                    user_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    description: string
                    industry?: string | null
                    target_audience?: string | null
                    logo_url?: string | null
                    primary_color?: string | null
                    secondary_color?: string | null
                    brand_voice?: string | null
                    unique_value_proposition?: string | null
                    facebook_page_id?: string | null
                    instagram_account_id?: string | null
                    linkedin_page_id?: string | null
                    tiktok_account_id?: string | null
                    whatsapp_business_id?: string | null
                    auto_post_enabled?: boolean
                    auto_respond_enabled?: boolean
                    user_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    description?: string
                    industry?: string | null
                    target_audience?: string | null
                    logo_url?: string | null
                    primary_color?: string | null
                    secondary_color?: string | null
                    brand_voice?: string | null
                    unique_value_proposition?: string | null
                    facebook_page_id?: string | null
                    instagram_account_id?: string | null
                    linkedin_page_id?: string | null
                    tiktok_account_id?: string | null
                    whatsapp_business_id?: string | null
                    auto_post_enabled?: boolean
                    auto_respond_enabled?: boolean
                    user_id?: string | null
                }
                    Relationships: any[]
            }
            competitors: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    business_id: string
                    name: string
                    website_url: string | null
                    competitor_type: string | null
                    social_media_presence: Json | null
                    content_strategy: Json | null
                    engagement_metrics: Json | null
                    success_factors: string[] | null
                    techniques: string[] | null
                    sentiment_score: number | null
                    last_analyzed_at: string | null
                    analysis_status: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id: string
                    name: string
                    website_url?: string | null
                    competitor_type?: string | null
                    social_media_presence?: Json | null
                    content_strategy?: Json | null
                    engagement_metrics?: Json | null
                    success_factors?: string[] | null
                    techniques?: string[] | null
                    sentiment_score?: number | null
                    last_analyzed_at?: string | null
                    analysis_status?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id?: string
                    name?: string
                    website_url?: string | null
                    competitor_type?: string | null
                    social_media_presence?: Json | null
                    content_strategy?: Json | null
                    engagement_metrics?: Json | null
                    success_factors?: string[] | null
                    techniques?: string[] | null
                    sentiment_score?: number | null
                    last_analyzed_at?: string | null
                    analysis_status?: string
                }
                    Relationships: any[]
            }
            content_templates: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    business_id: string
                    title: string | null
                    content_type: string | null
                    platform: string | null
                    text_content: string | null
                    media_urls: string[] | null
                    hashtags: string[] | null
                    call_to_action: string | null
                    based_on_competitor_id: string | null
                    performance_score: number | null
                    status: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id: string
                    title?: string | null
                    content_type?: string | null
                    platform?: string | null
                    text_content?: string | null
                    media_urls?: string[] | null
                    hashtags?: string[] | null
                    call_to_action?: string | null
                    based_on_competitor_id?: string | null
                    performance_score?: number | null
                    status?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id?: string
                    title?: string | null
                    content_type?: string | null
                    platform?: string | null
                    text_content?: string | null
                    media_urls?: string[] | null
                    hashtags?: string[] | null
                    call_to_action?: string | null
                    based_on_competitor_id?: string | null
                    performance_score?: number | null
                    status?: string
                }
                    Relationships: any[]
            }
            social_posts: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    business_id: string
                    template_id: string | null
                    platform: string
                    text_content: string | null
                    media_urls: string[] | null
                    hashtags: string[] | null
                    scheduled_for: string | null
                    posted_at: string | null
                    platform_post_id: string | null
                    platform_response: Json | null
                    likes_count: number
                    comments_count: number
                    shares_count: number
                    reach: number
                    impressions: number
                    status: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id: string
                    template_id?: string | null
                    platform: string
                    text_content?: string | null
                    media_urls?: string[] | null
                    hashtags?: string[] | null
                    scheduled_for?: string | null
                    posted_at?: string | null
                    platform_post_id?: string | null
                    platform_response?: Json | null
                    likes_count?: number
                    comments_count?: number
                    shares_count?: number
                    reach?: number
                    impressions?: number
                    status?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id?: string
                    template_id?: string | null
                    platform?: string
                    text_content?: string | null
                    media_urls?: string[] | null
                    hashtags?: string[] | null
                    scheduled_for?: string | null
                    posted_at?: string | null
                    platform_post_id?: string | null
                    platform_response?: Json | null
                    likes_count?: number
                    comments_count?: number
                    shares_count?: number
                    reach?: number
                    impressions?: number
                    status?: string
                }
                    Relationships: any[]
            }
            leads: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    business_id: string
                    name: string | null
                    email: string | null
                    phone: string | null
                    source_platform: string | null
                    source_post_id: string | null
                    source_url: string | null
                    qualification_score: number | null
                    intent: string | null
                    tags: string[] | null
                    notes: string | null
                    status: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id: string
                    name?: string | null
                    email?: string | null
                    phone?: string | null
                    source_platform?: string | null
                    source_post_id?: string | null
                    source_url?: string | null
                    qualification_score?: number | null
                    intent?: string | null
                    tags?: string[] | null
                    notes?: string | null
                    status?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id?: string
                    name?: string | null
                    email?: string | null
                    phone?: string | null
                    source_platform?: string | null
                    source_post_id?: string | null
                    source_url?: string | null
                    qualification_score?: number | null
                    intent?: string | null
                    tags?: string[] | null
                    notes?: string | null
                    status?: string
                }
                    Relationships: any[]
            }
            conversations: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    business_id: string
                    lead_id: string
                    platform: string
                    messages: Json
                    detected_intent: string | null
                    sentiment: string | null
                    status: string
                    last_message_at: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id: string
                    lead_id: string
                    platform: string
                    messages?: Json
                    detected_intent?: string | null
                    sentiment?: string | null
                    status?: string
                    last_message_at?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id?: string
                    lead_id?: string
                    platform?: string
                    messages?: Json
                    detected_intent?: string | null
                    sentiment?: string | null
                    status?: string
                    last_message_at?: string
                }
                    Relationships: any[]
            }
            bookings: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    business_id: string
                    lead_id: string
                    conversation_id: string | null
                    booking_type: string | null
                    service_date: string | null
                    service_details: Json | null
                    total_amount: number | null
                    currency: string
                    payment_status: string
                    payment_provider: string | null
                    payment_transaction_id: string | null
                    confirmation_sent: boolean
                    confirmation_email_sent_at: string | null
                    confirmation_sms_sent_at: string | null
                    status: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id: string
                    lead_id: string
                    conversation_id?: string | null
                    booking_type?: string | null
                    service_date?: string | null
                    service_details?: Json | null
                    total_amount?: number | null
                    currency?: string
                    payment_status?: string
                    payment_provider?: string | null
                    payment_transaction_id?: string | null
                    confirmation_sent?: boolean
                    confirmation_email_sent_at?: string | null
                    confirmation_sms_sent_at?: string | null
                    status?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    business_id?: string
                    lead_id?: string
                    conversation_id?: string | null
                    booking_type?: string | null
                    service_date?: string | null
                    service_details?: Json | null
                    total_amount?: number | null
                    currency?: string
                    payment_status?: string
                    payment_provider?: string | null
                    payment_transaction_id?: string | null
                    confirmation_sent?: boolean
                    confirmation_email_sent_at?: string | null
                    confirmation_sms_sent_at?: string | null
                    status?: string
                }
                    Relationships: any[]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Exported types for convenience
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Business = Database['public']['Tables']['businesses']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Competitor = Database['public']['Tables']['competitors']['Row']
export type ContentTemplate = Database['public']['Tables']['content_templates']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
