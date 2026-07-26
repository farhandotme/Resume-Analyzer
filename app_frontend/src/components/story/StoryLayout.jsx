export default function StoryLayout({ children }) {
    return (
        <main className='relative h-screen w-screen overflow-hidden bg-neutral-950 text-white'>
            { children }
        </main>
    )
}