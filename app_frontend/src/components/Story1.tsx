'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

const EASE_CINE = [0.16, 1, 0.3, 1] as const;

const CreditsText = ({ text, delayStart = 0, className = '' }: { text: string; delayStart?: number; className?: string }) => (
    <>
        {text.split('').map((char, i) => (
            <motion.span
                key={`${char}-${i}`}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: delayStart + i * 0.035, ease: EASE_CINE }}
                style={{ display: 'inline-block' }}
                aria-hidden='true'
                className={className}
            >
                {char === ' ' ? '\u00A0' : char}
            </motion.span>
        ))}
    </>
);

const ProjectorFlicker = ({ triggerKey }: { triggerKey: number }) => <motion.div key={triggerKey} className='pointer-events-none fixed inset-0 z-40 bg-white dark:bg-black' initial={{ opacity: 0.32 }} animate={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} />;

const FilmGrain = () => (
    <div
        className='pointer-events-none fixed inset-0 z-30 opacity-[0.035]'
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
        }}
    />
);

const Story1 = () => {
    const { analysisResult } = useStory();
    const NAME = analysisResult?.data?.data?.hero?.name ?? 'Your Resume';
    const ROLE = analysisResult?.data?.data?.meta?.job_title ?? 'Your Role';
    const reduceMotion = useReducedMotion();
    const [step, setStep] = useState(0);
    const [flickerKey, setFlickerKey] = useState(0);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;
        const previousHtmlOverscroll = html.style.overscrollBehavior;
        const previousBodyOverscroll = body.style.overscrollBehavior;

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';

        html.style.overscrollBehavior = 'none';
        body.style.overscrollBehavior = 'none';

        return () => {
            html.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyOverflow;
            html.style.overscrollBehavior = previousHtmlOverscroll;
            body.style.overscrollBehavior = previousBodyOverscroll;
        };
    }, []);

    useEffect(() => {
        const introTimer = window.setTimeout(() => {
            setStep(1);
        }, 1600);

        const meetTimer = window.setTimeout(() => {
            setStep(2);
        }, 4000);

        return () => {
            window.clearTimeout(introTimer);
            window.clearTimeout(meetTimer);
        };
    }, []);

    useEffect(() => {
        setFlickerKey((k) => k + 1);
    }, [step]);

    return (
        <div className='fixed inset-0 h-dvh w-screen overflow-hidden overscroll-none bg-white transition-colors duration-300 dark:bg-black'>
            <div className='pointer-events-none absolute inset-0 z-10' style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0) 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.04) 100%)' }} />

            {!reduceMotion && <FilmGrain />}

            {!reduceMotion && <ProjectorFlicker triggerKey={flickerKey} />}

            <AnimatePresence mode='wait'>
                {step === 0 && (
                    <motion.div
                        key='received'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE_CINE }}
                        className='relative z-10 flex h-full w-full -translate-y-6 flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center'
                    >
                        <motion.p initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_CINE }} className='text-center text-[45px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
                            Resume received.
                        </motion.p>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key='intro' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE_CINE }} className='relative z-10 flex h-full w-full -translate-y-6 items-center justify-center overflow-hidden px-6 text-center'>
                        <p className='text-[40px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[54px]'>
                            <CreditsText text="Let's get to know you." />
                        </p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key='meet' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE_CINE }} className='relative z-10 flex h-full w-full -translate-y-6 flex-col items-center justify-center overflow-hidden text-center'>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: EASE_CINE }} className='text-[13px] font-medium uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400'>
                            Meet
                        </motion.p>

                        <h1 className='font-display mt-4 text-[60px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[88px]'>
                            <CreditsText text={NAME} delayStart={0.5} />
                        </h1>

                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 56, opacity: 1 }} transition={{ delay: 1.3, duration: 0.6, ease: EASE_CINE }} className='mt-3 h-0.5 bg-zinc-900 dark:bg-zinc-100' />

                        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.6, ease: EASE_CINE }} className='mt-7 text-[20px] font-normal text-zinc-500 dark:text-zinc-400 sm:text-[24px]'>
                            {ROLE}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Story1;
