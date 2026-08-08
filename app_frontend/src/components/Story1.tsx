'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

type Story1Props = {
    progress: number;
};

const EASE_CINE = [0.16, 1, 0.3, 1] as const;

const CreditsText = ({ text, delayStart = 0, className = '' }: { text: string; delayStart?: number; className?: string }) => (
    <span className={className} aria-label={text}>
        {text.split('').map((char, i) => (
            <motion.span key={`${char}-${i}`} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: delayStart + i * 0.035, ease: EASE_CINE }} style={{ display: 'inline-block' }} aria-hidden='true'>
                {char === ' ' ? '\u00A0' : char}
            </motion.span>
        ))}
    </span>
);

const ProjectorFlicker = ({ triggerKey }: { triggerKey: number }) => <motion.div key={triggerKey} className='pointer-events-none fixed inset-0 z-40 bg-white' initial={{ opacity: 0.32 }} animate={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} />;

const FilmGrain = () => (
    <svg className='pointer-events-none fixed inset-0 z-30 h-full w-full opacity-[0.05] mix-blend-overlay' aria-hidden='true'>
        <filter id='story1-grain'>
            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves={2} stitchTiles='stitch' />
            <feColorMatrix type='saturate' values='0' />
        </filter>
        <rect width='100%' height='100%' filter='url(#story1-grain)' />
    </svg>
);

const Story1 = ({ progress }: Story1Props) => {
    const { analysisResult } = useStory();
    const ROLE = analysisResult?.data?.data?.meta?.job_title ?? 'Your Role';
    const reduceMotion = useReducedMotion();

    let step = 0;
    if (progress >= 15) step = 1;
    if (progress >= 40) step = 2;

    const [flickerKey, setFlickerKey] = useState(0);
    useEffect(() => {
        setFlickerKey((k) => k + 1);
    }, [step]);

    return (
        <div className='relative h-screen w-full overflow-hidden bg-white'>
            <div
                className='pointer-events-none absolute inset-0 z-10'
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0) 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.04) 100%)',
                }}
            />

            {!reduceMotion && <FilmGrain />}
            {!reduceMotion && <ProjectorFlicker triggerKey={flickerKey} />}

            <AnimatePresence mode='wait'>
                {step === 0 && (
                    <motion.div key='received' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE_CINE }} className='relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center'>
                        <motion.p initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_CINE }} className='text-center text-[45px] font-semibold tracking-tight text-zinc-900'>
                            Resume received.
                        </motion.p>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key='intro' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE_CINE }} className='relative z-10 flex h-full items-center justify-center px-6 text-center'>
                        <p className='text-[40px] font-semibold tracking-tight text-zinc-900 sm:text-[54px]'>
                            <CreditsText text="Let's get to know you." />
                        </p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key='meet' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE_CINE }} className='relative z-10 flex h-full flex-col items-center justify-center text-center'>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: EASE_CINE }} className='text-[13px] font-medium uppercase tracking-[0.4em] text-zinc-500'>
                            Meet
                        </motion.p>

                        <h1 className='font-display mt-4 text-[60px] font-medium tracking-tight text-zinc-900 sm:text-[88px]'>
                            <CreditsText text='Your Resume' delayStart={0.5} />
                        </h1>

                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 56, opacity: 1 }} transition={{ delay: 1.3, duration: 0.6, ease: EASE_CINE }} className='mt-3 h-0.5 bg-zinc-900' />

                        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.6, ease: EASE_CINE }} className='mt-7 text-[20px] font-normal text-zinc-500 sm:text-[24px]'>
                            {ROLE}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Story1;