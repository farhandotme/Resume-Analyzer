'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type BreakdownItem = {
    label: string;
    score: number;
    total: number;
};

type Story3Props = {
    score?: number;
    breakdown?: BreakdownItem[];
};

const DEFAULT_BREAKDOWN: BreakdownItem[] = [
    { label: 'Skills Match', score: 22, total: 30 },
    { label: 'Experience', score: 15, total: 25 },
    { label: 'Projects', score: 18, total: 20 },
    { label: 'Resume Structure', score: 12, total: 15 },
    { label: 'ATS Keywords', score: 1, total: 10 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const FilmGrain = () => (
    <svg className='pointer-events-none fixed inset-0 z-30 h-full w-full opacity-[0.05] mix-blend-overlay' aria-hidden='true'>
        <filter id='story3-grain'>
            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves={2} stitchTiles='stitch' />
            <feColorMatrix type='saturate' values='0' />
        </filter>
        <rect width='100%' height='100%' filter='url(#story3-grain)' />
    </svg>
);

const Story3 = ({ score = 68, breakdown = DEFAULT_BREAKDOWN }: Story3Props) => {
    const reduceMotion = useReducedMotion();

    const [visibleRows, setVisibleRows] = useState(reduceMotion ? breakdown.length : 0);

    useEffect(() => {
        if (reduceMotion) return;
        const timers = breakdown.map((_, i) =>
            setTimeout(
                () => {
                    setVisibleRows(i + 1);
                },
                900 + i * 400,
            ),
        );
        return () => timers.forEach(clearTimeout);
    }, [breakdown, reduceMotion]);

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
                    <h1 className='mt-8 text-[170px] font-medium leading-none tracking-[-0.08em] text-zinc-900' style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}>
                        {score}
                    </h1>
                    <p className='mt-5 text-[15px] leading-8 text-zinc-500'>Your ATS score is built from five major evaluation categories. Strong projects boosted your score, while missing ATS keywords reduced it significantly.</p>
                </motion.div>
                <div className='w-155 space-y-10'>
                    {breakdown.map((item, index) => {
                        const visible = index < visibleRows;
                        const percent = (item.score / item.total) * 100;
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