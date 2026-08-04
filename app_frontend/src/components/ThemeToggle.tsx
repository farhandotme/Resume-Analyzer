import { SunDim } from 'lucide-react'

export default function ThemeToggle() {
    return (
        <button
            type='button'
            aria-label='Toggle theme'
            className='flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:text-white cursor-pointer'
        >
            <SunDim size={20} strokeWidth={2} />
        </button>
    )
}