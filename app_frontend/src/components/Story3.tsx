'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

type BreakdownItem = {
    label: string;
    score: number;
    total: number;
    reason?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const FilmGrain = () => (
    <div
        className='pointer-events-none fixed inset-0 z-30 opacity-[0.025] dark:opacity-[0.04]'
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
        }}
    />
);

const Story3 = () => {
    const { analysisResult } = useStory();

    const score = analysisResult?.data?.data?.hero?.ats_score ?? 0;

    const breakdown: BreakdownItem[] =
        analysisResult?.data?.data?.score_breakdown?.map((item: { label: string; score: number; out_of: number; reason?: string }) => ({
            label: item.label,
            score: item.score,
            total: item.out_of,
            reason: item.reason,
        })) ?? [];

    const reduceMotion = useReducedMotion();
    const [hasStarted, setHasStarted] = useState(false);
    const [visibleRows, setVisibleRows] = useState(reduceMotion ? breakdown.length : 0);

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
            setVisibleRows(breakdown.length);
            return;
        }

        setVisibleRows(0);

        const timers = breakdown.map((_, index) =>
            window.setTimeout(
                () => {
                    setVisibleRows(index + 1);
                },
                1250 + index * 520,
            ),
        );

        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, [hasStarted, breakdown.length, reduceMotion]);

    return (
        <section className='fixed inset-0 flex h-dvh w-screen items-center justify-center overflow-hidden overscroll-none bg-white transition-colors duration-300 dark:bg-black'>
            <div className='pointer-events-none absolute inset-0 dark:hidden' style={{ background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,.035), transparent 65%)' }} />

            <div className='pointer-events-none absolute inset-0 hidden dark:block' style={{ background: 'radial-gradient(circle at 42% 45%, rgba(255,255,255,.025), transparent 58%)' }} />

            {!reduceMotion && <FilmGrain />}

            <div className='relative z-10 mx-auto flex h-full w-full max-w-375 items-center justify-center gap-24 overflow-hidden px-10 sm:px-16 lg:px-24 xl:gap-32'>
                <motion.div
                    initial={reduceMotion ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: -70, filter: 'blur(8px)' }}
                    animate={hasStarted || reduceMotion ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: -70, filter: 'blur(8px)' }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }}
                    className='flex w-[38%] min-w-0 flex-col'
                >
                    <motion.p
                        initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
                        animate={hasStarted || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: 0.18, duration: 0.55, ease: EASE }}
                        className='text-[11px] font-medium uppercase tracking-[0.42em] text-zinc-400 dark:text-zinc-500'
                    >
                        Why this score
                    </motion.p>

                    <div className='relative mt-7'>
                        <span aria-hidden='true' className='pointer-events-none absolute -left-2 top-2 select-none text-[180px] font-medium leading-none tracking-[-0.09em] text-zinc-950/2.5 dark:text-white/[0.035]' style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}>
                            {score}
                        </span>

                        <motion.h1
                            initial={reduceMotion ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: -35, filter: 'blur(10px)' }}
                            animate={hasStarted || reduceMotion ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: -35, filter: 'blur(10px)' }}
                            transition={reduceMotion ? { duration: 0 } : { delay: 0.28, duration: 0.85, ease: EASE }}
                            className='relative select-none text-[150px] font-medium leading-[0.82] tracking-[-0.04em] text-zinc-900 dark:text-zinc-100 sm:text-[175px]'
                            style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}
                        >
                            {score}
                        </motion.h1>
                    </div>

                    <motion.p
                        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        animate={hasStarted || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: 0.75, duration: 0.65, ease: EASE }}
                        className='mt-8 max-w-xs text-[15px] leading-6 tracking-wide text-zinc-500 dark:text-zinc-400'
                    >
                        Your ATS score is built from five major evaluation categories. Each category contributes to your overall resume score.
                    </motion.p>

                    <motion.div
                        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        animate={hasStarted || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: 1.05, duration: 0.55, ease: EASE }}
                        className='mt-5 flex items-center gap-3'
                    >
                        <span className='text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600'>Overall</span>

                        <motion.span
                            initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                            animate={hasStarted || reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                            transition={reduceMotion ? { duration: 0 } : { delay: 1.18, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                            className='h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700'
                        />

                        <span className='text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400'>{score >= 80 ? 'Strong match' : score >= 60 ? 'Good foundation' : score >= 40 ? 'Needs improvement' : 'Needs work'}</span>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={reduceMotion ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: 70, filter: 'blur(8px)' }}
                    animate={hasStarted || reduceMotion ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: 70, filter: 'blur(8px)' }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 0.45, duration: 0.9, ease: EASE }}
                    className='w-[62%]'
                >
                    <div className='mb-6 flex items-end justify-between'>
                        <p className='text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500'>Score breakdown</p>

                        <p className='text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600'>{breakdown.length} categories</p>
                    </div>

                    <div>
                        {breakdown.map((item, index) => {
                            const visible = index < visibleRows;
                            const percent = item.total > 0 ? Math.min((item.score / item.total) * 100, 100) : 0;
                            const weak = percent < 40;

                            return (
                                <motion.div key={item.label} initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 45 }} animate={visible || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 45 }} transition={{ duration: 0.7, ease: EASE }} className='group relative py-3 first:pt-2'>
                                    <div className='mb-3 flex items-center justify-between'>
                                        <motion.div
                                            initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                            animate={visible || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                            transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
                                            className='flex min-w-0 items-center gap-3'
                                        >
                                            <p className='truncate text-[17px] font-medium tracking-[-0.02em] text-zinc-900 dark:text-zinc-100'>{item.label}</p>

                                            {weak && (
                                                <motion.span
                                                    initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
                                                    animate={visible || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
                                                    transition={{ delay: 0.25, duration: 0.4 }}
                                                    className='shrink-0 text-[9px] font-medium uppercase tracking-[0.2em] text-red-500 dark:text-red-400'
                                                >
                                                    Weak spot
                                                </motion.span>
                                            )}
                                        </motion.div>

                                        <motion.div
                                            initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
                                            animate={visible || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
                                            transition={{ duration: 0.5, delay: 0.14, ease: EASE }}
                                            className='ml-6 flex shrink-0 items-baseline gap-2'
                                        >
                                            <span className='text-[17px] font-medium tabular-nums text-zinc-900 dark:text-zinc-100'>{item.score}</span>

                                            <span className='text-[14px] tabular-nums text-zinc-400 dark:text-zinc-600'>/ {item.total}</span>
                                        </motion.div>
                                    </div>

                                    <div className='relative h-0.75 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900'>
                                        <motion.div initial={{ scaleX: 0, transformOrigin: 'left' }} animate={visible || reduceMotion ? { scaleX: 1 } : { scaleX: 0 }} transition={{ duration: 0.6, ease: EASE }} className='absolute inset-0 rounded-full bg-zinc-200/60 dark:bg-zinc-800/70' />

                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={visible || reduceMotion ? { width: `${percent}%` } : { width: 0 }}
                                            transition={{ duration: weak ? 1.15 : 0.95, delay: 0.16, ease: EASE }}
                                            className={`relative h-full rounded-full ${weak ? 'bg-red-500 dark:bg-red-400' : 'bg-zinc-900 dark:bg-zinc-100'}`}
                                        >
                                            {!reduceMotion && visible && (
                                                <motion.span
                                                    initial={{ left: '-15%', opacity: 0 }}
                                                    animate={{ left: '110%', opacity: [0, 0.9, 0] }}
                                                    transition={{ duration: 1.15, delay: 0.35, ease: 'easeOut' }}
                                                    className='pointer-events-none absolute top-1/2 h-2 w-10 -translate-y-1/2 rounded-full bg-white/80 blur-xs dark:bg-black/35'
                                                />
                                            )}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Story3;