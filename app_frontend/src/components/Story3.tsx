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
        className='pointer-events-none fixed inset-0 z-30 opacity-[0.035]'
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

    const [visibleRows, setVisibleRows] = useState(reduceMotion ? breakdown.length : 0);

    useEffect(() => {
        if (reduceMotion) {
            setVisibleRows(breakdown.length);
            return;
        }

        setVisibleRows(0);

        const timers = breakdown.map((_, i) =>
            window.setTimeout(
                () => {
                    setVisibleRows(i + 1);
                },
                900 + i * 400,
            ),
        );

        return () => timers.forEach(clearTimeout);
    }, [breakdown.length, reduceMotion]);

    return (
        <section className='relative flex h-screen items-center justify-center overflow-hidden bg-white'>
            <div
                className='pointer-events-none absolute inset-0'
                style={{
                    background: 'radial-gradient(circle at center, rgba(0,0,0,.035), transparent 70%)',
                }}
            />

            {!reduceMotion && <FilmGrain />}

            <div className='relative z-10 flex w-full max-w-[1600px] items-center justify-between gap-48 px-32'>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.6,
                        ease: EASE,
                    }}
                    className='w-105 shrink-0'
                >
                    <p className='text-[12px] uppercase tracking-[0.45em] text-zinc-400'>Why this score</p>

                    <h1
                        className='mt-8 text-[170px] font-medium leading-none tracking-[-0.08em] text-zinc-900'
                        style={{
                            fontFamily: '"Fraunces", ui-serif, Georgia, serif',
                        }}
                    >
                        {score}
                    </h1>

                    <p className='mt-5 text-[15px] leading-8 text-zinc-500'>Your ATS score is built from five major evaluation categories. Each category contributes to your overall resume score.</p>
                </motion.div>

                <div className='w-155 space-y-10'>
                    {breakdown.map((item, index) => {
                        const visible = index < visibleRows;
                        const percent = item.total > 0 ? (item.score / item.total) * 100 : 0;

                        const weak = percent < 40;

                        return (
                            <motion.div
                                key={item.label}
                                initial={{
                                    opacity: 0,
                                    y: 25,
                                }}
                                animate={
                                    visible
                                        ? {
                                              opacity: 1,
                                              y: 0,
                                          }
                                        : {}
                                }
                                transition={{
                                    duration: 0.55,
                                    ease: EASE,
                                }}
                            >
                                <div className='mb-3 flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <p className='text-xl font-medium text-zinc-900'>{item.label}</p>

                                        {weak && <span className='text-[10px] uppercase tracking-[0.2em] text-red-500'>Weak Spot</span>}
                                    </div>

                                    <p className='text-xl font-medium tabular-nums text-zinc-900'>
                                        {item.score}
                                        <span className='text-zinc-400'> / {item.total}</span>
                                    </p>
                                </div>

                                <div className='h-0.5 w-full bg-zinc-100'>
                                    <motion.div
                                        initial={{
                                            width: 0,
                                        }}
                                        animate={
                                            visible
                                                ? {
                                                      width: `${percent}%`,
                                                  }
                                                : {}
                                        }
                                        transition={{
                                            duration: 0.8,
                                            ease: EASE,
                                        }}
                                        className={`h-full ${weak ? 'bg-red-500' : 'bg-zinc-900'}`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Story3;