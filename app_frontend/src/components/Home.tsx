import { UploadCloud, CheckCircle2, FileText, Gauge, ChevronRight, SunMedium, Moon, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useTheme } from '../hooks/useTheme.ts';
import { uploadResume } from '../services/uploadResume.ts';
import TargetRoleSelector from './TargetRoleSelector';

const LENS_SIZE = 176;
const MAG_SCALE = 2.15;

const ANALYSIS_ANIMATION_DURATION = 12000;

type ResumeDocumentRefs = {
    nameRef?: React.RefObject<HTMLDivElement | null>;
    experienceBlockRef?: React.RefObject<HTMLDivElement | null>;
    experienceHeadingRef?: React.RefObject<HTMLDivElement | null>;
    projectsHeadingRef?: React.RefObject<HTMLDivElement | null>;
    educationHeadingRef?: React.RefObject<HTMLDivElement | null>;
    skillsHeadingRef?: React.RefObject<HTMLDivElement | null>;
};

function ResumeDocument({ refs }: { refs?: ResumeDocumentRefs }) {
    return (
        <>
            <div ref={refs?.nameRef} className='mb-5 w-fit space-y-1.5'>
                <div className='h-2 w-24 rounded-full bg-zinc-300 dark:bg-zinc-600' />
                <div className='h-1.5 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800' />
            </div>

            <div ref={refs?.experienceBlockRef} className='relative mb-5 rounded-md'>
                <div ref={refs?.experienceHeadingRef} className='mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Experience</span>
                </div>
                <div className='space-y-1.5'>
                    <div className='h-1.5 w-4/5 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-3/5 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                    <div className='h-1.5 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
                <div className='mt-3 space-y-1.5'>
                    <div className='h-1.5 w-3/5 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
            </div>

            <div className='relative mb-5 rounded-md'>
                <div ref={refs?.projectsHeadingRef} className='mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Projects</span>
                </div>
                <div className='space-y-1.5'>
                    <div className='h-1.5 w-3/4 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
                <div className='mt-3 space-y-1.5'>
                    <div className='h-1.5 w-2/3 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-2/5 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
            </div>

            <div className='relative mb-5 rounded-md'>
                <div ref={refs?.educationHeadingRef} className='mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Education</span>
                </div>
                <div className='space-y-1.5'>
                    <div className='h-1.5 w-3/5 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-2/5 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
            </div>

            <div className='relative rounded-md'>
                <div ref={refs?.skillsHeadingRef} className='mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Skills</span>
                </div>
                <div className='flex flex-wrap gap-1.5'>
                    {['Strategy', 'Analytics', 'Leadership', 'Automation', 'Design', 'Research'].map((skill) => (
                        <span key={skill} className='rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[8px] font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500'>
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}

export default function Home() {
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showFileError, setShowFileError] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const fileErrorTimeoutRef = useRef<number | null>(null);
    const dragCounterRef = useRef(0);
    const [targetRole, setTargetRole] = useState('');
    const [isRoleSelected, setIsRoleSelected] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [headlineIndex, setHeadlineIndex] = useState(0);
    const navigate = useNavigate();
    const prefersReducedMotion = Boolean(useReducedMotion());
    const overlayRef = useRef<HTMLDivElement>(null);

    const resumeViewportRef = useRef<HTMLDivElement>(null);
    const resumeStageRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const experienceBlockRef = useRef<HTMLDivElement>(null);
    const experienceHeadingRef = useRef<HTMLDivElement>(null);
    const projectsHeadingRef = useRef<HTMLDivElement>(null);
    const educationHeadingRef = useRef<HTMLDivElement>(null);
    const skillsHeadingRef = useRef<HTMLDivElement>(null);
    const animationCompleteRef = useRef(false);

    const lensRef = useRef<HTMLDivElement>(null);
    const lensCloneRef = useRef<HTMLDivElement>(null);
    const finishFlashRef = useRef<HTMLDivElement>(null);
    const calloutRef = useRef<HTMLDivElement>(null);

    const headlinePhrases = ['resume.', 'interviews.', 'career.'];
    const analysisSteps = ['Reading your resume', 'Understanding your experience', 'Matching your target role', 'Building your analysis'];

    const analysisMessages = [
        {
            title: 'Reading your resume',
            subtitle: 'Extracting your experience and skills',
        },
        {
            title: 'Understanding your experience',
            subtitle: 'Mapping your background and achievements',
        },
        {
            title: 'Matching your target role',
            subtitle: 'Comparing your profile with the role requirements',
        },
        {
            title: 'Building your analysis',
            subtitle: 'Turning everything into actionable insights',
        },
    ];

    useEffect(() => {
        if (!isAnalyzing) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };

        window.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isAnalyzing]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setHeadlineIndex((current) => (current + 1) % headlinePhrases.length);
        }, 3200);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        return () => {
            if (fileErrorTimeoutRef.current !== null) {
                window.clearTimeout(fileErrorTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isAnalyzing) return;
        if (analysisStep >= analysisSteps.length - 1) return;
        let delay = 3000;
        if (analysisStep === 0) delay = 3400;
        else if (analysisStep === 1) delay = 2200;
        else if (analysisStep === 2) delay = 6000;

        const timeoutId = window.setTimeout(() => {
            setAnalysisStep((current) => {
                if (current >= analysisSteps.length - 1) {
                    return current;
                }
                return current + 1;
            });
        }, delay);

        return () => window.clearTimeout(timeoutId);
    }, [isAnalyzing, analysisStep]);

    useEffect(() => {
        if (!isAnalyzing) {
            setElapsedSeconds(0);
            return;
        }

        const interval = window.setInterval(() => {
            setElapsedSeconds((current) => current + 1);
        }, 1000);

        return () => window.clearInterval(interval);
    }, [isAnalyzing]);

    useLayoutEffect(() => {
        if (!isAnalyzing || !overlayRef.current) return;

        const ctx = gsap.context(() => {
            const targets = ['[data-gsap="status"]', '[data-gsap="panel"]', '[data-gsap="role"]', '[data-gsap="footer"]'];

            if (prefersReducedMotion) {
                gsap.set(targets, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
                return;
            }

            gsap.set('[data-gsap="status"]', { opacity: 0, y: -15 });
            gsap.set('[data-gsap="panel"]', { opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' });
            gsap.set('[data-gsap="role"]', { opacity: 0, y: 15 });
            gsap.set('[data-gsap="footer"]', { opacity: 0, y: 15 });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.to('[data-gsap="status"]', { opacity: 1, y: 0, duration: 0.6 })
                .to('[data-gsap="panel"]', { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.3')
                .to('[data-gsap="role"]', { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
                .to('[data-gsap="footer"]', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
        }, overlayRef);

        return () => ctx.revert();
    }, [isAnalyzing, prefersReducedMotion]);

    useEffect(() => {
        if (!isAnalyzing) return;

        const viewport = resumeViewportRef.current;
        const lens = lensRef.current;
        const clone = lensCloneRef.current;
        const stage = resumeStageRef.current;
        if (!viewport || !lens || !clone || !stage) return;

        if (prefersReducedMotion) {
            gsap.set(lens, { opacity: 0 });
            gsap.set(stage, { scale: 1 });
            return;
        }

        gsap.set(clone, { transformOrigin: '0px 0px' });
        gsap.set(stage, { transformOrigin: '50% 50%' });

        const half = LENS_SIZE / 2;

        const moveLensTo = (el: HTMLElement | null, duration: number) => {
            const tl = gsap.timeline();
            if (!el) return tl;

            const viewportRect = viewport.getBoundingClientRect();
            const targetRect = el.getBoundingClientRect();

            const px = targetRect.left - viewportRect.left + targetRect.width / 2;
            const py = targetRect.top - viewportRect.top + targetRect.height / 2;

            const maxX = Math.max(viewportRect.width - half, half);
            const maxY = Math.max(viewportRect.height - half, half);
            const lensX = Math.min(Math.max(px, half), maxX);
            const lensY = Math.min(Math.max(py, half), maxY);

            const tx = half - MAG_SCALE * px;
            const ty = half - MAG_SCALE * py;

            tl.to(lens, { x: lensX - half, y: lensY - half, duration, ease: 'power3.inOut' }, 0);
            tl.to(clone, { x: tx, y: ty, scale: MAG_SCALE, duration, ease: 'power3.inOut' }, 0);
            return tl;
        };

        let loopTl: gsap.core.Timeline | null = null;
        let breatheTween: gsap.core.Tween | null = null;

        if (analysisStep === 0) {
            const viewportRect = viewport.getBoundingClientRect();

            const startX = viewportRect.width + half + 32;
            const startY = 160;

            gsap.set(lens, {
                x: startX - half,
                y: startY - half,
                opacity: 0,
                scale: 0.9,
            });
            gsap.set(clone, {
                x: half - MAG_SCALE * startX,
                y: half - MAG_SCALE * startY,
                scale: MAG_SCALE,
            });
            gsap.set(calloutRef.current, { opacity: 1 });

            loopTl = gsap.timeline();
            loopTl.to(lens, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, 0);
            loopTl.to(calloutRef.current, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, 3.1);
        } else if (analysisStep === 1) {
            loopTl = moveLensTo(experienceHeadingRef.current, 1.1);
        } else if (analysisStep === 2) {
            loopTl = gsap.timeline();

            loopTl.add(moveLensTo(projectsHeadingRef.current, 0.8)).to({}, { duration: 1.2 }).add(moveLensTo(educationHeadingRef.current, 0.8)).to({}, { duration: 1.2 }).add(moveLensTo(skillsHeadingRef.current, 0.8)).to({}, { duration: 1.2 });
        } else {
            loopTl = gsap.timeline();
            loopTl.to(lens, { opacity: 0, scale: 0.85, duration: 0.5, ease: 'power2.in' });
            breatheTween = gsap.to(stage, { scale: 1.015, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });
        }

        return () => {
            loopTl?.kill();
            breatheTween?.kill();
            gsap.killTweensOf([lens, clone, stage, calloutRef.current]);
        };
    }, [analysisStep, isAnalyzing, prefersReducedMotion]);

    useEffect(() => {
        if (!isComplete || prefersReducedMotion) return;

        const stage = resumeStageRef.current;
        const lens = lensRef.current;
        const flash = finishFlashRef.current;
        if (!stage || !flash) return;

        gsap.killTweensOf(stage);
        if (lens) gsap.to(lens, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        gsap.to(stage, { scale: 1.02, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 });
        gsap.fromTo(flash, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 });
    }, [isComplete, prefersReducedMotion]);

    const playCompletionAnimation = () => {
        return new Promise<void>((resolve) => {
            if (!overlayRef.current || prefersReducedMotion) {
                window.setTimeout(resolve, prefersReducedMotion ? 250 : 0);
                return;
            }

            const tl = gsap.timeline({ onComplete: resolve });
            tl.to('[data-gsap="panel"]', { scale: 1.04, duration: 0.25, ease: 'power2.out' }).to('[data-gsap="panel"]', { opacity: 0, scale: 0.95, filter: 'blur(8px)', duration: 0.4, ease: 'power2.in' }, '+=0.05').to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<');
        });
    };

    const handleFile = (file: File) => {
        if (file.type !== 'application/pdf') {
            setShowFileError(true);
            if (fileErrorTimeoutRef.current !== null) {
                window.clearTimeout(fileErrorTimeoutRef.current);
            }
            fileErrorTimeoutRef.current = window.setTimeout(() => {
                setShowFileError(false);
                fileErrorTimeoutRef.current = null;
            }, 3500);
            return;
        }

        setShowFileError(false);
        setAnalysisError('');
        if (fileErrorTimeoutRef.current !== null) {
            window.clearTimeout(fileErrorTimeoutRef.current);
            fileErrorTimeoutRef.current = null;
        }
        setSelectedFile(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        handleFile(file);
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (selectedFile || isAnalyzing) return;
        if (!event.dataTransfer.types.includes('Files')) return;

        dragCounterRef.current += 1;
        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (selectedFile || isAnalyzing) return;
        if (!event.dataTransfer.types.includes('Files')) return;

        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (selectedFile || isAnalyzing) return;
        if (!event.dataTransfer.types.includes('Files')) return;

        dragCounterRef.current -= 1;

        if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0;
            setIsDragging(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        dragCounterRef.current = 0;
        setIsDragging(false);

        if (selectedFile || isAnalyzing) return;

        const file = event.dataTransfer.files?.[0];

        if (!file) return;

        handleFile(file);
    };

    const handleAnalyze = async (roleOverride?: string) => {
        const trimmedRole = (roleOverride ?? targetRole).trim();

        if (!selectedFile || !isRoleSelected) return;

        setIsAnalyzing(true);
        setIsComplete(false);
        setAnalysisStep(0);
        setAnalysisError('');
        animationCompleteRef.current = false;

        const animationStartTime = Date.now();

        try {
            console.log('Uploading resume...');
            setAnalysisStep(0);

            const pdfUrl = await uploadResume(selectedFile);

            console.log('Resume uploaded successfully\nPDF URL:', pdfUrl);
            console.log('Starting resume analysis...');

            const response = await fetch('http://localhost:3000/resume/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pdfUrl,
                    jobTitle: trimmedRole,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData?.message || responseData?.error || responseData?.detail || 'Unable to analyze this resume');
            }

            const result = responseData;

            console.log('Resume analysis completed\nAnalysis result:', JSON.stringify(result, null, 2));

            const elapsedTime = Date.now() - animationStartTime;
            const remainingAnimationTime = Math.max(0, ANALYSIS_ANIMATION_DURATION - elapsedTime);

            if (remainingAnimationTime > 0) {
                console.log(`AI finished early. Waiting ${remainingAnimationTime}ms for animation.`);

                await new Promise<void>((resolve) => {
                    window.setTimeout(resolve, remainingAnimationTime);
                });
            }

            setAnalysisStep(analysisSteps.length - 1);
            setIsComplete(true);

            await playCompletionAnimation();

            navigate('/story', {
                state: {
                    analysisResult: result,
                },
            });
        } catch (error) {
            console.error('Resume analysis failed:', error);

            setIsComplete(false);
            setIsAnalyzing(false);

            const message = error instanceof Error ? error.message : 'Unable to analyze this resume';

            setSelectedFile(null);
            setTargetRole('');
            setIsRoleSelected(false);

            setAnalysisError(message);

            if (fileErrorTimeoutRef.current !== null) {
                window.clearTimeout(fileErrorTimeoutRef.current);
            }

            fileErrorTimeoutRef.current = window.setTimeout(() => {
                setAnalysisError('');
                fileErrorTimeoutRef.current = null;
            }, 4500);
        }
    };

    return (
        <div
            className='h-screen w-full overflow-hidden bg-white text-zinc-900 selection:bg-[#EAF5FF] selection:text-[#3999FF] dark:bg-black dark:text-zinc-100 dark:selection:bg-[#010B1B] dark:selection:text-[#3999FF] antialiased'
            onDragEnter={!selectedFile && !isAnalyzing ? handleDragEnter : undefined}
            onDragOver={!selectedFile && !isAnalyzing ? handleDragOver : undefined}
            onDragLeave={!selectedFile && !isAnalyzing ? handleDragLeave : undefined}
            onDrop={!selectedFile && !isAnalyzing ? handleDrop : undefined}
        >
            <AnimatePresence mode='wait'>
                {isAnalyzing && (
                    <motion.div
                        key='analysis'
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        role='status'
                        aria-live='polite'
                        className='fixed inset-0 z-100 flex h-screen w-full select-none flex-col items-center justify-center overflow-hidden bg-black px-6 text-zinc-100 font-sans'
                    >
                        <div data-gsap='status' className='absolute left-6 top-6 z-20 flex items-center gap-2'>
                            <span className='h-1.5 w-1.5 rounded-full bg-zinc-400' />
                            <span className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400'>Resume Analysis</span>
                        </div>

                        <style>{`
                            @keyframes pedestal-glow {
                                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
                                50%      { transform: translate(-50%, -50%) scale(1.12); opacity: 0.85; }
                            }
                        `}</style>

                        <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black select-none'>
                            <div aria-hidden='true' className='absolute inset-0 opacity-[0.12]' style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                            <div
                                className='absolute left-1/2 top-[74%] h-140 w-260 rounded-full'
                                style={{ background: 'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 40%, transparent 72%)', filter: 'blur(60px)', animation: prefersReducedMotion ? 'none' : 'pedestal-glow 6s ease-in-out infinite' }}
                            />

                            <div className='absolute inset-0' style={{ background: 'radial-gradient(ellipse 85% 65% at 47% 27%, transparent 0%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.97) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)' }} />
                            <div
                                className='absolute inset-0'
                                style={{
                                    backgroundImage:
                                        'url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27240%27%20height=%27240%27%20viewBox=%270%200%20240%20240%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%272%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E)',
                                    opacity: 0.05,
                                    mixBlendMode: 'overlay',
                                }}
                            />
                        </div>

                        <div className='relative z-10 flex w-full max-w-2xl flex-col items-center'>
                            <div data-gsap='panel' className='relative w-full max-w-md p-8'>
                                <div className='mx-auto relative h-104 w-64 rounded-none bg-zinc-950 border border-zinc-800'>
                                    <div ref={resumeViewportRef} className='absolute inset-0 rounded-xl'>
                                        <div className='absolute -left-3 -top-3 z-30 h-5 w-5 border-l-2 border-t-2 border-zinc-400/60' />
                                        <div className='absolute -right-3 -top-3 z-30 h-5 w-5 border-r-2 border-t-2 border-zinc-400/60' />
                                        <div className='absolute -bottom-3 -left-3 z-30 h-5 w-5 border-b-2 border-l-2 border-zinc-400/60' />
                                        <div className='absolute -bottom-3 -right-3 z-30 h-5 w-5 border-b-2 border-r-2 border-zinc-400/60' />

                                        <div ref={resumeStageRef} className='relative h-full w-full px-5 pb-8 pt-6 will-change-transform'>
                                            <ResumeDocument refs={{ nameRef, experienceBlockRef, experienceHeadingRef, projectsHeadingRef, educationHeadingRef, skillsHeadingRef }} />
                                        </div>

                                        <div ref={finishFlashRef} className='pointer-events-none absolute inset-0 z-25 bg-white/10 opacity-0' />
                                        <div className='pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-linear-to-b from-zinc-950 to-transparent' />
                                        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8 bg-linear-to-t from-zinc-950 to-transparent' />
                                    </div>

                                    <div ref={lensRef} className='pointer-events-none absolute left-0 top-0 z-30 opacity-0' style={{ width: LENS_SIZE, height: LENS_SIZE }}>
                                        <div ref={calloutRef} className='absolute left-[calc(100%+18px)] top-1/2 -translate-y-1/2 flex items-center whitespace-nowrap opacity-0 z-40 drop-shadow-md'>
                                            <span className='font-sans text-[13px] font-light tracking-wide text-zinc-200'>Let me analyze this resume</span>

                                            <svg width='28' height='20' viewBox='0 0 28 20' className='absolute right-full mr-2 text-zinc-500/50'>
                                                <line x1='28' y1='10' x2='0' y2='10' stroke='currentColor' strokeWidth='1' />
                                            </svg>
                                        </div>

                                        <div className='absolute left-1/2 top-1/2 -z-10 -rotate-45'>
                                            <div className='absolute -left-1.5 top-20 h-30 w-3 bg-black/40 blur-sm' />
                                            <div className='absolute -left-3.5 top-20 h-4 w-7 rounded-[3px] border border-zinc-600/50 bg-linear-to-r from-zinc-700 via-zinc-400 to-zinc-700 shadow-sm' />
                                            <div className='absolute -left-2.5 top-23.5 h-1.5 w-5 rounded-b-sm border-x border-b border-zinc-600/50 bg-zinc-800' />
                                            <div className='absolute -left-1.75 top-24.5 h-25 w-3.5 rounded-full border border-zinc-700/50 bg-linear-to-r from-zinc-900 via-zinc-700 to-zinc-950 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]' />
                                            <div className='absolute -left-2.25 top-48 h-4.5 w-4.5 rounded-full border border-zinc-600/50 bg-linear-to-br from-zinc-700 to-zinc-900 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.2)]' />
                                        </div>

                                        <div className='absolute inset-0 overflow-hidden rounded-full bg-zinc-950'>
                                            <div ref={lensCloneRef} className='absolute left-0 top-0 w-64 px-5 pb-8 pt-6'>
                                                <ResumeDocument />
                                            </div>
                                            <div className='pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' />
                                        </div>
                                        <div className='pointer-events-none absolute inset-0 rounded-full border border-zinc-300/25 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)]' />
                                        <div className='pointer-events-none absolute left-[14%] top-[10%] h-[38%] w-[46%] rounded-full bg-white/10 blur-[6px]' />
                                        <div className='pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-white/4 via-transparent to-transparent' />
                                    </div>
                                </div>

                                <div className='mt-8 text-center min-h-18'>
                                    <AnimatePresence mode='wait'>
                                        <motion.div key={analysisStep} initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                                            <h2 className='text-xl font-semibold tracking-tight text-white'>{analysisMessages[analysisStep].title}</h2>

                                            <p className='mt-2 text-sm text-zinc-400'>{analysisMessages[analysisStep].subtitle}</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div data-gsap='role' className='mt-2 flex items-center gap-2 text-center'>
                                <span className='text-[12px] font-mono uppercase tracking-[0.16em] text-zinc-500'>Tailoring for</span>
                                <span className='text-[14px] font-medium text-zinc-300'>{targetRole}</span>
                            </div>
                        </div>

                        <div data-gsap='footer' className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500'>
                            {isComplete ? (
                                <span className='text-zinc-200'>Analysis complete</span>
                            ) : (
                                <>
                                    <Loader2 className='h-3.5 w-3.5 animate-spin text-zinc-500' />
                                    <span className='text-zinc-400'>Analyzing · {elapsedSeconds}s</span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.header className={`fixed inset-x-0 top-0 z-50 ${isAnalyzing ? 'pointer-events-none' : ''}`} animate={{ opacity: isAnalyzing ? 0 : 1, scale: prefersReducedMotion ? 1 : isAnalyzing ? 0.98 : 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} aria-hidden={isAnalyzing}>
                <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8'>
                    <div className='inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 backdrop-blur-md px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80 select-none'>
                        <span className='h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' />
                        <span className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400'>Resume Intelligence</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            aria-label="Let's chat with AI"
                            onClick={() => navigate('/chat')}
                            className='group relative flex h-10 cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                        >
                            <span className='relative z-10'>Let's chat</span>

                            <span className='relative z-10 flex items-center'>
                                <span className='flex w-0 items-center overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:w-1.5 group-hover:opacity-100'>
                                    <span className='h-px w-1.5 bg-current' />
                                </span>

                                <ChevronRight className='h-4 w-4 shrink-0 -translate-x-0.5 transition-transform duration-300 ease-out group-hover:translate-x-0' strokeWidth={1.8} />
                            </span>

                            <span
                                aria-hidden='true'
                                className='pointer-events-none absolute inset-y-0 -left-1/2 z-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-zinc-500/20 to-transparent opacity-0 dark:via-white/10'
                                style={{ animation: 'chat-shine 3.5s ease-in-out infinite', animationDelay: '1.5s' }}
                            />
                        </button>

                        <a
                            href='https://github.com/faridhussain/Resume-Analyzer'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='GitHub Repository'
                            className='flex h-10 w-10 items-center outline-none justify-center rounded-lg ring-1 ring-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:ring-zinc-300 hover:text-zinc-900 dark:ring-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:ring-zinc-700 dark:hover:text-zinc-100'
                        >
                            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='translate-x-px'>
                                <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
                                <path d='M9 18c-4.51 2-5-2-7-2' />
                            </svg>
                        </a>

                        <button
                            type='button'
                            aria-label='Toggle Theme'
                            onClick={() => toggleTheme()}
                            className='flex h-10 w-10 cursor-pointer outline-none items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                        >
                            {theme === 'light' ? <Moon size={18} strokeWidth={1.8} /> : <SunMedium size={18} strokeWidth={1.8} />}
                        </button>
                    </div>
                </div>
            </motion.header>
            <motion.section
                className={`relative flex h-screen items-center overflow-hidden ${isAnalyzing ? 'pointer-events-none' : ''}`}
                animate={{ opacity: isAnalyzing ? 0 : 1, scale: prefersReducedMotion ? 1 : isAnalyzing ? 0.98 : 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden={isAnalyzing}
            >
                <div className='relative mx-auto grid h-screen w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pt-0'>
                    <div className='flex flex-col justify-center pb-10 lg:pb-0'>
                        <h1 className='text-4xl font-semibold leading-[1.08] text-zinc-900 dark:text-white sm:text-5xl lg:text-[3.8rem]' style={{ fontFamily: 'Geist, sans-serif' }}>
                            <span className='whitespace-nowrap'>
                                Better{' '}
                                <span className='relative inline-block h-[1.08em] min-w-[10ch] overflow-hidden align-bottom whitespace-nowrap'>
                                    <AnimatePresence mode='wait'>
                                        <motion.span
                                            key={headlinePhrases[headlineIndex]}
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -18 }}
                                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                            className='absolute left-0 top-0 whitespace-nowrap text-zinc-400 italic dark:text-zinc-500'
                                        >
                                            {headlinePhrases[headlineIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                            </span>
                        </h1>
                        <p className='mt-4 max-w-122.5 text-[17px] leading-7 text-zinc-500 dark:text-zinc-400'>Upload your resume to receive an ATS score, recruiter feedback, and AI-powered recommendations that help you stand out before you apply.</p>
                        <div
                            onClick={() => {
                                if (!selectedFile) {
                                    fileInputRef.current?.click();
                                }
                            }}
                            className={`group relative mt-6 flex min-h-55 select-none flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-200 ${
                                selectedFile
                                    ? 'cursor-default border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/40'
                                    : isDragging
                                      ? 'cursor-copy border-zinc-500 dark:border-zinc-500'
                                      : 'cursor-pointer border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700'
                            }`}
                        >
                            {!selectedFile && (
                                <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[calc(1rem-2px)]'>
                                    <motion.div
                                        aria-hidden='true'
                                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                        className={`pointer-events-none absolute -inset-full z-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        style={{
                                            background:
                                                theme === 'light' ? 'conic-gradient(from 0deg, transparent 72%, rgba(82,82,91,0.88) 84%, rgba(39,39,42,0.72) 87%, transparent 98%)' : 'conic-gradient(from 0deg, transparent 72%, rgba(161,161,170,0.9) 84%, rgba(113,113,122,0.72) 87%, transparent 98%)',
                                        }}
                                    />

                                    <motion.div
                                        aria-hidden='true'
                                        animate={prefersReducedMotion ? {} : { rotate: -360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                        className={`pointer-events-none absolute -inset-full z-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        style={{
                                            background:
                                                theme === 'light'
                                                    ? 'conic-gradient(from 0deg, transparent 40%, rgba(113,113,122,0.7) 50%, rgba(63,63,70,0.58) 53%, transparent 61%)'
                                                    : 'conic-gradient(from 0deg, transparent 40%, rgba(228,228,231,0.62) 50%, rgba(161,161,170,0.5) 53%, transparent 61%)',
                                        }}
                                    />
                                </div>
                            )}

                            <div className={`relative z-10 flex min-h-55 w-full flex-col items-center justify-center rounded-[calc(1rem-2px)] px-8 py-7 transition-colors duration-300 ${isDragging ? 'bg-zinc-50/90 dark:bg-zinc-900/90' : 'bg-white/80 dark:bg-black/80'}`}>
                                <div
                                    aria-hidden='true'
                                    className={`pointer-events-none absolute inset-0 z-0 bg-size-[16px_16px] transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${
                                        theme === 'light' ? 'bg-[radial-gradient(rgba(0,0,0,0.045)_1px,transparent_1px)]' : 'bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)]'
                                    }`}
                                />

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='application/pdf,.pdf'
                                    onChange={handleFileChange}
                                    onClick={(event) => {
                                        event.currentTarget.value = '';
                                    }}
                                    className='hidden'
                                />
                                <div
                                    className={`relative z-20 flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                                        selectedFile ? 'bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700' : isDragging ? 'bg-zinc-200 ring-2 ring-zinc-300 dark:bg-zinc-700 dark:ring-zinc-600' : 'bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700'
                                    }`}
                                >
                                    {selectedFile ? <FileText className='h-6 w-6 text-zinc-600 dark:text-zinc-300' /> : <UploadCloud className='h-6 w-6 text-zinc-600 dark:text-zinc-300 transition-transform duration-300' />}
                                </div>
                                <div className='relative z-20 mt-3 w-full'>
                                    <h3 className='mx-auto max-w-[90%] truncate text-base font-semibold text-zinc-900 dark:text-zinc-100'>{selectedFile ? selectedFile.name : isDragging ? 'Drop your PDF here' : 'Upload your resume'}</h3>

                                    <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>{selectedFile ? `Choose the role you're targeting — your analysis will be tailored to it.` : 'Drag and drop your PDF here, or click to browse.'}</p>

                                    <AnimatePresence>
                                        {(showFileError || analysisError) && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.92 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.92 }}
                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                                className='mt-3 mx-auto flex w-fit items-center justify-center gap-3 rounded-lg border border-rose-200/70 bg-rose-50/70 px-4 py-2 dark:border-rose-900/40 dark:bg-rose-950/30'
                                            >
                                                <AlertCircle className='h-3.5 w-3.5 shrink-0 text-rose-500 dark:text-rose-400' />
                                                <div className='text-left'>
                                                    <p className='mb-0.5 text-[13px] font-medium leading-tight text-rose-700 dark:text-rose-300'>{analysisError ? 'Invalid resume' : 'Invalid file type'}</p>
                                                    <p className='text-[12px] leading-tight text-rose-500/90 dark:text-rose-400/80'>{analysisError || 'Please upload a PDF file only'}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className='relative z-20 w-full'>
                                    {selectedFile && <TargetRoleSelector value={targetRole} onChange={setTargetRole} onSelectionChange={setIsRoleSelected} onEnter={handleAnalyze} isSelected={isRoleSelected} />}
                                    {selectedFile ? (
                                        <div className='mt-3 flex w-full gap-2.5'>
                                            <button
                                                type='button'
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                                className='inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                            >
                                                <UploadCloud className='h-3.5 w-3.5' />
                                                <span>Change PDF</span>
                                            </button>

                                            <div className='group/analyze relative flex-1'>
                                                <button
                                                    type='button'
                                                    disabled={!isRoleSelected}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleAnalyze();
                                                    }}
                                                    className={`group/btn inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 font-medium transition-all duration-200 focus:outline-none ${
                                                        isRoleSelected ? 'cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200' : 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                                                    }`}
                                                >
                                                    <span>Analyze Resume</span>

                                                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ease-out ${isRoleSelected ? 'group-hover/btn:translate-x-1.5' : ''}`} />
                                                </button>

                                                {!isRoleSelected && (
                                                    <div className='pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover/analyze:translate-y-0 group-hover/analyze:opacity-100'>
                                                        <div className='whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900'>Select a target role to continue</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type='button'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className='group/btn mx-auto mt-6 inline-flex h-12 w-full max-w-60 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 font-medium text-white transition-all duration-200 hover:bg-zinc-800 focus:outline-none focus:ring-0 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                                        >
                                            <span>Select PDF</span>
                                            <ChevronRight className='h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 pl-1 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-zinc-600 dark:text-zinc-400'>
                            <span className='flex items-center gap-2'>
                                <ShieldCheck className='h-4 w-4 text-zinc-500 dark:text-zinc-400' />
                                Private by default
                            </span>
                            <span className='hidden h-4 w-px bg-zinc-200 dark:bg-zinc-800 sm:block' />
                            <span className='flex items-center gap-2'>
                                <Gauge className='h-4 w-4 text-zinc-500 dark:text-zinc-400' />
                                ATS-aware analysis
                            </span>
                            <span className='hidden h-4 w-px bg-zinc-200 dark:bg-zinc-800 sm:block' />
                            <span className='flex items-center gap-2'>
                                <CheckCircle2 className='h-4 w-4 text-zinc-500 dark:text-zinc-400' />
                                Recruiter-focused feedback
                            </span>
                        </div>
                    </div>
                    <div className='relative flex items-center justify-center lg:justify-end'>
                        <div className='relative w-full max-w-md'>
                            <div className='absolute -inset-10 -z-10 rounded-full bg-zinc-100 dark:bg-zinc-800/30 blur-3xl' />
                            <div className='relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50'>
                                <div className='flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 px-4 py-3'>
                                    <div className='flex items-center gap-2'>
                                        <FileText className='h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500' />
                                        <span className='font-mono text-[11px] text-zinc-400 dark:text-zinc-500'>resume.pdf</span>
                                    </div>
                                    <span className='flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
                                        <span className='relative flex h-2 w-2'>
                                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60'></span>
                                            <span className='relative inline-flex h-2 w-2 rounded-full bg-zinc-500'></span>
                                        </span>
                                        analyzing
                                    </span>
                                </div>
                                <div className='relative h-144 overflow-hidden bg-zinc-50 dark:bg-zinc-900/50'>
                                    <img src='/resume-preview.png' alt='Resume preview skeleton' className='absolute left-1/2 top-0 w-[calc(100%+2px)] -translate-x-1/2 -translate-y-px scale-[1.01] select-none opacity-90 dark:opacity-75 dark:invert' draggable={false} />
                                </div>
                            </div>
                            <div className='animate-float-a absolute -right-8 -top-6 w-40 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>ATS Score</span>
                                    <Gauge className='h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500' />
                                </div>
                                <div className='mt-1.5 font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-100'>
                                    94<span className='text-sm text-zinc-400 dark:text-zinc-500'>/100</span>
                                </div>
                                <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800'>
                                    <div className='h-full w-[94%] rounded-full bg-zinc-900 dark:bg-zinc-100' />
                                </div>
                            </div>
                            <div className='animate-float-b absolute -left-10 top-[32%] w-40 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>Hire Rate</span>
                                    <CheckCircle2 className='h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100' />
                                </div>
                                <div className='mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Very High</div>
                            </div>
                            <div className='animate-float-a absolute -left-6 bottom-18 w-36 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>Best Skill</div>
                                <div className='mt-1 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>React</div>
                            </div>
                            <div className='animate-float-b absolute -bottom-6 right-0 w-40 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>Improve</div>
                                <div className='mt-1 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>Docker</div>
                            </div>
                            <div className='animate-float-c absolute -right-10 top-[46%] w-44 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>PDF Report</span>
                                    <FileText className='h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400' />
                                </div>
                                <div className='mt-2 flex items-center gap-2'>
                                    <span className='relative flex h-2 w-2'>
                                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60' />
                                        <span className='relative inline-flex h-2 w-2 rounded-full bg-zinc-500' />
                                    </span>
                                    <span className='text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>Generating...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}