import React from 'react';
import { Composition } from 'remotion';
import { SlideshowComposition, Scene } from './SlideshowComposition';
import { MotionComposition } from './MotionComposition';
import { CinematicComposition } from './CinematicComposition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Slideshow"
                component={SlideshowComposition as React.FC<any>}
                durationInFrames={300} // Default, will be overridden
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    scenes: [] as Scene[],
                    audioUrl: '',
                    primaryColor: '#2563eb'
                }}
            />
            <Composition
                id="Motion"
                component={MotionComposition as React.FC<any>}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    scenes: [] as Scene[],
                    audioUrl: ''
                }}
            />
            <Composition
                id="Cinematic"
                component={CinematicComposition as React.FC<any>}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    scenes: [] as Scene[],
                    audioUrl: ''
                }}
            />
        </>
    );
};
