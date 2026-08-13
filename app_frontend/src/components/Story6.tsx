'use client';

import React, { useRef, type MouseEvent } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useStory } from './StoryContext';

type ResumeFix = {
    priority?: string;
    section?: string;
    fix?: string;
    why?: string;
};

type MissingSkill = {
    skill?: string;
    priority?: string;
    importance?: string;
};

type ActionPlanItem = {
    timeline?: string;
    action?: string;
    impact?: string;
};

type Improvement = {
    number: string;
    title: string;
    description: string;
    action: string;
};

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const lower = (value: unknown) => clean(value).toLowerCase();

const matches = (value: unknown, terms: string[]) => {
    const text = lower(value);
    return terms.some((term) => text.includes(term.toLowerCase()));
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));
const decapitalize = (value: string) => (value ? value.charAt(0).toLowerCase() + value.slice(1) : value);

const formatList = (items: string[]) => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) {
        return `${items[0]} and ${items[1]}`;
    }
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

const GOLD = '199, 169, 108';

const AnimatedWords = ({ text, delay = 0, reduceMotion }: { text: string; delay?: number; reduceMotion: boolean | null }) => {
    const words = text.split(' ');
    return (
        <>
            {words.map((word, index) => (
                <React.Fragment key={`${word}-${index}`}>
                    <span className='inline-block overflow-hidden align-bottom'>
                        <motion.span
                            className='inline-block'
                            initial={reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: '115%', filter: 'blur(5px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.5, delay: reduceMotion ? 0 : delay + index * 0.018, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {word}
                        </motion.span>
                    </span>
                    {index < words.length - 1 && ' '}
                </React.Fragment>
            ))}
        </>
    );
};

const CARD_ENTRANCE_DIRECTIONS = [
    { x: -120, y: 70, rotateY: -42, rotateX: 22, rotateZ: -5 },
    { x: 0, y: 150, rotateY: 0, rotateX: -34, rotateZ: 0 },
    { x: 120, y: 70, rotateY: 42, rotateX: 22, rotateZ: 5 },
];

const CORNER_MARKS = [
    { position: '-top-2 -left-2', border: 'border-l border-t', origin: 'top left' },
    { position: '-top-2 -right-2', border: 'border-r border-t', origin: 'top right' },
    { position: '-bottom-2 -left-2', border: 'border-l border-b', origin: 'bottom left' },
    { position: '-bottom-2 -right-2', border: 'border-r border-b', origin: 'bottom right' },
];

const PremiumCard = ({ improvement, index, reduceMotion }: { improvement: Improvement; index: number; reduceMotion: boolean | null }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);
    const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], ['6deg', '-6deg']), { damping: 30, stiffness: 200 });
    const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], ['-6deg', '6deg']), { damping: 30, stiffness: 200 });
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const hoverState = useMotionValue(0);
    const hoverOpacity = useSpring(hoverState, { damping: 30, stiffness: 200 });
    const liftY = useTransform(hoverOpacity, [0, 1], [0, -10]);
    const liftScale = useTransform(hoverOpacity, [0, 1], [1, 1.012]);
    const cornerScale = useTransform(hoverOpacity, [0, 1], [0.8, 1]);
    const reticleOpacity = useTransform(hoverOpacity, [0, 1], [0, 0.4]);
    const dotOpacity = useTransform(hoverOpacity, [0, 1], [0, 0.9]);
    const actionBorderOpacity = useTransform(hoverOpacity, [0, 1], [0, 0.45]);
    const actionArrowX = useTransform(hoverOpacity, [0, 1], [-4, 0]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
        tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = () => {
        hoverState.set(1);
    };

    const handleMouseLeave = () => {
        hoverState.set(0);
        tiltX.set(0);
        tiltY.set(0);
    };

    const delay = reduceMotion ? 0 : 0.5 + index * 0.18;
    const dir = CARD_ENTRANCE_DIRECTIONS[index % CARD_ENTRANCE_DIRECTIONS.length];
    const entranceDelay = reduceMotion ? 0 : index * 0.16;
    const revealDelay = entranceDelay + 0.62;

    return (
        <motion.div
            className='h-full'
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
            initial={reduceMotion ? { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 } : { opacity: 0, x: dir.x, y: dir.y, scale: 0.7, rotateX: dir.rotateX, rotateY: dir.rotateY, rotateZ: dir.rotateZ }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 78, damping: 14, mass: 1.1, delay: entranceDelay }}
        >
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY, y: reduceMotion ? 0 : liftY, scale: reduceMotion ? 1 : liftScale, transformStyle: 'preserve-3d' }}
                className='group relative flex h-full cursor-crosshair flex-col rounded-3xl p-px shadow-2xl transition-shadow duration-500 group-hover:shadow-2xl'
            >
                {!reduceMotion &&
                    CORNER_MARKS.map((corner) => (
                        <motion.span
                            key={corner.position}
                            aria-hidden
                            className={`pointer-events-none absolute ${corner.position} z-20 h-4 w-4 ${corner.border}`}
                            style={{ borderColor: `rgba(${GOLD}, 0.85)`, borderWidth: '1.5px', opacity: hoverOpacity, scale: cornerScale, transformOrigin: corner.origin }}
                        />
                    ))}

                <motion.div aria-hidden className='pointer-events-none absolute -inset-3 -z-10 rounded-[28px] blur-2xl' style={{ opacity: reduceMotion ? 0 : useTransform(hoverOpacity, [0, 1], [0, 0.35]), background: `radial-gradient( 60% 60% at 50% 100%, rgba(${GOLD}, 0.25), transparent 75%)` }} />

                <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl'>
                    <div className='absolute inset-0 rounded-3xl bg-zinc-100 dark:bg-zinc-900/80' />
                    <div className='absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-linear-to-r from-transparent via-zinc-400/50 to-transparent opacity-50 dark:via-zinc-400/50' />
                    <motion.div
                        className='absolute inset-0 z-10'
                        style={{
                            opacity: hoverOpacity,
                            background: useMotionTemplate`
                                    radial-gradient( 250px circle at ${mouseX}px ${mouseY}px, rgba(0, 0, 0, 0.05), transparent 80%)`,
                        }}
                    />
                </div>

                <div className='relative z-10 flex h-full flex-col overflow-hidden rounded-[23px] bg-white p-6 text-left dark:bg-[#030303]'>
                    <div
                        className='pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay'
                        style={{
                            backgroundImage:
                                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                        }}
                    />
                    <motion.div className='pointer-events-none absolute inset-0 z-0 mix-blend-screen' style={{ opacity: hoverOpacity, background: useMotionTemplate` radial-gradient( 350px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.015), transparent 70%)` }} />

                    {!reduceMotion && (
                        <>
                            <motion.div aria-hidden className='pointer-events-none absolute inset-x-0 z-0 h-px' style={{ top: mouseY, opacity: reticleOpacity, background: `linear-gradient( 90deg, transparent, rgba(${GOLD}, 0.9), transparent)` }} />
                            <motion.div aria-hidden className='pointer-events-none absolute inset-y-0 z-0 w-px' style={{ left: mouseX, opacity: reticleOpacity, background: `linear-gradient( 180deg, transparent, rgba(${GOLD}, 0.9), transparent )` }} />

                            <motion.div aria-hidden className='pointer-events-none absolute z-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full' style={{ left: mouseX, top: mouseY, opacity: dotOpacity, background: `rgba(${GOLD}, 1)`, boxShadow: `0 0 10px rgba(${GOLD}, 0.8)` }} />
                        </>
                    )}

                    <div className='relative z-10 flex h-full flex-col'>
                        <div className='flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800/80' style={{ transform: 'translateZ(20px)' }}>
                            <motion.span
                                className='font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500'
                                initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.55, delay: delay + 0.12, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Priority area
                            </motion.span>

                            <motion.span
                                className='relative inline-flex items-center justify-center font-mono text-[11px] font-medium tracking-[0.25em] text-zinc-700 dark:text-zinc-300'
                                initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: delay + 0.22, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {!reduceMotion && <motion.span aria-hidden className='absolute -inset-2.5 rounded-full border' style={{ borderColor: `rgba(${GOLD}, 0.5)`, opacity: hoverOpacity, scale: cornerScale }} />}

                                {improvement.number}
                            </motion.span>
                        </div>

                        <motion.h2 className='mt-7 text-[clamp(1.25rem,2vw,1.5rem)] font-light leading-tight tracking-tight text-zinc-900 dark:text-zinc-100' style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif', transform: 'translateZ(30px)' }}>
                            <AnimatedWords text={improvement.title} delay={delay + 0.38} reduceMotion={reduceMotion} />
                        </motion.h2>

                        <motion.div className='mt-5 grow' style={{ transform: 'translateZ(20px)' }} initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: delay + 0.58 }}>
                            <motion.div className='mb-3 flex items-center gap-2' initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: delay + 0.62, ease: [0.22, 1, 0.36, 1] }}>
                                <span className='h-px w-4 bg-zinc-300 dark:bg-zinc-700' />
                            </motion.div>
                            <p className='line-clamp-5 text-[0.82rem] leading-[1.75] text-zinc-600 dark:text-zinc-400'>
                                <AnimatedWords text={improvement.description} delay={delay + 0.68} reduceMotion={reduceMotion} />
                            </p>
                        </motion.div>

                        {improvement.action && (
                            <motion.div
                                className='relative mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-5 backdrop-blur-sm dark:border-zinc-800/70 dark:bg-zinc-900/25'
                                style={{ transform: 'translateZ(35px)' }}
                                initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.65, delay: delay + 1.0, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {!reduceMotion && (
                                    <motion.div aria-hidden className='absolute bottom-0 left-0 top-0 w-px bg-zinc-400 dark:bg-zinc-400' initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 0.7 }} transition={{ duration: 0.55, delay: delay + 1.08, ease: [0.76, 0, 0.24, 1] }} />
                                )}

                                {!reduceMotion && <motion.div aria-hidden className='pointer-events-none absolute inset-0 rounded-lg border' style={{ borderColor: `rgba(${GOLD}, 0.5)`, opacity: actionBorderOpacity }} />}
                                <motion.p
                                    className='mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500'
                                    initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.45, delay: delay + 1.12 }}
                                >
                                    <span>Suggested action</span>

                                    {!reduceMotion && (
                                        <motion.span aria-hidden style={{ opacity: hoverOpacity, x: actionArrowX, color: `rgba(${GOLD}, 1)` }} className='text-[11px]'>
                                            →
                                        </motion.span>
                                    )}
                                </motion.p>

                                <p className='text-[0.75rem] font-medium leading-relaxed text-zinc-800 dark:text-zinc-200'>
                                    <AnimatedWords text={improvement.action} delay={delay + 1.18} reduceMotion={reduceMotion} />
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {!reduceMotion && (
                        <div className='pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-3xl'>
                            <motion.div className='absolute inset-0 bg-white dark:bg-[#030303]' style={{ transformOrigin: 'right center' }} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 0.85, delay: revealDelay, ease: [0.76, 0, 0.24, 1] }} />

                            <motion.div
                                className='absolute inset-y-0 w-1/4 skew-x-[-18deg] bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/10'
                                initial={{ x: '-160%' }}
                                animate={{ x: '360%' }}
                                transition={{ duration: 1, delay: revealDelay + 0.1, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const AmbientBackground = ({ reduceMotion }: { reduceMotion: boolean | null }) => (
    <div aria-hidden className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
        <div className='absolute inset-0 opacity-[0.025] dark:opacity-[0.025]' style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

        <div className='absolute inset-0 opacity-0 dark:opacity-[0.025]' style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

        <motion.div
            className='absolute -left-40 top-1/4 h-130 w-130 rounded-full blur-[130px]'
            style={{ background: `radial-gradient(circle, rgba(${GOLD}, 0.12), transparent 70%)` }}
            animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
            transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
            className='absolute -right-40 bottom-0 h-140 w-140 rounded-full blur-[140px]'
            style={{ background: 'radial-gradient(circle, rgba(120, 135, 170, 0.09), transparent 70%)' }}
            animate={reduceMotion ? undefined : { x: [0, -30, 0], y: [0, -25, 0] }}
            transition={reduceMotion ? undefined : { duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
    </div>
);

export default function Story6() {
    const { analysisResult } = useStory();
    const reduceMotion = useReducedMotion();
    const data = analysisResult?.data?.data as Record<string, any> | undefined;
    const resumeFixes: ResumeFix[] = Array.isArray(data?.resume_fixes) ? data.resume_fixes : [];
    const missingSkills: MissingSkill[] = Array.isArray(data?.skills?.missing) ? data.skills.missing : [];
    const actionPlan: ActionPlanItem[] = Array.isArray(data?.action_plan) ? data.action_plan : [];
    const backendBlocker = clean(data?.candidate?.biggest_blocker);

    const backendSkills = unique(missingSkills.filter((item) => matches(item.skill, ['node', 'express', 'rest', 'api', 'mongo'])).map((item) => clean(item.skill))).slice(0, 4);
    const backendAction = actionPlan.find((item) => matches(item.action, ['node.js/express/mongodb', 'node', 'express', 'mongodb']));
    const projectsFix = resumeFixes.find((item) => matches(item.section, ['projects']));
    const productionActions = actionPlan.filter((item) => matches(item.action, ['docker', 'open-source', 'open source', 'production', 'github actions']));
    const productionSkills = unique(missingSkills.filter((item) => matches(item.skill, ['git/github actions', 'github actions', 'docker', 'testing'])).map((item) => clean(item.skill))).slice(0, 4);

    const backendDescription = backendBlocker
        ? backendSkills.length > 0
            ? `${backendBlocker}, particularly around ${formatList(backendSkills)}.`
            : `${backendBlocker}.`
        : 'Backend depth is the clearest gap holding this resume back — real project experience with server-side technologies is what separates a frontend portfolio from a full-stack one.';

    const projectsDescription = clean(projectsFix?.fix) ? `${clean(projectsFix?.fix)}${projectsFix?.why ? ` — ${decapitalize(clean(projectsFix.why))}.` : '.'}` : 'Projects need clearer, more specific write-ups that show real technical ownership and impact.';

    const productionDescription = backendBlocker
        ? `${backendBlocker}${productionSkills.length > 0 ? `, with ${formatList(productionSkills)} still missing from the skill set` : ''}. The plan from here is to ${
              productionActions[0] ? decapitalize(clean(productionActions[0].action)) : 'build a Dockerized full-stack app (React + Node + Mongo)'
          }${productionActions[1] ? ` and ${decapitalize(clean(productionActions[1].action))}` : ''}.`
        : 'Production exposure — deploying, containerizing, and shipping real software — is the missing piece between building projects and being job-ready.';

    const improvements: Improvement[] = [
        {
            number: '01',
            title: 'Backend depth',
            description: backendDescription,
            action: clean(backendAction?.action) || 'Add Node.js/Express/MongoDB projects to GitHub',
        },
        {
            number: '02',
            title: 'Project impact',
            description: projectsDescription,
            action: clean(projectsFix?.fix) || 'Add 1–2 sentences per project on tech stack and impact',
        },
        {
            number: '03',
            title: 'Production exposure',
            description: productionDescription,
            action: clean(productionActions[0]?.action) || 'Build a Dockerized full-stack app (React + Node + Mongo)',
        },
    ];

    if (!data) {
        return (
            <section className='relative left-[calc(50%-50vw)] flex h-screen w-screen items-center justify-center overflow-hidden bg-white px-6 text-zinc-900 dark:bg-black dark:text-white'>
                <span className='font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-600'>No improvement priorities detected</span>
            </section>
        );
    }

    const headingText = 'What to improve next'.split(' ');

    return (
        <section className='relative left-[calc(50%-50vw)] h-screen w-screen overflow-hidden bg-white text-zinc-900 dark:bg-black dark:text-white'>
            <AmbientBackground reduceMotion={reduceMotion} />
            <div className='relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-6 sm:px-10 lg:px-16'>
                <div className='flex flex-col items-center text-center'>
                    <motion.div className='mb-2 overflow-hidden' initial={{ opacity: 1 }}>
                        <motion.p
                            className='font-mono text-[10px] font-medium uppercase tracking-[0.45em] text-zinc-500'
                            initial={reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: '100%', filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        >
                            Top improvements
                        </motion.p>
                    </motion.div>

                    <h1 className='flex flex-wrap justify-center gap-[0.25em] text-center text-[clamp(2.5rem,5.5vw,4.8rem)] font-light leading-[1.1] tracking-[-0.045em] text-zinc-900 dark:text-white' style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}>
                        {headingText.map((word, i) => (
                            <span key={`${word}-${i}`} className='overflow-hidden pb-2 pt-1'>
                                <motion.span
                                    className='inline-block'
                                    initial={reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: '110%', filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {word}
                                </motion.span>
                            </span>
                        ))}
                    </h1>

                    <motion.p
                        className='mt-4 max-w-lg text-center text-[0.85rem] leading-relaxed text-zinc-500 dark:text-zinc-400'
                        initial={reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 15, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Three areas that can make the biggest difference to your resume
                    </motion.p>
                </div>

                <div className='mt-15 grid w-full grid-cols-1 gap-6 md:grid-cols-3 xl:gap-8 perspective-[1000px]'>
                    {improvements.map((improvement, index) => (
                        <PremiumCard key={improvement.number} improvement={improvement} index={index} reduceMotion={reduceMotion} />
                    ))}
                </div>
            </div>
        </section>
    );
}