'use client'

import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Series, Audio, spring } from 'remotion'
import { Rocket, Zap, BarChart3, Globe, Shield, Star, Award, TrendingUp, Lightbulb } from 'lucide-react'

// Reuse Scene interface but we can extend it effectively
export interface Scene {
    imageUrl: string
    textTitle: string
    textSubtitle: string
    durationInSeconds: number
    videoUrl?: string
    voiceoverUrl?: string
    // Optional extras for motion style
    iconName?: string
    primaryColor?: string
    secondaryColor?: string
}

interface MotionProps {
    scenes: Scene[]
    audioUrl?: string
}

// Map string names to Lucide icons
const ICONS: Record<string, React.FC<any>> = {
    'rocket': Rocket,
    'zap': Zap,
    'chart': BarChart3,
    'globe': Globe,
    'shield': Shield,
    'star': Star,
    'award': Award,
    'trend': TrendingUp,
    'idea': Lightbulb
}

const MotionSlide: React.FC<{
    scene: Scene,
    color: string
}> = ({ scene, color }) => {
    const frame = useCurrentFrame()
    const { fps, width, height } = useVideoConfig()

    // 1. Dynamic Background Animation (Moving Grid)
    const gridMove = interpolate(frame, [0, 300], [0, 100])

    // 2. Text Entrance (Spring Physics)
    const entrance = spring({
        frame,
        fps,
        config: { damping: 12 }
    })

    // 3. Icon Scale/Rotate
    const iconScale = interpolate(entrance, [0, 1], [0, 1])
    const iconRotate = interpolate(frame, [0, 150], [0, 10])

    const IconComponent = scene.iconName && ICONS[scene.iconName] ? ICONS[scene.iconName] : Star

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', overflow: 'hidden' }}>
            {/* Voiceover Track */}
            {scene.voiceoverUrl && (
                <Audio src={scene.voiceoverUrl} volume={1.0} />
            )}

            {/* Animated Grid Background */}
            <AbsoluteFill style={{
                backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                backgroundPosition: `${gridMove}px ${gridMove}px`,
                opacity: 0.3
            }} />

            {/* Ambient Floating Blobs */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: color,
                filter: 'blur(100px)',
                opacity: 0.15,
                borderRadius: '50%',
                transform: `translate(${Math.sin(frame / 50) * 30}px, ${Math.cos(frame / 40) * 30}px)`
            }} />

            <AbsoluteFill className="flex flex-row items-center justify-center p-20 gap-16">

                {/* Left Side: Large Icon */}
                <div style={{
                    transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
                    opacity: entrance
                }}>
                    <div className="p-12 rounded-3xl bg-slate-800/50 border border-slate-700 shadow-2xl backdrop-blur-sm">
                        <IconComponent
                            size={180}
                            color={color}
                            strokeWidth={1.5}
                        />
                    </div>
                </div>

                {/* Right Side: Typography */}
                <div className="flex-1 max-w-3xl">
                    <h1
                        className="text-8xl font-black text-white mb-8 leading-tight tracking-tighter"
                        style={{
                            transform: `translateY(${(1 - entrance) * 50}px)`,
                            opacity: entrance
                        }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            {scene.textTitle.toUpperCase()}
                        </span>
                    </h1>

                    <div
                        className="bg-slate-800/80 p-8 rounded-tr-3xl rounded-bl-3xl border-l-8"
                        style={{
                            borderColor: color,
                            transform: `translateX(${(1 - entrance) * 100}px)`,
                            opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' })
                        }}
                    >
                        <p className="text-4xl font-medium text-slate-200 leading-normal">
                            {scene.textSubtitle}
                        </p>
                    </div>
                </div>

            </AbsoluteFill>
        </AbsoluteFill>
    )
}

export const MotionComposition: React.FC<MotionProps> = ({ scenes, audioUrl }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {audioUrl && (
                <Audio src={audioUrl} volume={0.15} loop />
            )}
            <Series>
                {scenes.map((scene, index) => {
                    // Cycle through nice tech colors if not specified
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']
                    const color = scene.primaryColor || colors[index % colors.length]

                    return (
                        <Series.Sequence key={index} durationInFrames={Math.ceil(scene.durationInSeconds * 30)}>
                            <MotionSlide scene={scene} color={color} />
                        </Series.Sequence>
                    )
                })}
            </Series>
        </AbsoluteFill>
    )
}
