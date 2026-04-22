
const { createClient } = require('pexels');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testPexels() {
    console.log('🧪 Testing Pexels API Integration (Direct)...');

    // 1. Check API Key
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        console.error('❌ PEXELS_API_KEY is missing in .env.local');
        return;
    }
    console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');

    // 2. Initialize Client
    try {
        const client = createClient(apiKey);

        // 3. Search
        const query = 'coding';
        console.log(`\n🔍 Searching for video with query: "${query}"...`);

        const response = await client.videos.search({
            query,
            per_page: 1,
            orientation: 'landscape',
            size: 'medium'
        });

        if ('videos' in response && response.videos.length > 0) {
            const video = response.videos[0];
            const bestFile = video.video_files.find(f => f.width === 1920) || video.video_files[0];

            console.log('✅ Video found!');
            console.log('- ID:', video.id);
            console.log('- URL:', bestFile.link);
            console.log(`- Resolution: ${bestFile.width}x${bestFile.height}`);
            console.log(`- Duration: ${video.duration}s`);
            console.log('- Verified: Pexels API connection is WORKING.');
        } else {
            console.warn('⚠️ No video found (or API limit reached?). Response:', JSON.stringify(response));
        }

    } catch (error) {
        console.error('❌ Integration Test Failed:', error.message);
    }
}

testPexels();
