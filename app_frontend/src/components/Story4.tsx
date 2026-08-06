'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Story4Props = {};

type Improvement = {
    title: string;
    description: string;
};

const improvements: Improvement[] = [
    {
        title: 'Summary',
        description: "Your summary doesn't explain what you've actually built. Mention your strongest technologies, measurable impact and the exact role you're targeting.",
    },
    {
        title: 'Projects',
        description: 'Your projects look good but they lack measurable impact. Add users, response time, scaling metrics and business results recruiters can instantly trust.',
    },
    {
        title: 'Skills',
        description: 'Separate Technical Skills from DevOps and include Docker, Kubernetes, REST APIs and CI/CD to significantly improve ATS matching.',
    },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const Story4 = ({}: Story4Props) => {
    const [visibleColumns, setVisibleColumns] = useState(0);

    useEffect(() => {
        const timers = [setTimeout(() => setVisibleColumns(1), 700), setTimeout(() => setVisibleColumns(2), 1250), setTimeout(() => setVisibleColumns(3), 1800)];

        return () => timers.forEach(clearTimeout);
    }, []);

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

                <div className='grid grid-cols-3 gap-20'>
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
                                    className='pointer-events-none absolute -top-14 -left-2 text-[170px] font-semibold leading-none tracking-[-0.08em] text-black'
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
                                    className='relative z-10 mt-22 text-[18px] tracking-wide leading-7 text-zinc-600'
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