'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useStory } from './StoryContext';

type RoadmapItem = {
    id: string;
    action: string;
    priority: 'High' | 'Medium';
};

type RoadmapSection = {
    title: string;
    items: RoadmapItem[];
};

const EASE = [0.16, 1, 0.3, 1] as const;

const Story5 = () => {
    const { analysisResult } = useStory();

    const roadmap: RoadmapSection[] = useMemo(() => {
        const actionPlan = analysisResult?.data?.data?.action_plan ?? [];

        const grouped = actionPlan.reduce(
            (
                groups: Record<string, RoadmapSection>,
                item: {
                    timeline: string;
                    action: string;
                    impact: string;
                },
            ) => {
                const timeline = item.timeline;

                if (!groups[timeline]) {
                    groups[timeline] = {
                        title: timeline,
                        items: [],
                    };
                }

                groups[timeline].items.push({
                    id: String(groups[timeline].items.length + 1).padStart(2, '0'),
                    action: item.action,
                    priority: item.impact === 'High' ? 'High' : 'Medium',
                });

                return groups;
            },
            {},
        );

        return Object.values(grouped);
    }, [analysisResult]);

    const [activeIndex, setActiveIndex] = useState(0);

    const durations = useMemo(() => roadmap.map((section) => 1500 + section.items.length * 1400), [roadmap]);

    const maxItems = useMemo(() => Math.max(...roadmap.map((section) => section.items.length), 0), [roadmap]);

    useEffect(() => {
        setActiveIndex(0);

        if (roadmap.length <= 1) {
            return;
        }

        let elapsed = 500;

        const timers = roadmap.slice(1).map((_, i) => {
            elapsed += durations[i];

            return window.setTimeout(() => {
                setActiveIndex(i + 1);
            }, elapsed);
        });

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [roadmap, durations]);

    if (roadmap.length === 0) {
        return null;
    }

    const section = roadmap[activeIndex];

    return (
        <section className='relative flex h-screen w-full flex-col items-center overflow-hidden bg-white'>
            <div
                className='pointer-events-none absolute inset-0'
                style={{
                    background: 'radial-gradient(circle at center, rgba(0,0,0,.03), transparent 70%)',
                }}
            />

            <div className='relative z-10 w-full max-w-2xl px-8 pt-[20vh] text-center'>
                <motion.p
                    initial={{
                        opacity: 0,
                        y: -8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.5,
                        ease: EASE,
                    }}
                    className='text-[13px] font-medium uppercase tracking-[0.4em] text-zinc-500'
                >
                    Your Roadmap
                </motion.p>

                <motion.h1
                    initial={{
                        opacity: 0,
                        y: -8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.1,
                        duration: 0.5,
                        ease: EASE,
                    }}
                    className='mt-3 text-[36px] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-[44px]'
                >
                    What To Do Next
                </motion.h1>

                <div className='mx-auto mt-7 mb-5 flex max-w-xs gap-2'>
                    {roadmap.map((_, i) => (
                        <div key={i} className='h-0.75 flex-1 overflow-hidden rounded-full bg-zinc-100'>
                            <motion.div
                                className='h-full rounded-full bg-zinc-900'
                                initial={{
                                    width: '0%',
                                }}
                                animate={{
                                    width: i <= activeIndex ? '100%' : '0%',
                                }}
                                transition={
                                    i === activeIndex
                                        ? {
                                              duration: durations[i] / 1000,
                                              ease: 'linear',
                                          }
                                        : {
                                              duration: 0.3,
                                          }
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className='relative z-10 mt-[5vh] h-[58vh] w-full max-w-2xl px-8'>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={section.title}
                        initial={{
                            opacity: 0,
                            y: 32,
                            filter: 'blur(8px)',
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                        }}
                        exit={{
                            opacity: 0,
                            y: -24,
                            filter: 'blur(8px)',
                        }}
                        transition={{
                            duration: 0.6,
                            ease: EASE,
                        }}
                        className='absolute inset-0'
                    >
                        <div className='flex items-baseline justify-between border-b border-zinc-100 pb-4'>
                            <h2 className='text-[15px] font-semibold uppercase tracking-[0.3em] text-zinc-900'>{section.title}</h2>

                            <span className='text-[12px] uppercase tracking-[0.25em] text-zinc-400'>
                                {section.items.length} {section.items.length > 1 ? 'actions' : 'action'}
                            </span>
                        </div>

                        <div
                            className='mt-2'
                            style={{
                                minHeight: `${maxItems * 118}px`,
                            }}
                        >
                            {section.items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{
                                        opacity: 0,
                                        x: -24,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{
                                        delay: 0.2 + index * 0.16,
                                        duration: 0.5,
                                        ease: EASE,
                                    }}
                                    className='flex items-start gap-6 border-b border-zinc-50 py-7'
                                >
                                    <span className='w-9 shrink-0 pt-1 font-mono text-[15px] text-zinc-300'>{item.id}</span>

                                    <p className='flex-1 text-[19px] font-normal leading-[1.55] tracking-[-0.01em] text-zinc-700'>{item.action}</p>

                                    <span className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${item.priority === 'High' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>{item.priority}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Story5;
