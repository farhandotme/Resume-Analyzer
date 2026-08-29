'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

const EASE_CINE = [0.16, 1, 0.3, 1] as const;

const CreditsText = ({ text, delayStart = 0, className = '', skipAnimation = false, keepWordsTogether = false }: { text: string; delayStart?: number; className?: string; skipAnimation?: boolean; keepWordsTogether?: boolean }) => (
    <>
        {(keepWordsTogether ? text.split(' ') : [text]).map((word, wordIndex) => (
            <span key={`${word}-${wordIndex}`} className={keepWordsTogether ? 'inline-block whitespace-nowrap' : ''}>
                {word.split('').map((char, i) => (
                    <motion.span
                        key={`${char}-${i}`}
                        initial={skipAnimation ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 24, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={skipAnimation ? { duration: 0 } : { duration: 0.6, delay: delayStart + (keepWordsTogether ? wordIndex * 0.035 + i * 0.035 : i * 0.035), ease: EASE_CINE }}
                        style={{ display: 'inline-block' }}
                        aria-hidden='true'
                        className={className}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}

                {keepWordsTogether && wordIndex < text.split(' ').length - 1 ? '\u00A0' : ''}
            </span>
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

const NAME_BASE_DELAY = 0.4;
const NAME_CHAR_DURATION = 0.85;
const NAME_STAGGER_BUDGET = 0.6;

const getNameStagger = (charCount: number) => Math.min(0.045, NAME_STAGGER_BUDGET / Math.max(charCount, 1));

const getNameRevealEnd = (text: string) => {
    const charCount = Array.from(text.replace(/\s/g, '')).length;
    const stagger = getNameStagger(charCount);
    return NAME_BASE_DELAY + Math.max(charCount - 1, 0) * stagger + NAME_CHAR_DURATION;
};

const NameReveal = ({ text, reduceMotion }: { text: string; reduceMotion: boolean | null }) => {
    if (reduceMotion) {
        return <span aria-hidden='true'>{text}</span>;
    }

    const words = text.split(' ');
    const charCount = Array.from(text.replace(/\s/g, '')).length;
    const stagger = getNameStagger(charCount);
    const spreadStep = Math.min(6, 140 / Math.max(charCount, 1));
    const center = (charCount - 1) / 2;

    let index = 0;

    return (
        <span aria-hidden='true' className='relative inline-block' style={{ perspective: 700 }}>
            {words.map((word, wordIndex) => (
                <span key={`${word}-${wordIndex}`} className='inline-block whitespace-nowrap'>
                    {Array.from(word).map((char, charIndex) => {
                        const i = index++;
                        const spread = (i - center) * spreadStep;

                        return (
                            <motion.span
                                key={`${char}-${i}-${charIndex}`}
                                initial={{ opacity: 0, x: spread, y: 26, rotateX: 55, filter: 'blur(9px)' }}
                                animate={{ opacity: 1, x: 0, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                                transition={{ duration: NAME_CHAR_DURATION, delay: NAME_BASE_DELAY + i * stagger, ease: EASE_CINE }}
                                style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
                            >
                                {char}
                            </motion.span>
                        );
                    })}

                    {wordIndex < words.length - 1 ? '\u00A0' : ''}
                </span>
            ))}
        </span>
    );
};

const Story1 = () => {
    const { analysisResult } = useStory();

    const NAME = analysisResult?.data?.data?.hero?.name ?? 'Your Resume';
    const ROLE = analysisResult?.data?.data?.meta?.job_title ?? 'Your Role';

    const reduceMotion = useReducedMotion();
    const nameRevealEnd = reduceMotion ? 0 : getNameRevealEnd(NAME);

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
        }, 5000);

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
                        transition={{ duration: 1, ease: EASE_CINE }}
                        className='relative z-10 flex h-full w-full -translate-y-6 flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center sm:px-6'
                    >
                        <motion.p
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.15, ease: EASE_CINE }}
                            className='max-w-[92vw] text-center text-[45px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100 max-[799.9px]:text-[38px] max-[549.9px]:text-[32px] max-[449.9px]:text-[27px]'
                        >
                            Resume received.
                        </motion.p>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key='intro' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: EASE_CINE }} className='relative z-10 flex h-full w-full -translate-y-6 items-center justify-center overflow-hidden text-center'>
                        <p className='max-w-[92vw] text-[45px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100 max-[799.9px]:text-[38px] max-[549.9px]:text-[32px] max-[449.9px]:text-[27px]'>
                            <CreditsText text="Let's get to know you." />
                        </p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key='meet' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE_CINE }} className='relative z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6'>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6, ease: EASE_CINE }}
                            className='text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px] sm:tracking-[0.3em] md:text-[12px] md:tracking-[0.35em] lg:text-[13px] lg:tracking-[0.4em] dark:text-zinc-400'
                        >
                            Meet
                        </motion.p>

                        <div className='relative mt-3 max-w-[92vw] overflow-hidden sm:mt-3'>
                            <h1 aria-label={NAME} className='font-display wrap-break-word text-[39px] leading-[1.08] tracking-tight text-zinc-900 sm:text-[46px] md:text-[54px] lg:text-[60px] dark:text-zinc-100'>
                                <NameReveal text={NAME} reduceMotion={reduceMotion} />
                            </h1>
                        </div>

                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 56, opacity: 1 }} transition={{ delay: nameRevealEnd + 0.05, duration: 0.6, ease: EASE_CINE }} className='mt-2 h-0.5 bg-zinc-900 sm:mt-3 dark:bg-zinc-100' />

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: nameRevealEnd + 0.25, duration: 0.6, ease: EASE_CINE }}
                            className='mt-4 max-w-[92vw] wrap-break-word text-[16px] font-normal leading-snug text-zinc-500 sm:mt-5 sm:text-[18px] md:mt-6 md:text-[21px] lg:mt-7 lg:text-[24px] dark:text-zinc-400'
                        >
                            {ROLE}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Story1;