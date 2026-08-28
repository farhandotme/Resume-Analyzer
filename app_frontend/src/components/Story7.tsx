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
import { CheckCircle2, ChevronDown, Download, FileImage, FileText, RotateCcw } from 'lucide-react';

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

const NEUTRAL_ACCENT = 'text-zinc-700 border-zinc-300 bg-zinc-100 dark:text-zinc-200 dark:border-white/15 dark:bg-white/5';

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

    const glow = theme === 'dark' ? 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,0,0,0.07) 0%, transparent 70%)';

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
        sessionStorage.removeItem('story-current');
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
        <section className='fixed inset-0 flex h-dvh w-full items-center justify-center overflow-x-hidden overflow-y-auto overscroll-y-contain bg-white px-3 py-4 transition-colors duration-300 scrollbar-none dark:bg-black sm:px-6 sm:py-6 [&::-webkit-scrollbar]:hidden'>
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

            <div className='relative z-20 my-auto w-full max-w-lg py-2 max-[649.9px]:translate-y-4'>
                <motion.div
                    initial={{ opacity: 0, y: 46, scale: 0.95 }}
                    animate={hasStarted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 46, scale: 0.95 }}
                    transition={{ duration: 0.75, ease: EASE }}
                    className='relative overflow-visible rounded-3xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,.07)] transition-colors duration-300 sm:rounded-4xl dark:border-white/8 dark:bg-zinc-950 dark:shadow-[0_30px_80px_rgba(0,0,0,.5)]'
                    style={{ padding: 'clamp(0.75rem, 1.6vh, 1.25rem) clamp(0.7rem, 2.2vw, 1.5rem)' }}
                >
                    <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-3xl sm:rounded-4xl'>
                        <motion.div
                            aria-hidden='true'
                            className='absolute inset-y-0 w-[45%] dark:opacity-60'
                            style={{ background: theme === 'dark' ? 'linear-gradient(75deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 100%)' : 'linear-gradient(75deg, transparent 0%, rgba(0,0,0,0.035) 45%, transparent 100%)' }}
                            initial={{ left: '-55%' }}
                            animate={hasStarted ? { left: '110%' } : { left: '-55%' }}
                            transition={{ duration: 0.6, delay: 3.8, ease: 'easeInOut' }}
                        />
                    </div>

                    <h1 className='text-center font-semibold tracking-[-0.06em] text-zinc-900 dark:text-white' style={{ fontSize: 'clamp(1.6rem, 3.6vh, 2.5rem)', fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}>
                        Resume Ready
                    </h1>

                    <div className='mt-[clamp(0.75rem,1.8vh,1.5rem)] text-center'>
                        <p className='text-[11px] uppercase tracking-[0.3em] text-zinc-400 sm:text-[13px] sm:tracking-[0.35em] dark:text-zinc-500'>ATS Score</p>

                        <div className='relative mx-auto h-32 max-[649.9px]:h-28' style={{ width: 'clamp(9rem, 21vh, 12.5rem)' }}>
                            <div className='absolute inset-0 rounded-full blur-2xl transition-opacity duration-700' style={{ background: glow, opacity: hasStarted ? 1 : 0 }} aria-hidden='true' />

                            <div className='absolute inset-0 flex flex-col items-center justify-center'>
                                <motion.div className='leading-none tracking-tighter text-zinc-900 dark:text-white text-[6rem] max-[649.9px]:text-[5rem]' animate={bounce ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.5, ease: EASE }}>
                                    {score}
                                </motion.div>

                                <span className='mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 sm:text-[11px]'>out of 100</span>
                            </div>
                        </div>
                    </div>

                    <div className='mt-[clamp(0.9rem,1.8vh,1.5rem)] flex items-center justify-center'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={hasStarted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ delay: 2.0, duration: 0.45, ease: EASE }}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 ${NEUTRAL_ACCENT}`}
                        >
                            <CheckCircle2 className='h-3.5 w-3.5' />
                            <span className='text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-[12px] sm:tracking-[0.16em]'>{verdict}</span>
                        </motion.div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={hasStarted ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 2.2, duration: 0.4, ease: EASE }}
                        className='mt-[clamp(1.1rem,2.2vh,1.75rem)] text-center text-[10px] uppercase tracking-[0.3em] text-zinc-400 sm:text-[11px] dark:text-zinc-600'
                    >
                        Key Strengths
                    </motion.p>

                    <div className='mt-[clamp(0.65rem,1.3vh,1.1rem)] grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 min-[480px]:gap-2.5'>
                        {finalStrengths.map((item, index) => (
                            <motion.div
                                key={`${item}-${index}`}
                                initial={{ opacity: 0, x: -14 }}
                                animate={hasStarted ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
                                transition={{ delay: 2.4 + index * 0.15, duration: 0.4, ease: EASE }}
                                className={`flex items-center min-[480px]:items-center justify-start gap-2 rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5 text-left sm:px-3.5 sm:py-3 dark:border-white/5 dark:bg-white/3 ${index >= 2 ? '[@media(max-height:720px)]:hidden' : ''}`}
                            >
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border min-[480px]:mt-0 sm:h-6 sm:w-6 ${NEUTRAL_ACCENT}`}>
                                    <CheckCircle2 className='h-3 w-3 sm:h-3.5 sm:w-3.5' strokeWidth={2.25} />
                                </div>

                                <p className='text-[11.5px] leading-[1.35] text-zinc-700 min-[550px]:text-[13.5px] min-[550px]:leading-[1.45] dark:text-zinc-300'>{item}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className='mt-[clamp(1.25rem,2.2vh,2rem)] flex flex-col min-[450px]:flex-row items-center justify-center gap-2.5 sm:gap-3'>
                        <div className='relative w-full min-[450px]:w-auto'>
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
                                transition={{ delay: 4.4, duration: 0.45, ease: EASE }}
                                whileHover={isDownloading ? {} : { y: -2 }}
                                whileTap={isDownloading ? {} : { scale: 0.97 }}
                                className='inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-[13px] font-medium text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)] transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:px-7 sm:py-3.5 sm:text-[14px] dark:bg-white dark:text-black dark:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)] dark:hover:bg-zinc-200'
                            >
                                {!isDownloading && <Download className='h-4 w-4' />}
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
                                        className='absolute left-1/2 top-full z-30 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40'
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
                            transition={{ delay: 4.55, duration: 0.45, ease: EASE }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className='inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-[13px] font-medium text-zinc-900 transition-colors duration-200 hover:bg-zinc-50 min-[450px]:w-auto sm:px-7 sm:py-3.5 sm:text-[14px] dark:border-white/[0.14] dark:text-white dark:hover:bg-white/5'
                        >
                            <RotateCcw className='h-3.5 w-3.5' />
                            <span>Analyze Again</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
