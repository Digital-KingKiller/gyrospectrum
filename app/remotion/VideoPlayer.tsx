'use client'

import { Player } from '@remotion/player'
import { SlideshowComposition, Scene } from './SlideshowComposition'
import { MotionComposition } from './MotionComposition'
import { CinematicComposition } from './CinematicComposition'

interface VideoPlayerProps {
    scenes: Scene[]
    audioUrl?: string
    className?: string
    width?: number
    height?: number
    autoPlay?: boolean
    videoStyle?: 'slideshow' | 'stock' | 'motion' | 'cinematic'
}

export default function VideoPlayer({
    scenes,
    audioUrl,
    className = '',
    width = 640,
    height = 360,
    autoPlay = false,
    videoStyle = 'slideshow'
}: VideoPlayerProps) {
    // Calculate total duration
    const totalDurationSeconds = scenes.reduce((acc, scene) => acc + scene.durationInSeconds, 0)

    // Choose component based on style
    // Strategy 1 & 2 (Slideshow/Stock) use the SlideshowComposition engine
    // Strategy 3 (Motion) uses the new MotionComposition engine
    // Strategy 3 (Motion) uses the new MotionComposition engine
    // Strategy 4 (Cinematic) uses the Hybrid Cinematic engine
    let CompositionComponent: any = SlideshowComposition
    if (videoStyle === 'motion') {
        CompositionComponent = MotionComposition
    } else if (videoStyle === 'cinematic') {
        CompositionComponent = CinematicComposition
    }

    return (
        <div className={`rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 ${className}`}>
            <Player
                component={CompositionComponent}
                inputProps={{
                    scenes,
                    // Pass specific visual props if needed or let them fallback
                    primaryColor: '#2563eb',
                    audioUrl
                }}
                durationInFrames={Math.ceil(totalDurationSeconds * 30)}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{
                    width: '100%',
                    aspectRatio: '16/9',
                }}
                controls
                autoPlay={autoPlay}
                loop
            />
        </div>
    )
}
