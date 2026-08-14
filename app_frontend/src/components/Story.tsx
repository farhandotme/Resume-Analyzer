import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoryProvider, useStory } from './StoryContext';
import { useTheme } from '../hooks/useTheme';

import StoryProgress from './StoryProgress';

import Story1 from './Story1';
import Story2 from './Story2';
import Story3 from './Story3';
import Story4 from './Story4';
import Story5 from './Story5';
import Story6 from './Story6';
import Story7 from './Story7';

const STORY_DURATIONS = [8000, 5000, 6000, 6000, 10000, 6000, 8000];

const SunIcon = () => (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden>
        <circle cx='12' cy='12' r='4' />

        <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 6.34l-1.41-1.41' />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden>
        <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
    </svg>
);

const PlayIcon = () => (
    <svg viewBox='0 0 24 24' fill='currentColor' className='ml-1 h-8 w-8' aria-hidden>
        <path d='M5.5 3.5v17l14-8.5-14-8.5Z' />
    </svg>
);

const PauseIcon = () => (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' className='h-7 w-7' aria-hidden>
        <path d='M8 4.5v15M16 4.5v15' strokeLinecap='round' />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden>
        <line x1='18' y1='6' x2='6' y2='18' />
        <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
);

const StoryControls = () => {
    const { paused, setPaused } = useStory();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const stopPointerPropagation = (event: React.PointerEvent) => {
        event.stopPropagation();
    };

    const handleThemeToggle = (event: React.MouseEvent) => {
        event.stopPropagation();
        toggleTheme();
    };

    const handlePlayPause = (event: React.MouseEvent) => {
        event.stopPropagation();
        setPaused((current) => !current);
    };

    const handleClose = (event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(-1);
    };

    const isDark = theme === 'dark';

    return (
        <div className='fixed right-4 top-7.5 z-70 flex items-center gap-1 rounded-full px-2 py-1.5' onPointerDown={stopPointerPropagation} onPointerUp={stopPointerPropagation} onPointerMove={stopPointerPropagation}>

            <button
                type='button'
                aria-label={paused ? 'Resume story' : 'Pause story'}
                onClick={handlePlayPause}
                className='group flex h-10 cursor-pointer items-center rounded-full bg-transparent px-2 text-zinc-700 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 dark:text-zinc-200'
            >
                {paused ? <PlayIcon /> : <PauseIcon />}

                <div className='grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-cols-[1fr]'>
                    <div className='overflow-hidden opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100'>
                        <span className='block whitespace-nowrap pl-2 text-sm font-medium'>{paused ? 'Play' : 'Pause'}</span>
                    </div>
                </div>
            </button>

            <button
                type='button'
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                onClick={handleThemeToggle}
                className='group flex h-10 cursor-pointer items-center rounded-full bg-transparent px-2 text-zinc-700 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 dark:text-zinc-200'
            >
                {isDark ? <SunIcon /> : <MoonIcon />}

                <div className='grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-cols-[1fr]'>
                    <div className='overflow-hidden opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100'>
                        <span className='block whitespace-nowrap pl-2 text-sm font-medium'>{isDark ? 'Light' : 'Dark'}</span>
                    </div>
                </div>
            </button>

            <button
                type='button'
                aria-label='Close stories'
                onClick={handleClose}
                className='group flex h-10 cursor-pointer items-center rounded-full bg-transparent px-2 text-zinc-700 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 dark:text-zinc-200'
            >
                <CloseIcon />

                <div className='grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-cols-[1fr]'>
                    <div className='overflow-hidden opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100'>
                        <span className='block whitespace-nowrap pl-2 text-sm font-medium'>Close</span>
                    </div>
                </div>
            </button>
        </div>
    );
};

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
        <main className='relative flex h-screen select-none items-center justify-center overflow-hidden bg-white dark:bg-black' onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerLeave}>
            <StoryControls />

            <div className='absolute inset-0 z-40 flex'>
                <button type='button' aria-label='Previous story' className='h-full w-1/2 cursor-default bg-transparent outline-none' onClick={handlePrevious} />

                <button type='button' aria-label='Next story' className='h-full w-1/2 cursor-default bg-transparent outline-none' onClick={handleNext} />
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