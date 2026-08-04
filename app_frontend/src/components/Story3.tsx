'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type BreakdownItem = {
    label: string;
    score: number;
    total: number;
};

type Story3Props = {
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
const WEAK_THRESHOLD = 40; // % below which a row is flagged red

const FilmGrain = () => (
    <svg className='pointer-events-none fixed inset-0 z-30 h-full w-full opacity-[0.05] mix-blend-overlay' aria-hidden='true'>
        <filter id='story3-grain'>
            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves={2} stitchTiles='stitch' />
            <feColorMatrix type='saturate' values='0' />
        </filter>
        <rect width='100%' height='100%' filter='url(#story3-grain)' />
    </svg>
);

const Story3 = ({ breakdown = DEFAULT_BREAKDOWN }: Story3Props) => {
    const reduceMotion = useReducedMotion();
    const [visibleRows, setVisibleRows] = useState(reduceMotion ? breakdown.length : 0);

    useEffect(() => {
        if (reduceMotion) return;

        const rowDelay = 380;
        const startDelay = 300;

        const timers = breakdown.map((_, i) => setTimeout(() => setVisibleRows(i + 1), startDelay + i * rowDelay));

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [breakdown, reduceMotion]);

    return (
        <section className='relative flex h-screen items-center justify-center overflow-hidden bg-white'>
            <div className='pointer-events-none absolute inset-0' style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,.035), transparent 70%)' }} />
            {!reduceMotion && <FilmGrain />}

            <div className='relative z-10 w-full max-w-3xl px-16'>
                <motion.p initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: EASE }} className='mb-16 text-center text-[13px] font-medium uppercase tracking-[0.4em] text-zinc-500'>
                    Score Breakdown
                </motion.p>

                <div className='space-y-12'>
                    {breakdown.map((item, index) => {
                        const pct = Math.round((item.score / item.total) * 100);
                        const isWeak = pct < WEAK_THRESHOLD;
                        const visible = index < visibleRows;

                        return (
                            <div key={item.label} className={visible ? '' : 'invisible'}>
                                <motion.div initial={reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 18, filter: 'blur(6px)' }} animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}} transition={{ duration: 0.5, ease: EASE }}>
                                    <div className='grid grid-cols-[1fr_auto] items-end gap-20'>
                                        <div>
                                            <p className='text-[19px] font-medium text-zinc-900'>{item.label}</p>

                                            {isWeak && <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500'>Weak Spot</p>}
                                        </div>
                                        <p className='text-[19px] font-medium tabular-nums text-zinc-900'>
                                            {item.score}
                                            <span className='text-zinc-400'>/{item.total}</span>
                                        </p>
                                    </div>

                                    <div className='mt-4 h-[1.5px] w-full overflow-hidden rounded-full bg-transparent'>
                                        <motion.div initial={{ width: '0%' }} animate={visible ? { width: `${pct}%` } : { width: '0%' }} transition={{ duration: 0.85, delay: 0.1, ease: EASE }} className={`h-full rounded-full ${isWeak ? 'bg-red-500' : 'bg-zinc-900'}`} />
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Story3;
