import StoryLayout from '../components/story/StoryLayout'
import StoryPlayer from '../components/story/StoryPlayer'
import { StoryProvider } from '../context/StoryContext'

export default function ResumeStory() {
    return (
        <StoryProvider>
            <StoryLayout>
                <StoryPlayer />
            </StoryLayout>
        </StoryProvider>
    )
}
