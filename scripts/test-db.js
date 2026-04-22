#!/usr/bin/env node

/**
 * Database Connection Tester
 * Verifies Supabase connection and table structure
 */

require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    // Check environment variables
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
    ];

    const missing = requiredEnvVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error('❌ Missing environment variables:');
        missing.forEach(v => console.error(`   - ${v}`));
        console.error('\nRun: node scripts/setup.js\n');
        process.exit(1);
    }

    console.log('✅ Environment variables found\n');

    try {
        const { createClient } = require('@supabase/supabase-js');

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log('🔌 Testing database connection...');

        // Test connection by listing tables
        const tables = [
            'businesses',
            'competitors',
            'content_templates',
            'social_posts',
            'leads',
            'conversations',
            'bookings',
        ];

        let allTablesExist = true;

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('id')
                    .limit(1);

                if (error && error.code === '42P01') {
                    console.log(`❌ Table "${table}" not found`);
                    allTablesExist = false;
                } else if (error) {
                    console.log(`⚠️  Table "${table}" - ${error.message}`);
                } else {
                    console.log(`✅ Table "${table}" exists`);
                }
            } catch (err) {
                console.log(`❌ Error checking table "${table}": ${err.message}`);
                allTablesExist = false;
            }
        }

        if (allTablesExist) {
            console.log('\n🎉 All tables exist! Database is ready.\n');
            console.log('Next step: npm run dev\n');
        } else {
            console.log('\n⚠️  Some tables are missing!');
            console.log('Run the migration in Supabase SQL Editor:');
            console.log('   supabase/migrations/001_initial_schema.sql\n');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('\nCheck your Supabase credentials in .env.local\n');
        process.exit(1);
    }
}

testConnection();
