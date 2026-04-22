import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, interpolate, Audio, Video, Img, useVideoConfig } from 'remotion';

export interface Scene {
    textTitle: string
    textSubtitle: string
    durationInSeconds: number
    imageUrl: string
    videoUrl?: string
    iconName?: string // kept for interface compatibility
    primaryColor?: string // kept for interface compatibility
    voiceoverUrl?: string
}

interface CinematicProps {
    scenes: Scene[]
    audioUrl?: string
    primaryColor?: string
}

const CinematicSlide: React.FC<{ scene: Scene }> = ({ scene }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Cinematic Animations
    const durationFrames = scene.durationInSeconds * fps;

    // Slow, heavy scale (The "Kubrick" zoom)
    const scale = interpolate(frame, [0, durationFrames], [1, 1.15], { extrapolateRight: 'clamp' });

    // Text Reveal: Staggered fade up
    const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [5, 25], [40, 0], { extrapolateRight: 'clamp', easing: (t) => t * (2 - t) });

    const subOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' });
    const subY = interpolate(frame, [25, 45], [40, 0], { extrapolateRight: 'clamp', easing: (t) => t * (2 - t) });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {/* 1. Background Layer (Video or Image) */}
            <AbsoluteFill>
                <div style={{
                    transform: `scale(${scale})`,
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.1s linear' // smoother
                }}>
                    {scene.videoUrl ? (
                        <Video
                            src={scene.videoUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                // High Contrast "Blockbuster" Grade
                                filter: 'contrast(1.25) saturation(1.1) brightness(0.85)',
                            }}
                            // Mute stock video audio
                            volume={0}
                        />
                    ) : (
                        <Img
                            src={scene.imageUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'contrast(1.25) saturation(1.1) brightness(0.7)',
                            }}
                        />
                    )}
                </div>
            </AbsoluteFill>

            {/* 2. Audio Layer (Voiceover) */}
            {scene.voiceoverUrl && (
                <Audio src={scene.voiceoverUrl} />
            )}

            {/* 3. Vignette Overlay */}
            <AbsoluteFill style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)'
            }} />

            {/* 4. Letterbox Bars (2.35:1 aspect on 16:9) */}
            {/* Top Bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '130px',
                backgroundColor: 'black',
                zIndex: 10
            }} />
            {/* Bottom Bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '130px',
                backgroundColor: 'black',
                zIndex: 10
            }} />

            {/* 5. Typography Layer */}
            <AbsoluteFill
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    zIndex: 20 // Above bars? No, text usually stays within safe area, but for "Cinematic" sometimes it overlaps. Let's keep it safe.
                    // Actually, usually headers are inside the safe zone (between bars).
                    // Available height approx 820px.
                }}
            >
                <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: 'center' }}>
                    <h1
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 900,
                            fontSize: '110px',
                            color: '#ffffff',
                            textTransform: 'uppercase',
                            lineHeight: 0.9,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                            padding: '0 40px'
                        }}
                    >
                        {scene.textTitle}
                    </h1>
                </div>

                <div style={{ opacity: subOpacity, transform: `translateY(${subY}px)`, marginTop: '20px' }}>
                    <h2
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            fontSize: '32px',
                            color: 'rgba(255,255,255,0.9)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            margin: 0,
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                        }}
                    >
                        {scene.textSubtitle}
                    </h2>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

export const CinematicComposition: React.FC<CinematicProps> = ({ scenes, audioUrl }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {audioUrl && (
                <Audio src={audioUrl} volume={0.6} loop />
            )}
            <Series>
                {scenes.map((scene, index) => {
                    return (
                        <Series.Sequence key={index} durationInFrames={Math.ceil(scene.durationInSeconds * 30)}>
                            <CinematicSlide scene={scene} />
                        </Series.Sequence>
                    )
                })}
            </Series>
        </AbsoluteFill>
    )
}
