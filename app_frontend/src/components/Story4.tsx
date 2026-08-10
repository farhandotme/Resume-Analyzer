'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStory } from './StoryContext';

type Improvement = {
    title: string;
    description: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

const Story4 = () => {
    const { analysisResult } = useStory();

    const improvements: Improvement[] =
        analysisResult?.data?.data?.resume_fixes
            ?.filter((item: { priority: string; section: string; fix: string }) => item.priority === 'High')
            .slice(0, 3)
            .map((item: { priority: string; section: string; fix: string }) => ({
                title: item.section,
                description: item.fix,
            })) ?? [];

    const [visibleColumns, setVisibleColumns] = useState(0);

    useEffect(() => {
        setVisibleColumns(0);

        const timers = improvements.map((_, index) =>
            window.setTimeout(
                () => {
                    setVisibleColumns(index + 1);
                },
                700 + index * 550,
            ),
        );

        return () => timers.forEach(clearTimeout);
    }, [improvements.length]);

    const layoutClass = improvements.length === 1 ? 'flex justify-center' : improvements.length === 2 ? 'mx-auto grid max-w-4xl grid-cols-2 gap-20' : 'grid grid-cols-3 gap-20';

    return (
        <section className='relative flex h-screen items-center justify-center overflow-hidden bg-white'>
            <div
                className='pointer-events-none absolute inset-0'
                style={{
                    background: 'radial-gradient(circle at center, rgba(0,0,0,.035), transparent 70%)',
                }}
            />

            <div className='relative z-10 w-full max-w-7xl px-20'>
                <motion.div
                    initial={{
                        opacity: 0,
                        y: -20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: EASE,
                    }}
                    className='mb-24 text-center'
                >
                    <p className='text-[13px] uppercase tracking-[0.45em] text-zinc-500'>Top Improvements</p>
                </motion.div>

                <div className={layoutClass}>
                    {improvements.map((item, index) => {
                        const visible = visibleColumns > index;

                        return (
                            <motion.div
                                key={item.title}
                                initial={{
                                    opacity: 0,
                                    y: 40,
                                    filter: 'blur(10px)',
                                }}
                                animate={
                                    visible
                                        ? {
                                              opacity: 1,
                                              y: 0,
                                              filter: 'blur(0px)',
                                          }
                                        : {}
                                }
                                transition={{
                                    duration: 0.65,
                                    ease: EASE,
                                }}
                                className='relative flex flex-col'
                            >
                                <motion.span
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                    }}
                                    animate={
                                        visible
                                            ? {
                                                  opacity: 0.05,
                                                  scale: 1,
                                              }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.7,
                                        delay: 0.1,
                                    }}
                                    className='pointer-events-none absolute -top-12 -left-6 text-[145px] font-semibold leading-none tracking-[-0.14em] text-black'
                                >
                                    {`0${index + 1}`}
                                </motion.span>

                                <motion.h2
                                    initial={{
                                        opacity: 0,
                                        y: 18,
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
                                        delay: 0.2,
                                        duration: 0.45,
                                    }}
                                    className='relative z-10 text-[34px] font-medium tracking-[-0.04em] text-zinc-900'
                                >
                                    {item.title}
                                </motion.h2>

                                <motion.p
                                    initial={{
                                        opacity: 0,
                                        y: 16,
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
                                        delay: 0.45,
                                        duration: 0.55,
                                    }}
                                    className='relative z-10 mt-22 text-[18px] leading-7 tracking-wide text-zinc-600'
                                >
                                    {item.description}
                                </motion.p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Story4;