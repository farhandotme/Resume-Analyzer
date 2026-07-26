import { useState } from 'react';

const TOTAL_SCENES = 8

export default function useStoryPlayer() {
    const [ currentScene, setCurrentScene ] = useState(0)

    const nextScene = () => {
        setCurrentScene((prev) => prev + 1)
    }

    const previousScene = () => {
        setCurrentScene((prev) => Math.max(prev - 1, 0))
    }

    return { currentScene, nextScene, previousScene, totalScenes: TOTAL_SCENES }
}