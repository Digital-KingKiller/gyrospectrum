'use client'

import { useState, useRef } from 'react'
import { Video, Sparkles, Download, Play, Film, Loader2, Upload, Music, Check, X } from 'lucide-react'
import VideoPlayer from '@/app/remotion/VideoPlayer'
import { Scene } from '@/app/remotion/SlideshowComposition'

type VideoStyle = 'slideshow' | 'motion' | 'cinematic'
type MusicTrack = 'none' | 'corporate' | 'inspiring' | 'energetic'
type TabMode = 'generate' | 'upload'

const MUSIC_TRACKS: Record<MusicTrack, { label: string; url: string | null; icon: string }> = {
    none: { label: 'No Music', url: null, icon: '🔇' },
    corporate: { label: 'Corporate', url: 'https://cdn.pixabay.com/audio/2024/02/14/audio_88cf07d82b.mp3', icon: '💼' },
    inspiring: { label: 'Inspiring', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3', icon: '✨' },
    energetic: { label: 'Energetic', url: 'https://cdn.pixabay.com/audio/2024/09/27/audio_7595ab2c25.mp3', icon: '⚡' },
}

export default function VideoPage() {
    const [tabMode, setTabMode] = useState<TabMode>('generate')
    const [topic, setTopic] = useState('')
    const [style, setStyle] = useState<VideoStyle>('cinematic')
    const [musicTrack, setMusicTrack] = useState<MusicTrack>('corporate')
    const [isGenerating, setIsGenerating] = useState(false)
    const [scenes, setScenes] = useState<Scene[]>([])
    const [error, setError] = useState('')
    const [audioUrl, setAudioUrl] = useState<string | null>(MUSIC_TRACKS.corporate.url)

    // Upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic')
            return
        }

        setIsGenerating(true)
        setError('')
        setScenes([])

        try {
            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, style })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            setScenes(data.scenes)
            setAudioUrl(MUSIC_TRACKS[musicTrack].url)
        } catch (err: any) {
            setError(err.message || 'Failed to generate video')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleMusicChange = (track: MusicTrack) => {
        setMusicTrack(track)
        setAudioUrl(MUSIC_TRACKS[track].url)
    }

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('video/')) {
            setUploadedFile(file)
            setAnalysisResult(null)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setAnalysisResult(null)
        }
    }

    const handleAnalyzeUpload = async () => {
        if (!uploadedFile) return

        setIsAnalyzing(true)
        setError('')

        try {
            // For now, we'll simulate AI analysis since video transcription requires external services
            // In production, you'd upload to Supabase Storage and call an AI service
            await new Promise(resolve => setTimeout(resolve, 2000))

            setAnalysisResult({
                suggestedScenes: [
                    { timestamp: '0:00', suggestion: 'Add hook text overlay' },
                    { timestamp: '0:05', suggestion: 'Insert brand logo' },
                    { timestamp: '0:15', suggestion: 'Add call-to-action' },
                    { timestamp: '0:25', suggestion: 'End with contact info' },
                ],
                recommendedMusic: 'corporate',
                suggestedText: [
                    'Your Vision, Our Expertise',
                    'Trusted by 1000+ Brands',
                    'Get Started Today →'
                ],
                duration: '30 seconds',
                quality: 'HD (1080p)',
            })
        } catch (err: any) {
            setError(err.message || 'Failed to analyze video')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">AI Video Studio</h2>
                    <p className="text-slate-600 mt-1">Create professional advertisements with AI</p>
                </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                    onClick={() => setTabMode('generate')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${tabMode === 'generate'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Generate
                </button>
                <button
                    onClick={() => setTabMode('upload')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${tabMode === 'upload'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    <Upload className="w-4 h-4" />
                    Upload & Analyze
                </button>
            </div>

            {/* Generator Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {tabMode === 'generate' ? (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Generate Advertisement</h3>
                                    <p className="text-sm text-slate-500">AI creates scenes, scripts, and visuals with music</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                {/* Topic Input */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Video Topic
                                    </label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Top 5 Marketing Automation Tips for 2025"
                                        disabled={isGenerating}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
                                    />
                                </div>

                                {/* Style Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Video Style
                                    </label>
                                    <select
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value as VideoStyle)}
                                        disabled={isGenerating}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
                                    >
                                        <option value="cinematic">🎬 Cinematic</option>
                                        <option value="motion">🎭 Motion Graphics</option>
                                        <option value="slideshow">📸 Slideshow</option>
                                    </select>
                                </div>

                                {/* Music Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        <Music className="w-4 h-4 inline mr-1" />
                                        Background Music
                                    </label>
                                    <select
                                        value={musicTrack}
                                        onChange={(e) => handleMusicChange(e.target.value as MusicTrack)}
                                        disabled={isGenerating}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
                                    >
                                        {Object.entries(MUSIC_TRACKS).map(([key, track]) => (
                                            <option key={key} value={key}>
                                                {track.icon} {track.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic.trim()}
                                className="mt-4 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-4 h-4" />
                                        Generate Advertisement
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Upload Mode */}
                        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Upload className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Upload & Analyze</h3>
                                    <p className="text-sm text-slate-500">AI analyzes your video and suggests improvements</p>
                                </div>
                            </div>

                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${uploadedFile
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {uploadedFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Check className="w-6 h-6 text-green-600" />
                                        <span className="font-medium text-green-700">{uploadedFile.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setUploadedFile(null)
                                                setAnalysisResult(null)
                                            }}
                                            className="p-1 hover:bg-green-100 rounded"
                                        >
                                            <X className="w-4 h-4 text-green-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                                        <p className="font-medium text-slate-700">Drop video here or click to upload</p>
                                        <p className="text-sm text-slate-500 mt-1">MP4, MOV, WebM up to 100MB</p>
                                    </>
                                )}
                            </div>

                            {uploadedFile && !analysisResult && (
                                <button
                                    onClick={handleAnalyzeUpload}
                                    disabled={isAnalyzing}
                                    className="mt-4 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Analyze with AI
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Analysis Results */}
                            {analysisResult && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="font-bold text-slate-800">AI Recommendations</h4>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                                            <h5 className="text-sm font-medium text-slate-600 mb-2">📍 Scene Suggestions</h5>
                                            <ul className="space-y-2">
                                                {analysisResult.suggestedScenes.map((scene: any, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                                        <span className="font-mono text-purple-600">{scene.timestamp}</span>
                                                        <span className="text-slate-700">{scene.suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                                            <h5 className="text-sm font-medium text-slate-600 mb-2">✏️ Text Overlays</h5>
                                            <ul className="space-y-2">
                                                {analysisResult.suggestedText.map((text: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded">
                                                        "{text}"
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-sm">
                                        <div className="bg-purple-50 px-4 py-2 rounded-lg">
                                            <span className="text-purple-600 font-medium">🎵 Recommended:</span> {analysisResult.recommendedMusic}
                                        </div>
                                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                            <span className="text-blue-600 font-medium">⏱️ Duration:</span> {analysisResult.duration}
                                        </div>
                                        <div className="bg-green-50 px-4 py-2 rounded-lg">
                                            <span className="text-green-600 font-medium">📐 Quality:</span> {analysisResult.quality}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Preview Area */}
                <div className="p-6">
                    {scenes.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Preview
                                    {audioUrl && (
                                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Music className="w-3 h-3" />
                                            {MUSIC_TRACKS[musicTrack].label}
                                        </span>
                                    )}
                                </h4>
                                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>

                            <VideoPlayer
                                scenes={scenes}
                                videoStyle={style}
                                audioUrl={audioUrl || undefined}
                                autoPlay={false}
                            />

                            {/* Scene List */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-600">Scenes ({scenes.length})</h4>
                                <div className="grid gap-2">
                                    {scenes.map((scene, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                        >
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">{scene.textTitle}</p>
                                                <p className="text-xs text-slate-500">{scene.durationInSeconds}s</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400">
                            <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No video generated yet</p>
                            <p className="text-sm">
                                {tabMode === 'generate'
                                    ? 'Enter a topic and click Generate to create an advertisement'
                                    : 'Upload a video to analyze and enhance with AI'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
