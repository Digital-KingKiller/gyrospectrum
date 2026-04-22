import { createClient } from 'pexels';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY is missing. Video generation will fallback to static images.');
}

const client = PEXELS_API_KEY ? createClient(PEXELS_API_KEY) : null;

export interface StockVideo {
    url: string;
    width: number;
    height: number;
    duration: number;
    image: string;
}

export async function searchStockVideo(query: string): Promise<StockVideo | null> {
    if (!client) return null;

    try {
        const response = await client.videos.search({
            query,
            per_page: 1,
            orientation: 'landscape',
            size: 'medium'
        });

        if ('videos' in response && response.videos.length > 0) {
            const video = response.videos[0];
            // Prefer HD quality (1920x1080 or close to it)
            const bestFile = video.video_files.find(f => f.width === 1920) || video.video_files[0];

            return {
                url: bestFile.link,
                width: bestFile.width || 1920,
                height: bestFile.height || 1080,
                duration: video.duration,
                image: video.image
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching from Pexels:', error);
        return null;
    }
}
