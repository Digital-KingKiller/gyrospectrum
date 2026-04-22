#!/usr/bin/env node

/**
 * Sample Data Seeder
 * Generates demo data for testing
 */

require('dotenv').config({ path: '.env.local' });

async function seedData() {
    console.log('🌱 Seeding sample data...\n');

    const { createClient } = require('@supabase/supabase-js');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Create sample business
        console.log('Creating sample business...');
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .insert({
                name: 'TechVision IoT Solutions',
                description: 'We provide cutting-edge IoT solutions for manufacturing companies to optimize production lines, reduce downtime, and improve efficiency through real-time monitoring and predictive analytics.',
                industry: 'IoT & Manufacturing Technology',
                target_audience: 'Manufacturing companies, warehouse operators, supply chain managers',
                brand_voice: 'professional',
                unique_value_proposition: 'Real-time production insights with AI-powered predictive maintenance',
                auto_post_enabled: false,
                auto_respond_enabled: false,
            })
            .select()
            .single();

        if (businessError) throw businessError;
        console.log('✅ Business created:', business.name);

        // Create sample competitors
        console.log('\nCreating sample competitors...');
        const competitors = [
            {
                business_id: business.id,
                name: 'Smart Factory Solutions',
                website_url: 'https://example-smart-factory.com',
                competitor_type: 'direct',
                social_media_presence: {
                    linkedin: 'https://linkedin.com/company/smart-factory',
                    twitter: 'https://twitter.com/smartfactory',
                },
                content_strategy: {
                    posting_frequency: '3-4 times per week',
                    content_types: ['case studies', 'product updates', 'industry insights'],
                },
                success_factors: [
                    'Strong case study content',
                    'Active LinkedIn presence',
                    'Regular webinar series',
                ],
                techniques: [
                    'Customer success stories',
                    'ROI calculators',
                    'Free consultation offers',
                ],
                sentiment_score: 0.82,
                analysis_status: 'completed',
                last_analyzed_at: new Date().toISOString(),
            },
            {
                business_id: business.id,
                name: 'Industrial IoT Hub',
                website_url: 'https://example-iot-hub.com',
                competitor_type: 'direct',
                social_media_presence: {
                    linkedin: 'https://linkedin.com/company/iot-hub',
                    facebook: 'https://facebook.com/iothub',
                },
                success_factors: [
                    'Educational content strategy',
                    'Strong visual branding',
                    'Industry partnerships',
                ],
                techniques: [
                    'Video tutorials',
                    'Infographics',
                    'Partner showcases',
                ],
                sentiment_score: 0.75,
                analysis_status: 'completed',
                last_analyzed_at: new Date().toISOString(),
            },
        ];

        for (const comp of competitors) {
            const { error } = await supabase.from('competitors').insert(comp);
            if (error) throw error;
            console.log('✅ Competitor created:', comp.name);
        }

        // Create sample content templates
        console.log('\nCreating sample content templates...');
        const templates = [
            {
                business_id: business.id,
                title: 'ROI Case Study Post',
                content_type: 'text',
                platform: 'linkedin',
                text_content: '🏭 Manufacturing transformed! Our client reduced downtime by 45% in just 3 months using our IoT monitoring solution. Real-time insights = Real results. Learn how we can help your facility: [link]',
                hashtags: ['Manufacturing', 'IoT', 'IndustryAI', 'SmartFactory'],
                call_to_action: 'Book a free consultation',
                status: 'approved',
            },
            {
                business_id: business.id,
                title: 'Educational Instagram Post',
                content_type: 'image',
                platform: 'instagram',
                text_content: '💡 Did you know? Predictive maintenance can reduce equipment failures by up to 70%! Our AI-powered IoT sensors detect issues before they become problems. Swipe to learn more ➡️',
                hashtags: ['IoT', 'SmartManufacturing', 'Industry40', 'PredictiveMaintenance', 'TechInnovation'],
                call_to_action: 'Visit our website',
                status: 'draft',
            },
        ];

        for (const template of templates) {
            const { error } = await supabase.from('content_templates').insert(template);
            if (error) throw error;
            console.log('✅ Content template created:', template.title);
        }

        // Create sample lead
        console.log('\nCreating sample lead...');
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert({
                business_id: business.id,
                name: 'John Smith',
                email: 'john.smith@manufacturing-co.com',
                phone: '+1-555-0123',
                source_platform: 'linkedin',
                qualification_score: 0.85,
                intent: 'booking',
                tags: ['manufacturing', 'high-priority', 'demo-requested'],
                notes: 'Interested in predictive maintenance solution for 3 production lines',
                status: 'qualified',
            })
            .select()
            .single();

        if (leadError) throw leadError;
        console.log('✅ Lead created:', lead.name);

        // Create sample conversation
        console.log('\nCreating sample conversation...');
        await supabase
            .from('conversations')
            .insert({
                business_id: business.id,
                lead_id: lead.id,
                platform: 'linkedin',
                messages: [
                    {
                        role: 'user',
                        content: 'Hi, I saw your post about reducing downtime. Can you tell me more?',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                        role: 'assistant',
                        content: 'Hello! Thanks for reaching out. We help manufacturers reduce downtime through real-time IoT monitoring and predictive analytics. What type of production lines are you working with?',
                        timestamp: new Date(Date.now() - 3300000).toISOString(),
                    },
                    {
                        role: 'user',
                        content: 'We have 3 assembly lines that experience frequent unexpected shutdowns.',
                        timestamp: new Date(Date.now() - 1800000).toISOString(),
                    },
                ],
                detected_intent: 'booking',
                sentiment: 'positive',
                status: 'active',
            });

        console.log('✅ Conversation created');

        console.log('\n🎉 Sample data seeded successfully!\n');
        console.log('📊 Summary:');
        console.log('   • 1 Business');
        console.log('   • 2 Competitors');
        console.log('   • 2 Content Templates');
        console.log('   • 1 Lead');
        console.log('   • 1 Conversation\n');
        console.log('🚀 Ready to test! Run: npm run dev\n');

    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

seedData();
