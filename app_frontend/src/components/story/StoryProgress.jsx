export default function StoryProgress({ totalScenes, currentScene }) {
    return (
        <div className='absolute top-0 left-0 z-50 flex w-full gap-2 p-4'>
            {Array.from({ length: totalScenes }).map((_, index) => (
                <div key={index} className='h-1 flex-1 overflow-hidden rounded-full bg-white/20'>
                    <div className={`h-full translate-all duration-300 ${index < currentScene ? 'w-full bg-white' : index === currentScene ? 'w-1/2 bg-white' : 'w-0 bg-white'}`} />
                </div>
            ))}
        </div>
    )
}