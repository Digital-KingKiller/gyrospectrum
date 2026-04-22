require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    console.log('Testing Gemini API...\n');

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GOOGLE_GEMINI_API_KEY not found in .env.local');
        process.exit(1);
    }

    console.log('✅ API Key found (length:', apiKey.length, ')');
    console.log('   Key starts with:', apiKey.substring(0, 15) + '...\n');

    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try models in order of preference
        const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

        for (const modelName of modelsToTry) {
            console.log(`🔍 Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say "Hello!"');
                const response = result.response.text();

                console.log(`✅ Model ${modelName} works!`);
                console.log('   Response:', response.substring(0, 100));
                console.log(`\n🎉 Use model: ${modelName}\n`);
                process.exit(0);
            } catch (modelError) {
                console.log(`❌ Model ${modelName} failed:`, modelError.message?.substring(0, 100));
            }
        }

        console.error('\n❌ No models available. Check your API key and quota.');
        console.error('   Go to: https://ai.google.dev to check your key\n');
        process.exit(1);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testGemini();
