import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const isLoggedIn = !!localStorage.getItem('token');
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');

        localStorage.setItem(
            'toastAfterRedirect',
            JSON.stringify({
                message: 'Logged out successfully.',
                type: 'success',
            }),
        );

        window.location.href = '/';
    };

    const linkClass = (path) =>
        `text-base px-2 py-1 rounded-md duration-200 ${isActive(path) ? 'text-[#D9A919] font-semibold' : 'text-[#8a8686] font-medium hover:text-[#D9A919] hover:bg-white/[0.03]'}`;

    const mobileLinkClass = (path) =>
        `text-base px-3 py-2 rounded-md duration-200 ${isActive(path) ? 'text-[#D9A919] font-semibold' : 'text-[#8a8686] font-medium hover:text-[#D9A919] hover:bg-white/[0.03]'}`;

    return (
        <div className='relative z-20 w-full sm:w-[97%] md:w-[80%] lg:w-[70%] mx-auto'>
            <div
                className='bg-[#0A0A0A] flex justify-between px-4 py-4 items-center'
                style={{
                    borderBottom: '1px solid transparent',
                    borderImage: 'linear-gradient(to right, transparent, rgba(217,169,25,0.3) 20%, rgba(245,197,23,0.6) 50%, rgba(217,169,25,0.3) 80%, transparent) 1',
                }}
            >
                <Link to='/' className='font-bold text-xl md:text-xl lg:text-2xl text-[#D9A919]'>
                    Resume Analyser
                </Link>
                <div className='hidden md:flex gap-3 items-center'>
                    <Link to='/' className={linkClass('/')}>
                        Home
                    </Link>
                    <Link to='/about' className={linkClass('/about')}>
                        About
                    </Link>
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className='group flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3a2e0f] bg-[#1a1500] text-[#D9A919] text-sm font-medium hover:bg-[#241d00] hover:border-[#65531e] hover:shadow-[0_0_12px_rgba(217,169,25,0.15)] transition-all duration-200 cursor-pointer'
                        >
                            Logout <LogOut size={14} className='opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200' />
                        </button>
                    ) : (
                        <>
                            <Link to='/login' className={linkClass('/login')}>
                                Login
                            </Link>
                            <Link
                                to='/signup'
                                className='group px-4 py-1.5 bg-[#1f1d10] flex gap-1 items-center justify-center hover:bg-[#2b280f] rounded-xl text-[#D9A919] duration-300 border border-[#65531e]'
                            >
                                Signup
                                <ArrowRight className='group-hover:translate-x-0.5 transition-transform' size={17} />
                            </Link>
                        </>
                    )}
                </div>
                <button className='md:hidden text-[#8a8686] hover:text-[#D9A919] transition-colors duration-200 p-1' onClick={() => setOpen(!open)} aria-label='Toggle menu'>
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            <div className={`md:hidden overflow-hidden transition-all duration-300 bg-[#0A0A0A] border-b border-[#211e12] ${open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 border-none'}`}>
                <div className='flex flex-col gap-1 px-2 py-3'>
                    <Link to='/' onClick={() => setOpen(false)} className={mobileLinkClass('/')}>
                        Home
                    </Link>
                    <Link to='/about' onClick={() => setOpen(false)} className={mobileLinkClass('/about')}>
                        About
                    </Link>
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className='group flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3a2e0f] bg-[#1a1500] text-[#D9A919] text-sm font-medium hover:bg-[#241d00] hover:border-[#65531e] hover:shadow-[0_0_12px_rgba(217,169,25,0.15)] transition-all duration-200 cursor-pointer'
                        >
                            <span>Logout</span>
                            <LogOut size={14} className='opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200' />
                        </button>
                    ) : (
                        <>
                            <Link to='/login' onClick={() => setOpen(false)} className={mobileLinkClass('/login')}>
                                Login
                            </Link>
                            <Link
                                to='/signup'
                                onClick={() => setOpen(false)}
                                className='group mt-1 px-4 py-2 bg-[#1f1d10] flex gap-1 items-center justify-center hover:bg-[#2b280f] rounded-xl text-[#D9A919] duration-300 border border-[#65531e] w-full'
                            >
                                Signup
                                <ArrowRight className='group-hover:translate-x-0.5 transition-transform' size={17} />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
