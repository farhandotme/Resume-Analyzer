import { useEffect, useRef, useState } from 'react';
import { StoryProvider, useStory } from './StoryContext';
import StoryProgress from './StoryProgress';
import Story1 from './Story1';
import Story2 from './Story2';
import Story3 from './Story3';

const STORY_DURATIONS = [7000, 3000, 5000, 0, 0, 0, 0, 0];

const StoryContent = () => {
    const { paused, setPaused } = useStory();

    const [currentStory, setCurrentStory] = useState(0);
    const [progress, setProgress] = useState(0);

    const totalStories = STORY_DURATIONS.length;

    const holdTimer = useRef<number | null>(null);

    useEffect(() => {
        if (paused) return;

        const interval = window.setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (currentStory < totalStories - 1) {
                        setCurrentStory((s) => s + 1);
                        return 0;
                    }
                    return 100;
                }
                return prev + 1;
            });
        }, STORY_DURATIONS[currentStory] / 100);

        return () => clearInterval(interval);
    }, [currentStory, paused]);

    return (
        <main
            className='relative flex h-screen select-none items-center justify-center overflow-hidden bg-white'
            onPointerDown={() => {
                holdTimer.current = window.setTimeout(() => {
                    setPaused(true);
                }, 180);
            }}
            onPointerUp={() => {
                if (holdTimer.current !== null) {
                    clearTimeout(holdTimer.current);
                }
                if (paused) {
                    setPaused(false);
                }
            }}
            onPointerLeave={() => {
                if (holdTimer.current !== null) {
                    clearTimeout(holdTimer.current);
                }
                if (paused) {
                    setPaused(false);
                }
            }}
        >
            <div className='absolute inset-0 z-40 flex'>
                <button
                    className='h-full w-1/2 bg-transparent outline-none'
                    onClick={() => {
                        if (currentStory > 0) {
                            setCurrentStory(currentStory - 1);
                            setProgress(0);
                        }
                    }}
                />
                <button
                    className='h-full w-1/2 bg-transparent outline-none'
                    onClick={() => {
                        if (currentStory < totalStories - 1) {
                            setCurrentStory(currentStory + 1);
                            setProgress(0);
                        }
                    }}
                />
            </div>
            <StoryProgress totalStories={totalStories} currentStory={currentStory} progress={progress} />
            {currentStory === 0 && <Story1 progress={progress} />}
            {currentStory === 1 && <Story2 />}
            {currentStory === 2 && <Story3 />}
        </main>
    );
};

const Story = () => {
    return (
        <StoryProvider>
            <StoryContent />
        </StoryProvider>
    );
};

export default Story;