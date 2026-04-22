'use client'

import { AbsoluteFill, Img, Video, interpolate, useCurrentFrame, useVideoConfig, Series, Audio } from 'remotion'

export interface Scene {
    imageUrl: string
    textTitle: string
    textSubtitle: string
    durationInSeconds: number
    videoUrl?: string
    voiceoverUrl?: string
}

interface SlideshowProps {
    scenes: Scene[]
    primaryColor?: string
    audioUrl?: string
}

const SceneSlide: React.FC<{
    scene: Scene,
    primaryColor: string
}> = ({ scene, primaryColor }) => {
    const frame = useCurrentFrame()
    const { fps, durationInFrames } = useVideoConfig()

    // Subtle Zoom Effect (Ken Burns)
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.15])

    // Text Fade Up
    const textOpacity = interpolate(frame, [10, 30], [0, 1])
    const textY = interpolate(frame, [10, 30], [30, 0])

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Voiceover Track (Specific to this scene) */}
            {scene.voiceoverUrl && (
                <Audio
                    src={scene.voiceoverUrl}
                    volume={1.0} // Voiceover is loud and clear
                />
            )}

            {/* Background Image/Video with Zoom */}
            <AbsoluteFill style={{ overflow: 'hidden' }}>
                {scene.videoUrl ? (
                    <Video
                        src={scene.videoUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Img
                        src={scene.imageUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${scale})`,
                        }}
                    />
                )}
                {/* Cinematic Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 100%)'
                    }}
                />
            </AbsoluteFill>

            {/* Text Content */}
            <AbsoluteFill className="flex flex-col items-center justify-center p-12 text-center z-10">
                <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}>
                    <h1
                        className="text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight uppercase"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        <span style={{ backgroundColor: primaryColor }} className="px-6 py-2">
                            {scene.textTitle}
                        </span>
                    </h1>
                    <p
                        className="text-5xl font-bold text-white drop-shadow-xl max-w-5xl leading-tight"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        {scene.textSubtitle}
                    </p>
                </div>
            </AbsoluteFill>

            {/* Footer Branding */}
            <div className="absolute bottom-12 right-12 flex items-center gap-4 opacity-90">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/90 font-bold text-xl tracking-wider uppercase">AI Generated</span>
            </div>
        </AbsoluteFill>
    )
}

export const SlideshowComposition: React.FC<SlideshowProps> = ({
    scenes,
    primaryColor = '#2563eb',
    audioUrl
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Background Music Track (Global) */}
            {audioUrl && (
                <Audio
                    src={audioUrl}
                    volume={0.15} // Lower volume so voiceover cuts through
                    loop
                />
            )}

            <Series>
                {scenes.map((scene, index) => (
                    <Series.Sequence
                        key={index}
                        durationInFrames={scene.durationInSeconds * 30}
                    >
                        <SceneSlide
                            scene={scene}
                            primaryColor={primaryColor}
                        />
                    </Series.Sequence>
                ))}
            </Series>
        </AbsoluteFill>
    )
}
