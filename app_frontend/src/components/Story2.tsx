'use client';

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

const EASE_CINE = [0.16, 1, 0.3, 1] as const;

const FilmGrain = () => (
    <div
        className='pointer-events-none fixed inset-0 z-30 opacity-[0.035]'
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
        }}
    />
);

const ShutterFlash = () => <motion.div className='pointer-events-none fixed inset-0 z-40 bg-white dark:bg-black' initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} />;

const IrisRing = ({ progress, complete }: { progress: ReturnType<typeof useMotionValue<number>>; complete: boolean }) => {
    const size = 320;
    const strokeWidth = 2.5;
    const radius = (size - 32) / 2;
    const circumference = 2 * Math.PI * radius;

    const dashOffset = useTransform(progress, (value) => {
        const clamped = Math.min(Math.max(value, 0), 100);
        return circumference - (clamped / 100) * circumference;
    });

    const angle = useTransform(progress, (value) => {
        const clamped = Math.min(Math.max(value, 0), 100);
        return (clamped / 100) * 360 - 90;
    });

    const dotX = useTransform(angle, (value) => {
        const radians = (value * Math.PI) / 180;
        return size / 2 + radius * Math.cos(radians);
    });

    const dotY = useTransform(angle, (value) => {
        const radians = (value * Math.PI) / 180;
        return size / 2 + radius * Math.sin(radians);
    });

    const dotOpacity = useTransform(progress, [0, 2, 100], [0, 1, 1]);
    const dotTransform = useMotionTemplate`translate(${dotX}px, ${dotY}px)`;

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className='pointer-events-none absolute inset-0 h-full w-full text-zinc-900 dark:text-white'>
            <circle cx={size / 2} cy={size / 2} r={radius} fill='none' stroke='currentColor' strokeOpacity={0.1} strokeWidth={strokeWidth} />

            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill='none'
                stroke='currentColor'
                strokeWidth={strokeWidth * 2.2}
                strokeLinecap='round'
                strokeDasharray={circumference}
                style={{ strokeDashoffset: dashOffset }}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                className='opacity-20 blur-[5px] dark:opacity-80 dark:blur-[7px]'
            />

            <motion.circle cx={size / 2} cy={size / 2} r={radius} fill='none' stroke='currentColor' strokeOpacity={1} strokeWidth={strokeWidth} strokeLinecap='round' strokeDasharray={circumference} style={{ strokeDashoffset: dashOffset }} transform={`rotate(-90 ${size / 2} ${size / 2})`} />

            <motion.circle cx={0} cy={0} r={3} fill='currentColor' style={{ opacity: dotOpacity, transform: dotTransform, filter: 'drop-shadow(0 0 5px currentColor)' }} />

            <motion.circle cx={0} cy={0} r={3} fill='currentColor' style={{ transform: dotTransform }} animate={complete ? { opacity: [0, 0.9, 0], scale: [1, 2.8, 1] } : { opacity: 0, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </svg>
    );
};

const Story2 = () => {
    const { analysisResult } = useStory();
    const ATS_SCORE = analysisResult?.data?.data?.hero?.ats_score ?? 0;
    const VERDICT = analysisResult?.data?.data?.hero?.verdict ?? 'Needs Work';
    const HIRE_PROBABILITY = analysisResult?.data?.data?.hero?.hire_probability ?? 'Unknown';
    const ONE_LINER = analysisResult?.data?.data?.hero?.one_liner ?? '';
    const reduceMotion = useReducedMotion();
    const [hasStarted, setHasStarted] = useState(false);
    const rawScore = useMotionValue(reduceMotion ? ATS_SCORE : 0);
    const roundedScore = useTransform(rawScore, (value) => Math.round(value));
    const scoreY = useTransform(rawScore, [0, ATS_SCORE * 0.15, ATS_SCORE], [8, 3, 0]);
    const scoreOpacity = useTransform(rawScore, [0, Math.max(1, ATS_SCORE * 0.08), ATS_SCORE], [0.65, 0.9, 1]);

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

    useEffect(() => {
        if (!hasStarted) return;

        if (reduceMotion) {
            rawScore.set(ATS_SCORE);
            return;
        }

        rawScore.set(0);

        const scoreControls = animate(rawScore, ATS_SCORE, {
            delay: 0.35,
            duration: 1.45,
            ease: [0.12, 0.85, 0.25, 1],
        });

        return () => {
            scoreControls.stop();
        };
    }, [hasStarted, ATS_SCORE, reduceMotion, rawScore]);

    return (
        <section className='fixed inset-0 flex h-dvh w-screen items-center justify-center overflow-hidden overscroll-none bg-white transition-colors duration-300 dark:bg-black'>
            <div className='pointer-events-none absolute inset-0 z-0 dark:hidden' style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0) 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.04) 100%)' }} />

            {!reduceMotion && <FilmGrain />}

            {!reduceMotion && <ShutterFlash />}

            <div className='relative z-10 mx-auto flex h-full w-full max-w-xl -translate-y-4 flex-col items-center justify-center overflow-hidden px-6 text-center'>
                <motion.div
                    initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 0.18, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                    className='relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72'
                >
                    <IrisRing progress={rawScore} complete={!reduceMotion} />

                    <motion.h1 style={{ y: scoreY, opacity: scoreOpacity, fontFamily: '"Fraunces", ui-serif, Georgia, serif' }} className='select-none text-[110px] font-medium leading-none tracking-[-0.02em] tabular-nums text-zinc-900 dark:text-zinc-100 sm:text-[136px]'>
                        {roundedScore}
                    </motion.h1>
                </motion.div>

                <motion.p
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    animate={hasStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 1.65, duration: 0.5, ease: EASE_CINE }}
                    className='mt-5 text-[12px] font-semibold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400 sm:text-[13px]'
                >
                    ATS Score
                </motion.p>

                {ONE_LINER && (
                    <motion.p
                        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        animate={hasStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: 1.9, duration: 0.55, ease: EASE_CINE }}
                        className='mt-6 max-w-md text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-[18px]'
                    >
                        {ONE_LINER}
                    </motion.p>
                )}

                <motion.div
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    animate={hasStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 2.2, duration: 0.5, ease: EASE_CINE }}
                    className='mt-8 flex items-center justify-center gap-8 sm:gap-12'
                >
                    <div className='text-center'>
                        <p className='text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg'>{VERDICT}</p>

                        <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500'>Verdict</p>
                    </div>

                    <div className='h-8 w-px bg-zinc-200 dark:bg-zinc-800' />

                    <div className='text-center'>
                        <p className='text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg'>{HIRE_PROBABILITY}</p>

                        <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500'>Hire Probability</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Story2;
