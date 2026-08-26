type StoryProgressProps = {
    totalStories: number;
    currentStory: number;
    progress: number;
};

const StoryProgress = ({ totalStories, currentStory, progress }: StoryProgressProps) => {
    return (
        <div className='pointer-events-none fixed left-0 top-0 z-50 w-full px-5 pt-4 max-[649.9px]:px-3 max-[649.9px]:pt-3 sm:px-6 sm:pt-5'>
            <div className='flex items-center gap-1.25 max-[649.9px]:gap-1'>
                {Array.from({
                    length: totalStories,
                }).map((_, index) => {
                    const isCompleted = index < currentStory;
                    const isActive = index === currentStory;

                    return (
                        <div key={index} className='relative h-0.5 flex-1 overflow-hidden rounded-full bg-zinc-200/80 max-[649.9px]:h-0.75 dark:bg-zinc-800/80'>
                            {isCompleted && <div className='absolute inset-0 rounded-full bg-zinc-900 dark:bg-zinc-100' />}

                            {isActive && <div className='absolute inset-y-0 left-0 rounded-full bg-zinc-900 dark:bg-zinc-100' style={{ width: `${progress}%`, transition: 'width 75ms linear' }} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StoryProgress;