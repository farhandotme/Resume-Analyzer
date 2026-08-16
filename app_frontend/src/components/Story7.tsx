'use client';

import { AnimatePresence, motion, animate } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useStory } from './StoryContext';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { useTheme } from '../hooks/useTheme';
import ReportDocument from './ReportDocument';
import { ChevronDown, FileImage, FileText } from 'lucide-react';

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
    white: 'bg-zinc-300 dark:bg-zinc-700',
    mist: 'bg-zinc-200 dark:bg-zinc-800',
    sky: 'bg-blue-100 dark:bg-blue-900/60',
    mint: 'bg-emerald-100 dark:bg-emerald-900/60',
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

    return (
        <>
            {(['left', 'right'] as const).map((side) => (
                <div
                    key={side}
                    aria-hidden='true'
                    className={`pointer-events-none absolute top-0 h-full w-[24vw] overflow-hidden ${side === 'left' ? 'left-0' : 'right-0'}`}
                    style={{
                        zIndex: 5,
                        maskImage: side === 'left' ? 'linear-gradient(to right, black 0%, black 72%, transparent 100%)' : 'linear-gradient(to left, black 0%, black 72%, transparent 100%)',
                        WebkitMaskImage: side === 'left' ? 'linear-gradient(to right, black 0%, black 72%, transparent 100%)' : 'linear-gradient(to left, black 0%, black 72%, transparent 100%)',
                    }}
                >
                    {pieces
                        .filter((piece) => piece.side === side)
                        .map((piece) => {
                            const driftPx = side === 'left' ? piece.drift : -piece.drift;

                            return (
                                <motion.span
                                    key={piece.id}
                                    className={`absolute rounded-xs ${TONE_CLASS[piece.tone]}`}
                                    style={{ left: `${piece.leftPct}%`, width: piece.size, height: piece.size * 2.4, top: -24, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
                                    initial={{ opacity: 0, y: -24, x: 0, rotate: piece.rotateStart }}
                                    animate={active ? { opacity: [0, 1, 1, 0], y: piece.fall, x: driftPx, rotate: piece.rotateEnd } : { opacity: 0, y: -24, x: 0, rotate: piece.rotateStart }}
                                    transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeIn', times: [0, 0.12, 0.7, 1], ...(mode === 'infinite' ? { repeat: Infinity, repeatDelay: piece.repeatDelay } : {}) }}
                                />
                            );
                        })}
                </div>
            ))}
        </>
    );
};

export default function Story7() {
    const { analysisResult } = useStory();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const data = analysisResult?.data?.data;
    const targetScore = Number(data?.hero?.ats_score ?? 0);
    const verdict = data?.hero?.verdict ?? 'Needs Work';
    const strongestAsset = data?.candidate?.strongest_asset;
    const scoreBreakdown = data?.score_breakdown ?? [];
    const matchedSkills = data?.skills?.matched ?? [];

    const strengths = useMemo(() => {
        const result: string[] = [];

        if (strongestAsset) {
            result.push(strongestAsset);
        }

        scoreBreakdown
            .filter((breakdownItem: { label: string; score: number; out_of: number }) => breakdownItem.score > 0)
            .sort(
                (
                    a: {
                        label: string;
                        score: number;
                        out_of: number;
                    },
                    b: {
                        label: string;
                        score: number;
                        out_of: number;
                    },
                ) => b.score / b.out_of - a.score / a.out_of,
            )
            .forEach((breakdownItem: { label: string; score: number; out_of: number; reason: string }) => {
                if (result.length < 4 && !result.some((existingStrength) => existingStrength.toLowerCase().includes(breakdownItem.label.toLowerCase()))) {
                    result.push(`${breakdownItem.label}: ${breakdownItem.reason}`);
                }
            });

        matchedSkills.forEach((skillItem: string | { skill: string }) => {
            if (result.length >= 4) {
                return;
            }

            const skill = typeof skillItem === 'string' ? skillItem : skillItem.skill;

            if (skill) {
                result.push(`Matched skill: ${skill}`);
            }
        });

        return result.slice(0, 4);
    }, [strongestAsset, scoreBreakdown, matchedSkills]);

    const finalStrengths = strengths.length > 0 ? strengths : ['Analysis completed successfully'];

    const [score, setScore] = useState(0);
    const [bounce, setBounce] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    const handleDownloadPDF = async () => {
        flushSync(() => {
            setIsDownloading(true);
        });

        const report = document.getElementById('resume-report');

        if (!report) {
            console.error('Report document not found');
            setIsDownloading(false);
            return;
        }

        try {
            await document.fonts.ready;

            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        resolve();
                    });
                });
            });

            const canvas = await html2canvas(report, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: report.scrollWidth,
                height: report.scrollHeight,
                windowWidth: report.scrollWidth,
                windowHeight: report.scrollHeight,
            });

            const imageData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            pdf.addImage(imageData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
            const name = data?.hero?.name?.trim().replace(/\s+/g, '-') || 'resume-analysis';
            pdf.save(`${name}-resume-analysis.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadImage = async () => {
        flushSync(() => {
            setIsDownloading(true);
        });

        const report = document.getElementById('resume-report');

        if (!report) {
            console.error('Report document not found');
            setIsDownloading(false);
            return;
        }

        try {
            await document.fonts.ready;

            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        resolve();
                    });
                });
            });

            const canvas = await html2canvas(report, {
                scale: 3,
                useCORS: true,
                backgroundColor: theme === 'dark' ? '#030303' : '#ffffff',
                logging: false,
                width: report.scrollWidth,
                height: report.scrollHeight,
                windowWidth: report.scrollWidth,
                windowHeight: report.scrollHeight,
            });

            const imageData = canvas.toDataURL('image/jpeg', 0.95);

            const link = document.createElement('a');
            const name = data?.hero?.name?.trim().replace(/\s+/g, '-') || 'resume-analysis';

            link.href = imageData;
            link.download = `${name}-resume-analysis.jpg`;
            link.click();
        } catch (error) {
            console.error('Failed to generate image:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAnalyzeAgain = () => {
        navigate('/');
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setHasStarted(true);
        }, 50);

        return () => {
            window.clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!hasStarted) {
            return;
        }

        const timer = window.setTimeout(() => {
            setShowConfetti(true);
        }, 750);

        return () => {
            window.clearTimeout(timer);
        };
    }, [hasStarted]);

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

    useEffect(() => {
        if (!hasStarted) {
            return;
        }

        setScore(0);
        setBounce(false);

        const controls = animate(0, targetScore, {
            duration: 1.1,
            delay: 0.9,
            ease: EASE,

            onUpdate(value) {
                setScore(Math.round(value));
            },

            onComplete() {
                setBounce(true);
            },
        });

        return () => {
            controls.stop();
        };
    }, [hasStarted, targetScore]);

    return (
        <section className='fixed inset-0 flex h-dvh w-screen items-center justify-center overflow-hidden overscroll-none bg-white transition-colors duration-300 dark:bg-black'>
            <div className='pointer-events-none fixed left-[-10000px] top-0' aria-hidden='true'>
                <ReportDocument analysisResult={analysisResult} theme={theme} />
            </div>

            <div className='pointer-events-none absolute inset-0' style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,.03), transparent 70%)' }} />

            <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 dark:opacity-100' style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,.025), transparent 70%)' }} />

            <motion.div
                aria-hidden='true'
                className='pointer-events-none absolute h-130 w-130 rounded-full blur-3xl'
                style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0.85, 0.5] }}
                transition={{ opacity: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
            />

            <div className='pointer-events-none absolute h-130 w-130 rounded-full opacity-0 blur-3xl transition-opacity duration-300 dark:opacity-100' style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)' }} />

            <ConfettiField active={showConfetti} />

            <div className='relative z-20 w-full max-w-xl px-6'>
                <motion.div
                    initial={{ opacity: 0, y: 46, scale: 0.95 }}
                    animate={hasStarted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 46, scale: 0.95 }}
                    transition={{ duration: 0.75, ease: EASE }}
                    className='relative overflow-visible rounded-4xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,.07)] transition-colors duration-300 dark:border-white/8 dark:bg-zinc-950 dark:shadow-[0_30px_80px_rgba(0,0,0,.5)]'
                    style={{ padding: 'clamp(1.5rem,3vh,2.25rem) clamp(1.25rem,3vw,2.5rem)' }}
                >
                    <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-4xl'>
                        <motion.div
                            aria-hidden='true'
                            className='absolute inset-y-0 w-[45%] dark:opacity-60'
                            style={{
                                background: theme === 'dark' ? 'linear-gradient(75deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 100%)' : 'linear-gradient(75deg, transparent 0%, rgba(0,0,0,0.035) 45%, transparent 100%)',
                            }}
                            initial={{ left: '-55%' }}
                            animate={hasStarted ? { left: '110%' } : { left: '-55%' }}
                            transition={{ duration: 0.6, delay: 3.8, ease: 'easeInOut' }}
                        />
                    </div>

                    {(['left', 'right'] as const).map((corner) => (
                        <motion.span
                            key={corner}
                            aria-hidden='true'
                            className={`pointer-events-none absolute top-6 h-6 w-6 ${corner === 'left' ? 'left-6' : 'right-6'}`}
                            style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.10) 0%, transparent 70%)' }}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={hasStarted ? { opacity: [0, 1, 0], scale: [0.4, 1.3, 1.6] } : { opacity: 0, scale: 0.4 }}
                            transition={{ duration: 0.9, delay: 1.0, ease: 'easeOut' }}
                        />
                    ))}

                    <div className='text-center'>
                        <p className='text-[12px] uppercase tracking-[0.4em] text-zinc-500'>Final Report</p>

                        <h1 className='mt-2 font-semibold tracking-[-0.06em] text-zinc-900 dark:text-white' style={{ fontSize: 'clamp(2rem, 4.2vh, 2.75rem)', fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}>
                            Resume Ready
                        </h1>
                    </div>

                    <div className='mt-[clamp(1.25rem,2.5vh,1.75rem)] text-center'>
                        <p className='text-[13px] uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500'>ATS Score</p>

                        <motion.div className='mt-2 leading-none tracking-[-0.07em] text-zinc-900 dark:text-white' style={{ fontSize: 'clamp(4.5rem, 11vh, 6.75rem)', fontWeight: 600 }} animate={bounce ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.5, ease: EASE }}>
                            {score}
                        </motion.div>
                    </div>

                    <div className='mt-[clamp(1.25rem,2.8vh,2rem)] flex justify-center'>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={hasStarted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }} transition={{ delay: 2.0, duration: 0.45, ease: EASE }} className='rounded-full bg-zinc-100 px-5 py-2.5 dark:bg-white/6'>
                            <span className='text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-700 dark:text-zinc-300'>{verdict}</span>
                        </motion.div>
                    </div>

                    <div className='mt-[clamp(2.25rem,2.5vh,1.75rem)] grid grid-cols-2 justify-items-center gap-x-5 gap-y-3.5'>
                        {finalStrengths.map((item, index) => (
                            <motion.div key={`${item}-${index}`} initial={{ opacity: 0, x: -14 }} animate={hasStarted ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }} transition={{ delay: 2.5 + index * 0.15, duration: 0.4, ease: EASE }} className='flex items-center justify-start gap-2.5 text-left'>
                                <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] text-white dark:bg-white dark:text-black'>✓</div>

                                <p className='text-[14px] leading-[1.4] text-zinc-700 dark:text-zinc-300'>{item}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className='mt-[clamp(3.25rem,2.5vh,1.75rem)] flex justify-center gap-3'>
                        <div className='relative'>
                            <motion.button
                                type='button'
                                disabled={isDownloading}
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                    event.stopPropagation();

                                    if (!isDownloading) {
                                        setShowDownloadOptions((current) => !current);
                                    }
                                }}
                                initial={{ opacity: 0, y: 12 }}
                                animate={hasStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                transition={{ delay: 4.3, duration: 0.45, ease: EASE }}
                                whileHover={isDownloading ? {} : { y: -2 }}
                                whileTap={isDownloading ? {} : { scale: 0.97 }}
                                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                            >
                                <span>{isDownloading ? 'Preparing...' : 'Download Report'}</span>

                                {!isDownloading && <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDownloadOptions ? 'rotate-180' : ''}`} />}
                            </motion.button>

                            <AnimatePresence>
                                {showDownloadOptions && !isDownloading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                        transition={{ duration: 0.2, ease: EASE }}
                                        className='absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40'
                                    >
                                        <button
                                            type='button'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setShowDownloadOptions(false);
                                                handleDownloadPDF();
                                            }}
                                            className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
                                        >
                                            <FileText className='h-4 w-4 text-zinc-400 dark:text-zinc-500' />

                                            <span>Download PDF</span>
                                        </button>

                                        <button
                                            type='button'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setShowDownloadOptions(false);
                                                handleDownloadImage();
                                            }}
                                            className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
                                        >
                                            <FileImage className='h-4 w-4 text-zinc-400 dark:text-zinc-500' />

                                            <span>Download Image</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            type='button'
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleAnalyzeAgain();
                            }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={hasStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                            transition={{ delay: 4.45, duration: 0.45, ease: EASE }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className='cursor-pointer rounded-full border border-zinc-300 px-7 py-3.5 text-[14px] font-medium text-zinc-900 transition-colors duration-300 dark:border-white/[0.14] dark:text-white'
                        >
                            Analyze Again
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
