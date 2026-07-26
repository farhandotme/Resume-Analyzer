import { createContext, useContext } from 'react'
import useStoryPlayer from '../hooks/useStoryPlayer'

const StoryContext = createContext(null)

export function StoryProvider({ children }) {
    const story = useStoryPlayer()

    return <StoryContext.Provider value={story}>{children}</StoryContext.Provider>
}

export function useStory() {
    const context = useContext(StoryContext)

    if (!context) {
        throw new Error('useStory must be used inside StoryProvider')
    }

    return context
}
