'use client';

import { motion, useReducedMotion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

type Story2Props = {
    score?: number;
    jobTitle?: string;
    verdict?: string;
    hireProbability?: string;
    oneLiner?: string;
};

const GOLD = '#18181b';
const EASE_CINE = [0.16, 1, 0.3, 1] as const;

const getVerdict = (score: number) => {
    if (score >= 85) return 'Exceptional match.';
    if (score >= 70) return 'Strong resume.';
    if (score >= 50) return 'Good start.';
    return 'Needs work.';
};

const FilmGrain = () => (
    <svg className='pointer-events-none fixed inset-0 z-30 h-full w-full opacity-[0.05] mix-blend-overlay' aria-hidden='true'>
        <filter id='story2-grain'>
            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves={2} stitchTiles='stitch' />
            <feColorMatrix type='saturate' values='0' />
        </filter>
        <rect width='100%' height='100%' filter='url(#story2-grain)' />
    </svg>
);

const ShutterFlash = () => <motion.div className='pointer-events-none fixed inset-0 z-40 bg-white' initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} />;

const IrisRing = ({ value }: { value: number }) => {
    const size = 300;
    const radius = 126;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='absolute inset-0 -z-10'>
            <circle cx={size / 2} cy={size / 2} r={radius} fill='none' stroke='rgba(140,134,118,0.22)' strokeWidth={2} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill='none' stroke={GOLD} strokeWidth={2.5} strokeLinecap='round' strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ filter: `drop-shadow(0 0 8px ${GOLD})` }} />
        </svg>
    );
};

const Story2 = ({ score: targetScore = 68, verdict = getVerdict(targetScore), hireProbability = 'Medium', oneLiner = '' }: Story2Props) => {
    const reduceMotion = useReducedMotion();
    const [score, setScore] = useState(reduceMotion ? targetScore : 0);

    useEffect(() => {
        if (reduceMotion) {
            setScore(targetScore);
            return;
        }

        const controls = animate(0, targetScore, {
            duration: 0.95,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
            onUpdate(value) {
                setScore(Math.round(value));
            },
        });
        return () => controls.stop();
    }, [targetScore, reduceMotion]);

    return (
        <section className='relative flex h-screen w-full items-center justify-center overflow-hidden bg-white'>
            <div
                className='pointer-events-none absolute inset-0 z-10'
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0) 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.04) 100%)',
                }}
            />
            {!reduceMotion && <FilmGrain />}
            {!reduceMotion && <ShutterFlash />}

            <div className='relative z-10 flex flex-col items-center px-6 text-center'>
                <motion.div
                    initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 0.22, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    className='relative flex h-75 w-75 items-center justify-center'
                >
                    <motion.div
                        className='absolute inset-8 rounded-full'
                        style={{
                            background: `radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)`,
                        }}
                        animate={reduceMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                    />
                    <IrisRing value={score} />
                    <h1 className='text-[110px] font-medium leading-none tracking-[-0.04em] text-zinc-900 sm:text-[138px]'>{score}</h1>
                </motion.div>

                <motion.p
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 1.3, duration: 0.5, ease: EASE_CINE }}
                    className='mt-8 text-[13px] font-medium uppercase tracking-[0.4em] text-zinc-500'
                >
                    ATS Score
                </motion.p>

                {oneLiner && (
                    <motion.p initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 1.8, duration: 0.6, ease: EASE_CINE }} className='mt-10 max-w-120 text-[18px] leading-relaxed text-zinc-600'>
                        {oneLiner}
                    </motion.p>
                )}

                <motion.div initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 1.55, duration: 0.5, ease: EASE_CINE }} className='mt-10 flex items-center gap-8'>
                    <div className='text-center'>
                        <p className='text-lg font-medium text-zinc-900'>{verdict}</p>
                        <p className='mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400'>Verdict</p>
                    </div>
                    <div className='h-8 w-px bg-zinc-200' />
                    <div className='text-center'>
                        <p className='text-lg font-medium text-zinc-900'>{hireProbability}</p>
                        <p className='mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400'>Hire Probability</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Story2;
