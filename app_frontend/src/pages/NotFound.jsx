import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden flex items-center justify-center">
            <div className="absolute pointer-events-none" style={{ top: 0, right: 0, width: '45%', height: '70%', background: 'radial-gradient(ellipse at 100% 0%, rgba(217,169,25,0.1) 0%, transparent 60%)' }} />
            <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, width: '45%', height: '70%', background: 'radial-gradient(ellipse at 0% 100%, rgba(217,169,25,0.08) 0%, transparent 60%)' }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
                {[0,1,2,3,4,5,6].map((i) => (
                    <path key={`tr-${i}`} d={`M ${1000} ${i * 80} Q ${800 - i * 30} ${200 + i * 60} ${600 - i * 40} ${800}`} fill="none" stroke={`rgba(217,169,25,${0.12 - i * 0.015})`} strokeWidth="0.7" />
                ))}
                {[0,1,2,3,4,5,6].map((i) => (
                    <path key={`bl-${i}`} d={`M ${0} ${800 - i * 80} Q ${200 + i * 30} ${600 - i * 60} ${400 + i * 40} ${0}`} fill="none" stroke={`rgba(217,169,25,${0.10 - i * 0.012})`} strokeWidth="0.7" />
                ))}
            </svg>
            <div className="relative z-10 flex flex-col items-center text-center gap-6 px-4">
                <h1 className="text-[6rem] md:text-[10rem] font-black leading-none select-none" style={{ background: 'linear-gradient(180deg, rgba(217,169,25,0.9) 0%, rgba(120,85,5,0.3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 40px rgba(217,169,25,0.2))'}}>404</h1>
                <div className="w-24 h-px bg-linear-to-r from-transparent via-[#D9A919]/60 to-transparent" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Page not found</h2>
                    <p className="text-gray-400 text-base max-w-sm leading-relaxed">The page you're looking for doesn't exist or has been moved.</p>
                </div>
                <Link to="/" className="mt-2 group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1f1d10] border border-[#65531e] text-[#D9A919] font-medium text-sm hover:bg-[#2b280f] hover:shadow-[0_0_20px_rgba(217,169,25,0.2)] hover:-translate-y-0.5 transition-all duration-300">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}