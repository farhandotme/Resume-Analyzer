'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

type MatchedSkill = {
    skill: string;
    strength?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const FALLBACK_ASSET = 'A well-rounded set of skills across your resume';

export default function Story4() {
    const { analysisResult } = useStory();
    const reduceMotion = useReducedMotion();

    const strongestAsset: string = analysisResult?.data?.data?.candidate?.strongest_asset || FALLBACK_ASSET;

    const matchedSkills: MatchedSkill[] = (analysisResult?.data?.data?.skills?.matched ?? []).filter((item: any): item is MatchedSkill => typeof item?.skill === 'string' && item.skill.trim().length > 0);

    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setHasStarted(true);
        }, 50);

        return () => {
            window.clearTimeout(timer);
        };
    }, []);

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

    const T = {
        eyebrow: 0.1,
        line1: 0.4,
        line2: 0.48,
        divider: 1.05,
        heroLabel: 1.3,
        heroReveal: 1.55,
        heroDuration: 1.15,
        skills: 2.85,
    };

    const skillsContainer: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduceMotion ? 0 : 0.045,
                delayChildren: T.skills,
            },
        },
    };

    const skillItem: Variants = {
        hidden: {
            opacity: 0,
            y: reduceMotion ? 0 : 8,
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.55,
                ease: EASE,
            },
        },
    };

    return (
        <section className='fixed inset-0 h-dvh w-screen overflow-hidden overscroll-none bg-white transition-colors duration-500 dark:bg-black'>
            <div aria-hidden className='pointer-events-none absolute inset-0 dark:hidden' style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,0,0,0.025), transparent 70%)' }} />

            <div className='absolute inset-0 z-10 flex h-full w-full items-center justify-center overflow-hidden px-4 text-center sm:px-8 md:px-12'>
                <div className='flex w-full max-w-275 flex-col items-center'>
                    <div className='flex items-center justify-center gap-3 sm:gap-6'>
                        <motion.div
                            initial={reduceMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                            animate={hasStarted || reduceMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: EASE, delay: 0.85 }}
                            style={{ originX: 0 }}
                            className='relative h-px w-8 overflow-hidden bg-zinc-300 sm:w-16 lg:w-20 dark:bg-zinc-800'
                        >
                            {!reduceMotion && (
                                <motion.span
                                    aria-hidden
                                    className='absolute top-0 h-px w-10 bg-zinc-950 shadow-[0_0_6px_rgba(24,24,27,0.45)] dark:bg-white dark:shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                                    initial={{ left: '100%' }}
                                    animate={hasStarted ? { left: '-40px' } : { left: '100%' }}
                                    transition={{ duration: 1.3, ease: [0.7, 0, 0.3, 1], repeat: Infinity, repeatType: 'loop', repeatDelay: 1, delay: 1.5 }}
                                />
                            )}
                        </motion.div>

                        <motion.span
                            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.72 }}
                            animate={hasStarted || reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.72 }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0 }}
                            className='shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500 sm:text-[11px] sm:tracking-[0.35em] dark:text-zinc-400'
                        >
                            What stands out
                        </motion.span>

                        <motion.div
                            initial={reduceMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                            animate={hasStarted || reduceMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: EASE, delay: 0.85 }}
                            style={{ originX: 1 }}
                            className='relative h-px w-8 overflow-hidden bg-zinc-300 sm:w-16 lg:w-20 dark:bg-zinc-800'
                        >
                            {!reduceMotion && (
                                <motion.span
                                    aria-hidden
                                    className='absolute top-0 h-px w-10 bg-zinc-950 shadow-[0_0_6px_rgba(24,24,27,0.45)] dark:bg-white dark:shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                                    initial={{ left: '-40px' }}
                                    animate={hasStarted ? { left: '100%' } : { left: '-40px' }}
                                    transition={{ duration: 1.3, ease: [0.7, 0, 0.3, 1], repeat: Infinity, repeatType: 'loop', repeatDelay: 1, delay: 1.5 }}
                                />
                            )}
                        </motion.div>
                    </div>

                    <div className='mt-6 flex w-full flex-col items-center sm:mt-10'>
                        <div className='relative w-full max-w-170'>
                            <motion.h1
                                initial={reduceMotion ? { opacity: 1 } : { clipPath: 'inset(0 100% 0 0)', filter: 'blur(14px)' }}
                                animate={hasStarted || reduceMotion ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : { clipPath: 'inset(0 100% 0 0)', filter: 'blur(14px)' }}
                                transition={reduceMotion ? { duration: 0 } : { duration: T.heroDuration, ease: EASE, delay: T.heroReveal }}
                                className='mx-auto max-w-[92vw] text-balance text-[25px] font-bold leading-[1.2] tracking-wide text-zinc-950 sm:max-w-[88vw] sm:text-[32px] lg:text-[46px] xl:text-[50px] dark:text-white'
                                style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif', fontWeight: 300, fontVariationSettings: '"wght" 300' }}
                            >
                                {strongestAsset}
                            </motion.h1>

                            {!reduceMotion && (
                                <motion.span
                                    aria-hidden
                                    initial={{ left: '0%', opacity: 0 }}
                                    animate={hasStarted ? { left: '100%', opacity: [0, 1, 1, 0] } : { left: '0%', opacity: 0 }}
                                    transition={{
                                        left: {
                                            duration: T.heroDuration,
                                            ease: EASE,
                                            delay: T.heroReveal,
                                        },
                                        opacity: {
                                            duration: T.heroDuration,
                                            ease: EASE,
                                            delay: T.heroReveal,
                                            times: [0, 0.08, 0.92, 1],
                                        },
                                    }}
                                    className='pointer-events-none absolute bottom-0 top-0 w-px bg-zinc-900 dark:bg-white'
                                />
                            )}
                        </div>
                    </div>

                    {matchedSkills.length > 0 && (
                        <motion.div initial='hidden' animate={hasStarted ? 'show' : 'hidden'} variants={skillsContainer} className='mt-8 flex w-full max-w-190 flex-col items-center sm:mt-14'>
                            <motion.span variants={skillItem} className='mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-400 sm:mb-3 sm:text-[11px] sm:tracking-[0.3em] dark:text-zinc-600'>
                                Supported by
                            </motion.span>

                            <div className='flex max-w-[94vw] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2'>
                                {matchedSkills.map((item, index) => (
                                    <motion.span key={`${item.skill}-${index}`} variants={skillItem} className='flex shrink-0 items-center whitespace-nowrap font-mono text-[12px] tracking-wide text-zinc-600 sm:text-[14px] dark:text-zinc-400'>
                                        {item.skill}
                                        {index < matchedSkills.length - 1 && <span className='ml-3 text-zinc-300 sm:ml-4 dark:text-zinc-700'>/</span>}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}