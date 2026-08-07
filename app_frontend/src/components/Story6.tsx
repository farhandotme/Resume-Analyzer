'use client';

import { motion, animate } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type Story6Props = {
    score?: number;
    strengths?: string[];
    badgeLabel?: string;
};

const DEFAULT_STRENGTHS = ['ATS Friendly Resume', 'Strong Technical Projects', 'Clean Resume Structure', 'Modern Backend Tech Stack'];

const EASE = [0.22, 1, 0.36, 1] as const;

type ConfettiPiece = {
    id: number;
    side: 'left' | 'right';
    leftPct: number;
    size: number;
    rotateStart: number;
    rotateEnd: number;
    fall: number;
    drift: number;
    duration: number;
    delay: number;
    repeatDelay: number;
    tone: 'white' | 'mist' | 'sky' | 'mint';
};

const TONE_CLASS: Record<ConfettiPiece['tone'], string> = {
    white: 'bg-white',
    mist: 'bg-zinc-200',
    sky: 'bg-blue-100',
    mint: 'bg-emerald-100',
};

const makeConfetti = (count: number): ConfettiPiece[] => {
    const tones: ConfettiPiece['tone'][] = ['white', 'white', 'mist', 'mist', 'sky', 'mint'];
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
        const side: ConfettiPiece['side'] = i % 2 === 0 ? 'left' : 'right';
        pieces.push({
            id: i,
            side,
            leftPct: 6 + Math.random() * 88,
            size: 4 + Math.random() * 5,
            rotateStart: Math.random() * 180 - 90,
            rotateEnd: Math.random() * 620 - 310,
            fall: 320 + Math.random() * 220,
            drift: 60 + Math.random() * 120,
            duration: 2.2 + Math.random() * 1.8,
            delay: Math.random() * 3,
            repeatDelay: 0.3 + Math.random() * 2.4,
            tone: tones[Math.floor(Math.random() * tones.length)],
        });
    }
    return pieces;
};

type ConfettiFieldProps = {
    active: boolean;
    mode?: 'infinite' | 'timed';
};

const ConfettiField = ({ active, mode = 'infinite' }: ConfettiFieldProps) => {
    const pieces = useMemo(() => makeConfetti(mode === 'infinite' ? 84 : 72), [mode]);

    if (!active) return null;

    return (
        <>
            {(['left', 'right'] as const).map((side) => (
                <div key={side} aria-hidden='true' className={`pointer-events-none absolute top-0 h-full w-[24vw] overflow-hidden ${side === 'left' ? 'left-0' : 'right-0'}`} style={{ zIndex: 5 }}>
                    {pieces
                        .filter((p) => p.side === side)
                        .map((p) => {
                            const driftPx = side === 'left' ? p.drift : -p.drift;
                            return (
                                <motion.span
                                    key={p.id}
                                    className={`absolute rounded-xs ${TONE_CLASS[p.tone]}`}
                                    style={{
                                        left: `${p.leftPct}%`,
                                        width: p.size,
                                        height: p.size * 2.4,
                                        top: -24,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                    }}
                                    initial={{ opacity: 0, y: -24, x: 0, rotate: p.rotateStart }}
                                    animate={{ opacity: [0, 1, 1, 0], y: p.fall, x: driftPx, rotate: p.rotateEnd }}
                                    transition={{
                                        duration: p.duration,
                                        delay: p.delay,
                                        ease: 'easeIn',
                                        times: [0, 0.12, 0.7, 1],
                                        ...(mode === 'infinite' ? { repeat: Infinity, repeatDelay: p.repeatDelay } : {}),
                                    }}
                                />
                            );
                        })}
                </div>
            ))}
        </>
    );
};

export default function Story6({ score: targetScore = 92, strengths = DEFAULT_STRENGTHS, badgeLabel = 'Excellent Resume' }: Story6Props) {
    const [score, setScore] = useState(0);
    const [bounce, setBounce] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);

    useEffect(() => {
        const controls = animate(0, targetScore, {
            duration: 1.1,
            delay: 0.9,
            ease: EASE,
            onUpdate(v) {
                setScore(Math.round(v));
            },
            onComplete() {
                setBounce(true);
            },
        });

        const confettiOn = setTimeout(() => setConfettiActive(true), 1000);

        return () => {
            controls.stop();
            clearTimeout(confettiOn);
        };
    }, [targetScore]);

    return (
        <section className='relative flex h-screen w-full items-center justify-center overflow-hidden bg-white'>
            <div className='pointer-events-none absolute inset-0' style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,.03), transparent 70%)' }} />

            <motion.div
                aria-hidden='true'
                className='pointer-events-none absolute h-130 w-130 rounded-full blur-3xl'
                style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0.85, 0.5] }}
                transition={{ opacity: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
            />

            <ConfettiField active={confettiActive} />

            <div className='relative z-10 w-full max-w-xl px-6'>
                <motion.div
                    initial={{ opacity: 0, y: 46, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.75, ease: EASE }}
                    className='relative overflow-hidden rounded-4xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,.07)]'
                    style={{ padding: 'clamp(2rem,4.5vh,3.25rem) clamp(2rem,4.5vw,3.5rem)' }}
                >
                    <motion.div
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-y-0 w-[45%]'
                        style={{ background: 'linear-gradient(75deg, transparent 0%, rgba(0,0,0,0.035) 45%, transparent 100%)' }}
                        initial={{ left: '-55%' }}
                        animate={{ left: '110%' }}
                        transition={{ duration: 1.1, delay: 3.8, ease: 'easeInOut' }}
                    />
                    {(['left', 'right'] as const).map((corner) => (
                        <motion.span
                            key={corner}
                            aria-hidden='true'
                            className={`pointer-events-none absolute top-6 h-6 w-6 ${corner === 'left' ? 'left-6' : 'right-6'}`}
                            style={{
                                background: 'radial-gradient(circle, rgba(0,0,0,0.10) 0%, transparent 70%)',
                            }}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 1.6] }}
                            transition={{ duration: 0.9, delay: 1.0, ease: 'easeOut' }}
                        />
                    ))}
                    <div className='text-center'>
                        <p className='text-[12px] uppercase tracking-[0.4em] text-zinc-500'>Final Report</p>
                        <h1 className='mt-4 font-semibold tracking-[-0.06em] text-zinc-900' style={{ fontSize: 'clamp(2rem, 4.2vh, 2.75rem)' }}>
                            Resume Ready
                        </h1>
                    </div>
                    <div className='mt-[clamp(1.5rem,3.5vh,2.5rem)] text-center'>
                        <p className='text-[13px] uppercase tracking-[0.35em] text-zinc-400'>ATS Score</p>
                        <motion.div className='mt-2 leading-none tracking-[-0.07em] text-zinc-900' style={{ fontSize: 'clamp(4.5rem, 11vh, 6.75rem)', fontWeight: 600 }} animate={bounce ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.5, ease: EASE }}>
                            {score}
                        </motion.div>
                        <p className='mt-1 text-[16px] text-zinc-500'>out of 100</p>
                    </div>
                    <div className='mt-[clamp(1.25rem,2.8vh,2rem)] flex justify-center'>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.0, duration: 0.45, ease: EASE }} className='rounded-full bg-emerald-50 px-5 py-2.5'>
                            <span className='text-[12px] font-semibold uppercase tracking-[0.16em] text-emerald-700'>{badgeLabel}</span>
                        </motion.div>
                    </div>

                    <div className='mt-[clamp(1.5rem,3.2vh,2.25rem)] grid grid-cols-2 gap-x-6 gap-y-4'>
                        {strengths.map((item, index) => (
                            <motion.div key={item} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 + index * 0.15, duration: 0.4, ease: EASE }} className='flex items-center gap-2.5'>
                                <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] text-white'>✓</div>
                                <p className='text-[14.5px] leading-snug text-zinc-700'>{item}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className='mt-[clamp(1.75rem,3.5vh,2.5rem)] flex justify-center gap-3'>
                        <motion.button
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 4.3, duration: 0.45, ease: EASE }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className='rounded-full bg-zinc-900 px-7 py-3.5 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]'
                        >
                            Download PDF
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 4.45, duration: 0.45, ease: EASE }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className='rounded-full border border-zinc-300 px-7 py-3.5 text-[14px] font-medium text-zinc-900'
                        >
                            Analyze Again
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}