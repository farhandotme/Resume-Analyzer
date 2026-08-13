import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StoryProvider, useStory } from './StoryContext';

import StoryProgress from './StoryProgress';
import Story1 from './Story1';
import Story2 from './Story2';
import Story3 from './Story3';
import Story4 from './Story4';
import Story5 from './Story5';
import Story6 from './Story6';
import Story7 from './Story7';

const STORY_DURATIONS = [8000, 5000, 6000, 6000, 10000, 6000, 8000];

const StoryContent = () => {
    const { paused, setPaused } = useStory();

    const [currentStory, setCurrentStory] = useState(0);
    const [progress, setProgress] = useState(0);

    const totalStories = STORY_DURATIONS.length;

    const holdTimer = useRef<number | null>(null);
    const didHold = useRef(false);
    const suppressNextClick = useRef(false);

    useEffect(() => {
        if (paused) return;

        const interval = window.setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (currentStory < totalStories - 1) {
                        setCurrentStory((story) => story + 1);
                        return 0;
                    }
                    return 100;
                }
                return prev + 1;
            });
        }, STORY_DURATIONS[currentStory] / 100);

        return () => {
            window.clearInterval(interval);
        };
    }, [currentStory, paused, totalStories]);

    const clearHoldTimer = () => {
        if (holdTimer.current !== null) {
            window.clearTimeout(holdTimer.current);

            holdTimer.current = null;
        }
    };

    const handlePointerDown = () => {
        clearHoldTimer();

        didHold.current = false;
        suppressNextClick.current = false;

        holdTimer.current = window.setTimeout(() => {
            didHold.current = true;
            suppressNextClick.current = true;
            setPaused(true);
        }, 180);
    };

    const handlePointerUp = () => {
        clearHoldTimer();
        if (didHold.current) {
            setPaused(false);
            return;
        }
    };

    const handlePointerLeave = () => {
        clearHoldTimer();

        if (didHold.current) {
            setPaused(false);
        }
    };

    const handlePrevious = () => {
        if (suppressNextClick.current) {
            suppressNextClick.current = false;
            didHold.current = false;
            return;
        }

        if (currentStory > 0) {
            setCurrentStory((story) => story - 1);
            setProgress(0);
        }
    };

    const handleNext = () => {
        if (suppressNextClick.current) {
            suppressNextClick.current = false;
            didHold.current = false;
            return;
        }

        if (currentStory < totalStories - 1) {
            setCurrentStory((story) => story + 1);
            setProgress(0);
        }
    };

    return (
        <main className='relative flex h-screen select-none items-center justify-center overflow-hidden bg-white' onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerLeave}>
            <div className='absolute inset-0 z-40 flex'>
                <button type='button' aria-label='Previous story' className='h-full w-1/2 bg-transparent outline-none' onClick={handlePrevious} />

                <button type='button' aria-label='Next story' className='h-full w-1/2 bg-transparent outline-none' onClick={handleNext} />
            </div>

            <StoryProgress totalStories={totalStories} currentStory={currentStory} progress={progress} />

            {currentStory === 0 && <Story1 />}
            {currentStory === 1 && <Story2 />}
            {currentStory === 2 && <Story3 />}
            {currentStory === 3 && <Story4 />}
            {currentStory === 4 && <Story5 />}
            {currentStory === 5 && <Story6 />}
            {currentStory === 6 && <Story7 />}
        </main>
    );
};

const Story = () => {
    const location = useLocation();
    const analysisResult = location.state?.analysisResult;

    return (
        <StoryProvider initialAnalysisResult={analysisResult}>
            <StoryContent />
        </StoryProvider>
    );
};

export default Story;