import GithubIcon from './GithubIcon'
import ThemeToggle from './ThemeToggle'

export default function TopBar() {
    return (
        <header className='flex items-center justify-end py-3 px-4 gap-2'>
            <button type='button' className='flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:text-white cursor-pointer'>
                <GithubIcon className='h-5 w-5' />
            </button>
            <ThemeToggle />
        </header>
    )
}
