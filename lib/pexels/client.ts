
const PEXELS_BASE_URL = 'https://api.pexels.com/videos';

export interface PexelsVideo {
    id: number;
    width: number;
    height: number;
    duration: number;
    image: string;
    video_files: {
        id: number;
        quality: string;
        file_type: string;
        width: number;
        height: number;
        link: string;
    }[];
}

export async function searchVideos(query: string, perPage: number = 5): Promise<PexelsVideo[]> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        console.warn('PEXELS_API_KEY is not set');
        return [];
    }

    try {
        const response = await fetch(`${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`, {
            headers: {
                Authorization: apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Pexels API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.videos || [];
    } catch (error) {
        console.error('Error searching Pexels videos:', error);
        return [];
    }
}

export async function getBestMatchVideo(query: string): Promise<string | null> {
    const videos = await searchVideos(query, 3);
    if (videos.length === 0) return null;

    // Prefer HD files (1920x1080) or closest match
    const video = videos[0];
    const hdFile = video.video_files.find(f => f.width === 1920 && f.height === 1080) ||
        video.video_files.find(f => f.width >= 1280) ||
        video.video_files[0];

    return hdFile?.link || null;
}
