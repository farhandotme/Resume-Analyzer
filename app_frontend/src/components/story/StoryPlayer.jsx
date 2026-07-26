import { useStory } from '../../context/StoryContext'
import StoryProgress from './StoryProgress'

export default function StoryPlayer() {
    const { currentScene, nextScene, previousScene, totalScenes } = useStory()

    return (
        <div className='relative w-full h-full'>
            <StoryProgress totalScenes={totalScenes} currentScene={currentScene} />

            <div className='h-full flex justify-center items-center'>
                <h1 className='text-5xl font-bold'>Scene {currentScene + 1}</h1>
            </div>

            <div className='absolute left-0 top-0 h-full w-1/2 cursor-pointer' onClick={previousScene} />

            <div className='absolute right-0 top-0 h-full w-1/2 cursor-pointer' onClick={nextScene} />
        </div>
    )
}
