import AnalyzeButton from '../../components/AnalyzeButton'
import Hero from '../../components/Hero'
import TopBar from '../../components/TopBar'
import UploadArea from '../../components/UploadArea'

export default function Landing() {
    return (
        <main className='min-h-screen bg-black text-white'>
            <div className='mx-auto flex flex-col w-full'>
                <TopBar />
                <Hero />
                <UploadArea />
                <AnalyzeButton />
            </div>
        </main>
    )
}
