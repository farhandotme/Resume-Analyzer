type StoryProgressProps = {
    totalStories: number;
    currentStory: number;
    progress: number;
};

const StoryProgress = ({ totalStories, currentStory, progress }: StoryProgressProps) => {
    return (
        <div className='fixed left-0 top-0 z-50 w-full px-6 pt-6'>
            <div className='flex gap-2'>
                {Array.from({ length: totalStories }).map((_, index) => (
                    <div key={index} className='h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200'>
                        {index < currentStory && <div className='h-full w-full rounded-full bg-zinc-900' />}

                        {index === currentStory && (
                            <div
                                className='h-full rounded-full bg-zinc-900 transition-[width] duration-75'
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryProgress;