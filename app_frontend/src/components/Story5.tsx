'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useStory } from './StoryContext';

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_DRAW = [0.65, 0, 0.35, 1] as const;
const TRAVEL_EASE_X = [0.4, 0, 0.2, 1] as const;
const TRAVEL_EASE_Y = [0.16, 1, 0.3, 1] as const;

const CX = 60;
const CY = 60;

const TRIANGLE_PATH = 'M 60 8 L 105 86 L 15 86 Z';

const SEGMENT_COUNT = 4;
const SEGMENT_LEN = 18;
const SEGMENT_START_ROTATION = [-235, 210, -290, 260];
const SEG_AT = 0.35;
const SEG_STAGGER = 0.14;
const LOCK_AT = SEG_AT + (SEGMENT_COUNT - 1) * SEG_STAGGER + 0.85;
const BAR_AT = LOCK_AT + 0.18;
const DOT_AT = BAR_AT + 0.3;

export const GLYPH_LOCK_AT = LOCK_AT;
export const GLYPH_FORMATION_DURATION = DOT_AT + 0.45;
export const GLYPH_ACCENT = 'currentColor';

type Phase = 'forming' | 'holding' | 'preTravel' | 'traveling' | 'landed';

type FaultGlyphProps = {
    phase: Phase;
    still?: boolean;
    className?: string;
};

function FaultGlyph({ phase, still = false }: FaultGlyphProps) {
    const [formationStarted, setFormationStarted] = useState(false);

    const ringOrigin = `${CX}px ${CY}px`;
    const barOrigin = `${CX}px 45px`;
    const dotOrigin = `${CX}px 68px`;
    const isLanded = phase === 'landed';

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setFormationStarted(true);
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <motion.svg viewBox='0 0 120 120' fill='none' className='h-full w-full text-zinc-900 dark:text-white' aria-hidden initial={{ color: 'currentColor' }} animate={{ color: 'currentColor' }} transition={{ duration: 0 }}>
            {Array.from({
                length: SEGMENT_COUNT,
            }).map((_, i) => (
                <motion.path
                    key={i}
                    d={TRIANGLE_PATH}
                    pathLength='100'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    strokeLinecap='square'
                    strokeDasharray={`${SEGMENT_LEN} 82`}
                    strokeDashoffset={-(i * 25)}
                    initial={still ? { rotate: 0, opacity: 1, scale: 1 } : { rotate: SEGMENT_START_ROTATION[i], opacity: 0, scale: 0.4 }}
                    animate={still ? { rotate: 0, opacity: 1, scale: 1 } : !formationStarted ? { rotate: SEGMENT_START_ROTATION[i], opacity: 0, scale: 0.4 } : isLanded ? { rotate: 0, opacity: 1, scale: 1 } : { rotate: [SEGMENT_START_ROTATION[i], i % 2 === 0 ? -7 : 7, 0], opacity: 1, scale: 1 }}
                    transition={
                        still
                            ? { duration: 0 }
                            : isLanded
                              ? { duration: 0 }
                              : {
                                    rotate: { duration: 1.05, ease: EASE_DRAW, delay: SEG_AT + i * SEG_STAGGER, times: [0, 0.72, 1] },
                                    opacity: { duration: 0.4, delay: SEG_AT + i * SEG_STAGGER },
                                    scale: { duration: 0.65, ease: EASE, delay: SEG_AT + i * SEG_STAGGER },
                                }
                    }
                    style={{ transformOrigin: ringOrigin }}
                />
            ))}

            <motion.line
                x1={CX}
                x2={CX}
                y1={30}
                y2={56}
                stroke='currentColor'
                strokeWidth={4.5}
                strokeLinecap='round'
                initial={still ? { scaleY: 1, opacity: 1, filter: 'blur(0px)' } : { scaleY: 0, opacity: 0, filter: 'blur(6px)' }}
                animate={still ? { scaleY: 1, opacity: 1, filter: 'blur(0px)' } : !formationStarted ? { scaleY: 0, opacity: 0, filter: 'blur(6px)' } : { scaleY: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={
                    still
                        ? { duration: 0 }
                        : isLanded
                          ? { duration: 0 }
                          : {
                                scaleY: { duration: 0.5, ease: EASE_DRAW, delay: BAR_AT },
                                opacity: { duration: 0.3, delay: BAR_AT },
                                filter: { duration: 0.45, delay: BAR_AT },
                            }
                }
                style={{ transformOrigin: barOrigin }}
            />

            <motion.circle
                cx={CX}
                cy={68}
                r={3.5}
                fill='currentColor'
                initial={still ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 0 }}
                animate={still ? { scale: 1, opacity: 1 } : !formationStarted ? { scale: 1, opacity: 0 } : isLanded ? { scale: 1, opacity: [1, 0.4, 1] } : { scale: 1, opacity: 1 }}
                transition={still ? { duration: 0 } : isLanded ? { duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } : { duration: 0.4, ease: EASE, delay: DOT_AT }}
                style={{ transformOrigin: dotOrigin }}
            />
        </motion.svg>
    );
}

function GeometricTrail({ phase, target, glyphSize }: { phase: Phase; target: any; glyphSize: string }) {
    if (!target) return null;

    const active = phase === 'traveling';

    return (
        <>
            {[1, 2, 3].map((i) => {
                const delay = i * 0.06;

                return (
                    <motion.div
                        key={`trail-${i}`}
                        aria-hidden
                        className='pointer-events-none fixed left-1/2 top-1/2 z-30'
                        style={{ width: glyphSize, height: glyphSize, marginLeft: `calc(${glyphSize} / -2)`, marginTop: `calc(${glyphSize} / -2)` }}
                        initial={{ x: 0, y: 0, scale: 0.94, opacity: 0 }}
                        animate={active ? { x: target.x, y: target.y, scale: target.scale, opacity: [0, 0.4, 0] } : { x: 0, y: 0, scale: 0.94, opacity: 0 }}
                        transition={active ? { x: { duration: 1.15, ease: TRAVEL_EASE_X, delay }, y: { duration: 1.15, ease: TRAVEL_EASE_Y, delay }, scale: { duration: 1.15, ease: TRAVEL_EASE_Y, delay }, opacity: { duration: 0.92, times: [0, 0.3, 1], delay } } : { duration: 0 }}
                    >
                        <svg viewBox='0 0 120 120' className='h-full w-full' style={{ color: GLYPH_ACCENT }}>
                            {i === 1 && <path d={TRIANGLE_PATH} stroke='currentColor' strokeWidth={1} fill='none' strokeDasharray='3 12' pathLength='100' />}
                            {i === 2 && <path d={TRIANGLE_PATH} stroke='currentColor' strokeWidth={0.5} fill='none' />}
                            {i === 3 && <path d={TRIANGLE_PATH} stroke='currentColor' strokeWidth={2} fill='none' strokeDasharray='1 30' pathLength='100' opacity={0.6} />}
                        </svg>
                    </motion.div>
                );
            })}
        </>
    );
}

type ResumeIssue = {
    title?: string;
    issue?: string;
    name?: string;
    problem?: string;
    description?: string;
    recommendation?: string;
    details?: string;
    priority?: string;
    severity?: string;
};

type MissingSkill = {
    skill?: string;
    name?: string;
    priority?: string;
    importance?: string;
};

type SupportingIssue = {
    title: string;
    description?: string;
    tag?: string;
};

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getIssueTitle = (item: ResumeIssue | MissingSkill) => {
    const any = item as ResumeIssue & MissingSkill;

    if ('skill' in item) {
        return clean(any.skill) || clean(any.name);
    }

    return clean(any.title) || clean(any.issue) || clean(any.name) || clean(any.problem);
};

const getIssueDescription = (item: ResumeIssue) => clean(item.description) || clean(item.recommendation) || clean(item.details);

const getPriorityWeight = (priority?: string) => {
    const value = clean(priority).toLowerCase();

    if (value.includes('critical')) return 4;
    if (value.includes('high')) return 3;
    if (value.includes('important')) return 2;
    if (value.includes('nice')) return 1;

    return 0;
};

export default function Story5() {
    const { analysisResult } = useStory();
    const reduceMotion = useReducedMotion();

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

    const data = analysisResult?.data?.data as Record<string, any> | undefined;
    const rawResumeFixes: ResumeIssue[] = data?.['resume_fixes'] ?? data?.['resumeFixes'] ?? data?.['issues'] ?? data?.['weaknesses'] ?? [];
    const rawMissingSkills: MissingSkill[] = data?.['skills']?.missing ?? data?.['missing_skills'] ?? data?.['missingSkills'] ?? [];
    const resumeFixes = Array.isArray(rawResumeFixes) ? rawResumeFixes.filter((item) => getIssueTitle(item).length > 0) : [];
    const missingSkills = Array.isArray(rawMissingSkills) ? rawMissingSkills.filter((item) => getIssueTitle(item).length > 0) : [];
    const sortedIssues = [...resumeFixes].sort((a, b) => getPriorityWeight(b.priority || b.severity) - getPriorityWeight(a.priority || a.severity));
    const primaryIssue = sortedIssues[0];
    const primaryTitle = getIssueTitle(primaryIssue || {}) || getIssueTitle(missingSkills[0] || {});
    const primaryDescription = primaryIssue ? getIssueDescription(primaryIssue) : '';
    const primaryTag = clean(primaryIssue?.priority || primaryIssue?.severity);
    const isLongPrimary = primaryTitle.length > 42;
    const usedTitles = new Set<string>(primaryTitle ? [primaryTitle.toLowerCase()] : []);
    const supportingIssues: SupportingIssue[] = [];

    for (const issue of sortedIssues.slice(1)) {
        const title = getIssueTitle(issue);

        if (!title || usedTitles.has(title.toLowerCase())) {
            continue;
        }

        supportingIssues.push({
            title,
            description: getIssueDescription(issue),
            tag: clean(issue.priority || issue.severity) || undefined,
        });

        usedTitles.add(title.toLowerCase());

        if (supportingIssues.length >= 3) {
            break;
        }
    }

    for (const skill of missingSkills) {
        if (supportingIssues.length >= 3) {
            break;
        }

        const title = getIssueTitle(skill);

        if (!title || usedTitles.has(title.toLowerCase())) {
            continue;
        }

        supportingIssues.push({
            title,
            tag: clean(skill.priority || skill.importance) || 'Skill gap',
        });

        usedTitles.add(title.toLowerCase());
    }

    const anchorSize = 'clamp(56px, 8vw, 92px)';

    const T = {
        formation: GLYPH_FORMATION_DURATION * 0.7,
        hold: 0.5,
        preTravel: 0.25,
        travel: 0.9,
        land: 0.25,
    };

    const ARRIVED_AT = T.formation + T.hold + T.preTravel + T.travel;
    const anchorRef = useRef<HTMLSpanElement>(null);

    const [target, setTarget] = useState<{
        x: number;
        y: number;
        scale: number;
    } | null>(null);

    const [phase, setPhase] = useState<Phase>('forming');

    useLayoutEffect(() => {
        const measure = () => {
            const el = anchorRef.current;

            if (!el) return;

            const r = el.getBoundingClientRect();
            const big = Math.min(window.innerWidth * 0.42, 300);

            setTarget({
                x: r.left + r.width / 2 - window.innerWidth / 2,
                y: r.top + r.height / 2 - window.innerHeight / 2,
                scale: (r.width / big) * 1.6,
            });
        };

        measure();

        const isLocked = phase === 'traveling' || phase === 'landed';

        let rafId: number | null = null;

        if (!isLocked) {
            const tick = () => {
                measure();
                rafId = requestAnimationFrame(tick);
            };

            rafId = requestAnimationFrame(tick);
        }

        window.addEventListener('resize', measure);

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }

            window.removeEventListener('resize', measure);
        };
    }, [primaryTitle, phase]);

    useEffect(() => {
        if (!hasStarted) return;

        if (reduceMotion) {
            setPhase('landed');
            return;
        }

        setPhase('forming');

        const timers = [
            window.setTimeout(() => setPhase('holding'), T.formation * 1000),
            window.setTimeout(() => setPhase('preTravel'), (T.formation + T.hold) * 1000),
            window.setTimeout(() => setPhase('traveling'), (T.formation + T.hold + T.preTravel) * 1000),
            window.setTimeout(() => setPhase('landed'), ARRIVED_AT * 1000),
        ];

        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, [hasStarted, reduceMotion, primaryTitle]);

    if (!primaryTitle) {
        return (
            <section className='relative left-[calc(50%-50vw)] flex h-screen w-screen items-center justify-center overflow-hidden bg-white px-6 text-zinc-900 dark:bg-black dark:text-white'>
                <span className='font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-600'>No critical weaknesses detected</span>
            </section>
        );
    }

    const glyphSize = 'min(42vw, 300px)';
    const contentVisible = reduceMotion || phase === 'landed';

    return (
        <section
            className='fixed inset-0 h-dvh w-screen overflow-hidden overscroll-none bg-white text-zinc-900 dark:bg-black dark:text-white'
            style={
                {
                    '--story5-accent': 'currentColor',
                    '--story5-accent-rgb': '228, 228, 231',
                } as React.CSSProperties
            }
        >
            {!reduceMotion && <GeometricTrail phase={phase} target={target} glyphSize={glyphSize} />}

            <motion.div
                aria-hidden
                className='pointer-events-none fixed left-1/2 top-1/2 z-40'
                style={{ width: glyphSize, height: glyphSize, marginLeft: `calc(${glyphSize} / -2)`, marginTop: `calc(${glyphSize} / -2)` }}
                initial={reduceMotion ? { x: target?.x ?? 0, y: target?.y ?? 0, scale: target?.scale ?? 0.2 } : { x: 0, y: 0, scale: 1 }}
                animate={
                    !hasStarted
                        ? { x: 0, y: 0, scale: 1, filter: 'drop-shadow(0 0 0px rgba(var(--story5-accent-rgb), 0))' }
                        : target && (phase === 'traveling' || phase === 'landed')
                          ? { x: target.x, y: target.y, scale: target.scale, filter: phase === 'landed' ? `drop-shadow(0 0 18px rgba(var(--story5-accent-rgb), 0.35))` : `drop-shadow(0 0 15px rgba(var(--story5-accent-rgb), 0.24))` }
                          : {
                                x: 0,
                                y: 0,
                                scale: phase === 'preTravel' ? 0.94 : 1,
                                filter:
                                    phase === 'holding'
                                        ? ['drop-shadow(0 0 0px rgba(var(--story5-accent-rgb), 0))', 'drop-shadow(0 0 35px rgba(var(--story5-accent-rgb), 0.28))', 'drop-shadow(0 0 25px rgba(var(--story5-accent-rgb), 0.20))']
                                        : phase === 'preTravel'
                                          ? `drop-shadow(0 0 45px rgba(var(--story5-accent-rgb), 0.30))`
                                          : 'drop-shadow(0 0 0px rgba(var(--story5-accent-rgb), 0))',
                            }
                }
                transition={
                    reduceMotion
                        ? { duration: 0 }
                        : phase === 'landed'
                          ? { scale: { duration: T.land, ease: 'easeOut' } }
                          : phase === 'traveling'
                            ? { x: { duration: T.travel, ease: TRAVEL_EASE_X }, y: { duration: T.travel, ease: TRAVEL_EASE_Y }, scale: { duration: T.travel, ease: TRAVEL_EASE_Y }, filter: { duration: T.travel, ease: 'easeOut' } }
                            : { scale: { duration: T.preTravel, ease: 'easeInOut' }, filter: { duration: T.hold, ease: 'easeInOut' } }
                }
            >
                {hasStarted && <FaultGlyph phase={phase} still={!!reduceMotion} className='h-full w-full' />}
            </motion.div>

            <div className='relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-2 text-center sm:px-10'>
                <span ref={anchorRef} className='block shrink-0' style={{ width: anchorSize, height: anchorSize }} />

                <motion.div
                    className='mt-4 flex w-full max-w-[92vw] flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3'
                    initial={{ opacity: 0, y: 8 }}
                    animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.7, ease: EASE, delay: contentVisible ? 0.05 : 0 }}
                >
                    <span className='font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600 sm:text-[10px] sm:tracking-[0.45em] dark:text-zinc-500'>Primary weakness</span>

                    {primaryTag && (
                        <span className='rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-700 sm:px-2.5 sm:py-0.5 sm:text-[9px] sm:tracking-[0.2em] dark:text-zinc-300' style={{ borderColor: 'rgba(var(--story5-accent-rgb), 0.25)' }}>
                            {primaryTag}
                        </span>
                    )}
                </motion.div>

                <motion.h1
                    className={`mt-4 w-full max-w-none wrap-break-word font-light leading-[1.02] tracking-[-0.02em] text-zinc-900 sm:mt-5 sm:max-w-187.5 dark:text-zinc-100 ${isLongPrimary ? 'text-[clamp(1.45rem,5.2vw,2.8rem)]' : 'text-[clamp(1.7rem,6vw,3.6rem)]'}`}
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                    initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                    animate={contentVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 14, filter: 'blur(8px)' }}
                    transition={{ duration: 1, ease: EASE, delay: contentVisible ? 0.12 : 0 }}
                >
                    {primaryTitle}
                </motion.h1>

                {primaryDescription && (
                    <motion.p
                        className='mt-4 max-w-[90vw] text-[0.75rem] leading-relaxed text-zinc-500 sm:mt-5 sm:max-w-md sm:text-[0.8rem] dark:text-zinc-500'
                        initial={{ opacity: 0 }}
                        animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 1, ease: EASE, delay: contentVisible ? 0.45 : 0 }}
                    >
                        {primaryDescription}
                    </motion.p>
                )}

                {supportingIssues.length > 0 && (
                    <div className='mt-6 w-full max-w-none sm:mt-10 sm:max-w-2xl'>
                        <motion.div
                            className='mx-auto mb-3 h-6 w-px origin-top bg-linear-to-b from-zinc-400/40 to-transparent sm:mb-4 sm:h-7 dark:from-white/25'
                            initial={{ scaleY: 0 }}
                            animate={contentVisible ? { scaleY: 1 } : { scaleY: 0 }}
                            transition={{ duration: 0.6, ease: EASE, delay: contentVisible ? 0.55 : 0 }}
                        />

                        <motion.div className='flex items-baseline justify-between border-b border-zinc-200 pb-2.5 dark:border-white/10' initial={{ opacity: 0 }} animate={contentVisible ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.6, ease: EASE, delay: contentVisible ? 0.7 : 0 }}>
                            <span className='font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-500 sm:text-[9px] sm:tracking-[0.4em] dark:text-zinc-600'>Other weaknesses</span>
                        </motion.div>

                        <div className='relative'>
                            {supportingIssues.map((issue, i) => {
                                const rowDelay = 0.9 + i * 0.28;

                                return (
                                    <div key={issue.title} className='relative overflow-hidden'>
                                        {!reduceMotion && (
                                            <motion.span
                                                aria-hidden
                                                className='absolute bottom-0 top-0 z-10 w-px'
                                                style={{ background: 'var(--story5-accent)', boxShadow: '0 0 12px rgba(var(--story5-accent-rgb), 0.18)' }}
                                                initial={{ left: '0%', opacity: 0 }}
                                                animate={contentVisible ? { left: '100%', opacity: [0, 1, 1, 0] } : { left: '0%', opacity: 0 }}
                                                transition={{ duration: 0.85, ease: [0.7, 0, 0.3, 1], delay: rowDelay, times: [0, 0.1, 0.9, 1] }}
                                            />
                                        )}

                                        <motion.div
                                            className='flex items-start gap-3 py-3 text-left sm:gap-5 sm:py-3.5'
                                            initial={reduceMotion ? { opacity: 0 } : { clipPath: 'inset(0 100% 0 0)', opacity: 1 }}
                                            animate={contentVisible ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 } : { clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                                            transition={{ duration: reduceMotion ? 0.5 : 0.85, ease: [0.7, 0, 0.3, 1], delay: rowDelay }}
                                        >
                                            <span className='relative mt-1.25 flex h-2.5 w-2.5 shrink-0 items-center justify-center sm:h-2.75 sm:w-2.75'>
                                                {!reduceMotion && (
                                                    <motion.span
                                                        aria-hidden
                                                        className='absolute inline-flex h-full w-full rounded-full'
                                                        style={{ background: 'rgba(var(--story5-accent-rgb), 0.12)' }}
                                                        animate={{ scale: [1, 1.75, 1], opacity: [0.5, 0, 0.5] }}
                                                        transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity, delay: rowDelay + 0.6 + i * 0.55 }}
                                                    />
                                                )}
                                                <span className='relative inline-flex h-1.25 w-1.25 rounded-full' style={{ background: 'var(--story5-accent)' }} />
                                            </span>

                                            <div className='min-w-0 flex-1'>
                                                <div className='flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
                                                    <h2 className='min-w-0 text-balance max-[639.9px]:text-wrap text-[clamp(0.9rem,3.5vw,1.15rem)] font-light leading-snug tracking-[-0.01em] text-zinc-800 sm:text-balance dark:text-zinc-100'>{issue.title}</h2>

                                                    {issue.tag && (
                                                        <span className='hidden shrink-0 min-[640px]:block'>
                                                            <span className='inline-flex min-w-20 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/40 px-2.5 py-1 font-mono text-[7px] font-medium uppercase tracking-[0.15em] text-zinc-500 sm:min-w-25 sm:px-3 sm:text-[8px] sm:tracking-[0.18em] dark:border-white/10 dark:bg-white/2.5 dark:text-zinc-400'>
                                                                {issue.tag}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>

                                                {issue.description && <p className='mt-1.5 max-w-[90vw] text-[0.68rem] leading-relaxed text-zinc-500 sm:max-w-[52ch] sm:text-[0.72rem]'>{issue.description}</p>}
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}