'use client';

import { useEffect } from 'react';
import { ArrowLeft, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function NotFound() {
    const navigate = useNavigate();

    useTheme();

    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Page not found — Resume Analyzer';
        return () => {
            document.title = previousTitle;
        };
    }, []);

    return (
        <div className='relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-white px-6 text-zinc-900 selection:bg-[#EAF5FF] selection:text-[#3999FF] dark:bg-black dark:text-zinc-100 dark:selection:bg-[#010B1B] dark:selection:text-[#3999FF]'>
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 dark:hidden'
                style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(0,0,0,0.035) 0%, rgba(255,255,255,0) 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.03) 100%)' }}
            />

            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 hidden dark:block'
                style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(255,255,255,0.02) 100%)' }}
            />

            <div className='relative z-10 flex min-h-dvh w-full items-center justify-center'>
                <div className='flex w-full max-w-xl flex-col items-center justify-center text-center'>
                    <div className='flex items-center justify-center gap-4'>
                        <span className='h-px w-8 bg-zinc-300 dark:bg-zinc-800 sm:w-12' />
                        <span className='font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400'>Route not found</span>
                        <span className='h-px w-8 bg-zinc-300 dark:bg-zinc-800 sm:w-12' />
                    </div>

                    <h1 className='mt-6 text-[150px] font-medium leading-none tracking-[-0.045em] text-zinc-900 dark:text-zinc-100 sm:text-[190px] lg:text-[220px]' style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}>
                        404
                    </h1>

                    <p className='mt-5 text-[23px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[26px]'>This page isn’t available.</p>

                    <p className='mt-3 max-w-md text-[14px] leading-6 tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-[15px]'>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>

                    <div className='mt-10 flex w-full select-none flex-col items-center justify-center gap-2.5 sm:w-auto sm:flex-row'>
                        <button
                            type='button'
                            onClick={() => navigate('/')}
                            className='group/btn inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 font-medium text-white transition-all duration-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto'
                        >
                            <ArrowLeft className='h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:-translate-x-1' strokeWidth={1.8} />
                            <span>Back to home</span>
                        </button>

                        <button
                            type='button'
                            onClick={() => navigate('/chat')}
                            className='inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:w-auto'
                        >
                            <MessageSquareText className='h-3.5 w-3.5' strokeWidth={1.8} />
                            <span>Ask the AI instead</span>
                        </button>
                    </div>

                    <div className='mt-12 flex items-center justify-center gap-4'>
                        <span className='h-px w-8 bg-zinc-300 dark:bg-zinc-800' />
                        <span className='font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-600'>Resume Intelligence</span>
                        <span className='h-px w-8 bg-zinc-300 dark:bg-zinc-800' />
                    </div>
                </div>
            </div>
        </div>
    );
}