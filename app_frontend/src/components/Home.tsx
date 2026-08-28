import { UploadCloud, CheckCircle2, FileText, Gauge, ChevronRight, SunMedium, Moon, ShieldCheck, Loader2, AlertCircle, Bot } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useTheme } from '../hooks/useTheme.ts';
import { uploadResume } from '../services/uploadResume.ts';
import TargetRoleSelector from './TargetRoleSelector';

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
            <div ref={refs?.nameRef} className='mb-4 sm:mb-5 w-fit space-y-1.5'>
                <div className='h-2 w-20 sm:w-24 rounded-full bg-zinc-300 dark:bg-zinc-600' />
                <div className='h-1.5 w-28 sm:w-32 rounded-full bg-zinc-200 dark:bg-zinc-800' />
            </div>

            <div ref={refs?.experienceBlockRef} className='relative mb-4 sm:mb-5 rounded-md'>
                <div ref={refs?.experienceHeadingRef} className='mb-1.5 sm:mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[7.5px] sm:text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Experience</span>
                </div>
                <div className='space-y-1.5'>
                    <div className='h-1.5 w-4/5 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-3/5 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                    <div className='h-1.5 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
                <div className='mt-2.5 sm:mt-3 space-y-1.5'>
                    <div className='h-1.5 w-3/5 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
            </div>

            <div className='relative mb-4 sm:mb-5 rounded-md'>
                <div ref={refs?.projectsHeadingRef} className='mb-1.5 sm:mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[7.5px] sm:text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Projects</span>
                </div>
                <div className='space-y-1.5'>
                    <div className='h-1.5 w-3/4 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
                <div className='mt-2.5 sm:mt-3 space-y-1.5'>
                    <div className='h-1.5 w-2/3 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-2/5 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
            </div>

            <div className='relative mb-4 sm:mb-5 rounded-md'>
                <div ref={refs?.educationHeadingRef} className='mb-1.5 sm:mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[7.5px] sm:text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Education</span>
                </div>
                <div className='space-y-1.5'>
                    <div className='h-1.5 w-3/5 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                    <div className='h-1.5 w-2/5 rounded-full bg-zinc-200 dark:bg-zinc-800' />
                </div>
            </div>

            <div className='relative rounded-md'>
                <div ref={refs?.skillsHeadingRef} className='mb-1.5 sm:mb-2 flex w-fit items-center gap-1.5'>
                    <span className='h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500' />
                    <span className='font-mono text-[7.5px] sm:text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500'>Skills</span>
                </div>
                <div className='flex flex-wrap gap-1 sm:gap-1.5'>
                    {['Strategy', 'Analytics', 'Leadership', 'Automation', 'Design', 'Research'].map((skill) => (
                        <span key={skill} className='rounded-full border border-zinc-200 bg-zinc-50 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[7.5px] sm:text-[8px] font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500'>
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
    const [messageIndex, setMessageIndex] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [mobileHeadlineText, setMobileHeadlineText] = useState('resume.');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const prefersReducedMotion = Boolean(useReducedMotion());
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleGlobalUploadShortcut = (event: KeyboardEvent) => {
            if (!event.metaKey || event.key.toLowerCase() !== 'u' || event.repeat || isAnalyzing) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            fileInputRef.current?.click();
        };

        window.addEventListener('keydown', handleGlobalUploadShortcut);

        return () => {
            window.removeEventListener('keydown', handleGlobalUploadShortcut);
        };
    }, [isAnalyzing]);

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
    const scanLineRef = useRef<HTMLDivElement>(null);

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
        if (!isMobileMenuOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (!mobileMenuRef.current?.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const words = ['resume.', 'interviews.', 'career.'];
        let wordIndex = 0;
        let charIndex = 1;
        let deleting = false;
        let timeoutId: number | null = null;
        let cancelled = false;

        setMobileHeadlineText(words[0].slice(0, 1));

        const tick = () => {
            if (cancelled) return;

            const word = words[wordIndex];

            if (!deleting) {
                if (charIndex < word.length) {
                    charIndex += 1;
                    setMobileHeadlineText(word.slice(0, charIndex));
                    timeoutId = window.setTimeout(tick, 85);
                    return;
                }

                deleting = true;
                timeoutId = window.setTimeout(tick, 1500);
                return;
            }

            if (charIndex > 1) {
                charIndex -= 1;
                setMobileHeadlineText(word.slice(0, charIndex));
                timeoutId = window.setTimeout(tick, 85);
                return;
            }

            wordIndex = (wordIndex + 1) % words.length;
            charIndex = 1;
            deleting = false;
            setMobileHeadlineText(words[wordIndex].slice(0, 1));
            timeoutId = window.setTimeout(tick, 120);
        };

        timeoutId = window.setTimeout(tick, 85);

        return () => {
            cancelled = true;
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
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
            setMessageIndex(0);
            return;
        }
        if (isComplete) return;

        let delay = 3000;
        if (messageIndex === 0) delay = 3000;
        else if (messageIndex === 1) delay = 3000;
        else if (messageIndex === 2) delay = 3000;

        const timeoutId = window.setTimeout(() => {
            setMessageIndex((current) => (current + 1) % analysisMessages.length);
        }, delay);

        return () => window.clearTimeout(timeoutId);
    }, [isAnalyzing, isComplete, messageIndex]);

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

        const moveLensTo = (el: HTMLElement | null, duration: number) => {
            const tl = gsap.timeline();
            if (!el || !viewport || !lens || !clone) return tl;

            const viewportRect = viewport.getBoundingClientRect();
            const targetRect = el.getBoundingClientRect();
            const lensRect = lens.getBoundingClientRect();

            gsap.set(clone, {
                width: viewportRect.width,
                height: viewportRect.height,
            });

            const halfX = lensRect.width / 2;
            const halfY = lensRect.height / 2;

            const px = targetRect.left - viewportRect.left + targetRect.width / 2;
            const py = targetRect.top - viewportRect.top + targetRect.height / 2;

            const maxX = Math.max(viewportRect.width - halfX, halfX);
            const maxY = Math.max(viewportRect.height - halfY, halfY);
            const lensX = Math.min(Math.max(px, halfX), maxX);
            const lensY = Math.min(Math.max(py, halfY), maxY);

            const tx = halfX - MAG_SCALE * px;
            const ty = halfY - MAG_SCALE * py;

            tl.to(lens, { x: lensX - halfX, y: lensY - halfY, duration, ease: 'power3.inOut' }, 0);
            tl.to(clone, { x: tx, y: ty, scale: MAG_SCALE, duration, ease: 'power3.inOut' }, 0);
            return tl;
        };

        let loopTl: gsap.core.Timeline | null = null;
        let breatheTween: gsap.core.Tween | null = null;
        let scanTween: gsap.core.Timeline | null = null;

        if (analysisStep === 0) {
            const viewportRect = viewport.getBoundingClientRect();
            const lensRect = lens.getBoundingClientRect();
            const halfX = lensRect.width / 2;
            const halfY = lensRect.height / 2;

            gsap.set(clone, {
                width: viewportRect.width,
                height: viewportRect.height,
            });

            const startX = viewportRect.width + halfX + 24;
            const startY = Math.min(140, viewportRect.height / 2);

            gsap.set(lens, {
                x: startX - halfX,
                y: startY - halfY,
                opacity: 0,
                scale: 0.9,
            });
            gsap.set(clone, {
                x: halfX - MAG_SCALE * startX,
                y: halfY - MAG_SCALE * startY,
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

            if (scanLineRef.current) {
                const viewportRect = viewport.getBoundingClientRect();
                const scanHeight = viewportRect.height;
                const glowHalf = 2;
                const minTop = glowHalf;
                const maxTop = Math.max(scanHeight - glowHalf, minTop);

                gsap.set(scanLineRef.current, { top: minTop, opacity: 0 });

                scanTween = gsap.timeline({ delay: 0.7, repeat: -1, repeatDelay: 0.6 });
                scanTween.fromTo(scanLineRef.current, { top: minTop, opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 0);
                scanTween.to(scanLineRef.current, { top: maxTop, duration: 3.3, ease: 'sine.inOut' }, 0);
                scanTween.to(scanLineRef.current, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 3.15);
            }
        }

        return () => {
            loopTl?.kill();
            breatheTween?.kill();
            scanTween?.kill();
            gsap.killTweensOf([lens, clone, stage, calloutRef.current, scanLineRef.current]);
        };
    }, [analysisStep, isAnalyzing, prefersReducedMotion]);

    useEffect(() => {
        if (!isComplete || prefersReducedMotion) return;

        const stage = resumeStageRef.current;
        const lens = lensRef.current;
        const flash = finishFlashRef.current;
        const scanLine = scanLineRef.current;
        if (!stage || !flash) return;

        gsap.killTweensOf(stage);
        gsap.killTweensOf(scanLine);
        if (lens) gsap.to(lens, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        if (scanLine) gsap.to(scanLine, { opacity: 0, duration: 0.3, ease: 'power2.out' });
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
        const activeElement = document.activeElement;

        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
            activeElement.blur();
        }

        setIsAnalyzing(true);
        setIsComplete(false);
        setAnalysisStep(0);
        setMessageIndex(0);
        setAnalysisError('');
        animationCompleteRef.current = false;

        const animationStartTime = Date.now();

        try {
            console.log('Uploading resume...');
            setAnalysisStep(0);

            const pdfUrl = await uploadResume(selectedFile);

            console.log('Resume uploaded successfully\nPDF URL:', pdfUrl);
            console.log('Starting resume analysis...');

            const response = await fetch('http://192.168.29.200:3000/resume/analyze', {
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
            setMessageIndex(analysisMessages.length - 1);
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
            className={`relative h-screen w-full overflow-hidden bg-white text-zinc-900 selection:bg-[#EAF5FF] selection:text-[#3999FF] dark:bg-black dark:text-zinc-100 dark:selection:bg-[#010B1B] dark:selection:text-[#3999FF] antialiased ${selectedFile ? 'max-[1069.9px]:overflow-x-hidden max-[1069.9px]:overflow-y-auto' : ''}`}
            onDragEnter={!selectedFile && !isAnalyzing ? handleDragEnter : undefined}
            onDragOver={!selectedFile && !isAnalyzing ? handleDragOver : undefined}
            onDragLeave={!selectedFile && !isAnalyzing ? handleDragLeave : undefined}
            onDrop={!selectedFile && !isAnalyzing ? handleDrop : undefined}
        >
            <div aria-hidden='true' className={`pointer-events-none absolute inset-0 z-0 select-none overflow-hidden transition-opacity duration-300 ${isAnalyzing ? 'opacity-0' : 'opacity-100'}`}>
                <div
                    className='absolute inset-0 opacity-[0.08] dark:opacity-[0.08]'
                    style={{
                        backgroundImage: theme === 'dark' ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)' : 'radial-gradient(circle at 1px 1px, rgba(0,0,0,1) 1px, transparent 0)',
                        backgroundSize: '34px 34px',
                    }}
                />
                <div
                    className='absolute left-1/2 top-[6%] h-125 w-125 -translate-x-1/2 rounded-full max-w-full'
                    style={{
                        background: theme === 'dark' ? 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 35%, transparent 70%)' : 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.022) 35%, transparent 70%)',
                        filter: 'blur(50px)',
                    }}
                />
                <div
                    className='absolute inset-0'
                    style={{
                        background: theme === 'dark' ? 'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.92) 100%)' : 'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(255,255,255,0.3) 65%, rgba(255,255,255,0.84) 100%)',
                    }}
                />
                <div
                    className='absolute inset-0'
                    style={{
                        backgroundImage:
                            'url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27240%27%20height=%27240%27%20viewBox=%270%200%20240%20240%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%272%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E)',
                        opacity: theme === 'dark' ? 0.045 : 0.025,
                        mixBlendMode: 'overlay',
                    }}
                />
            </div>

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
                        className={`fixed inset-0 z-100 flex h-screen w-full select-none flex-col items-center justify-between overflow-hidden px-4 sm:px-6 py-6 font-sans ${theme === 'dark' ? 'bg-black text-zinc-100' : 'bg-white text-zinc-900'}`}
                    >
                        <div data-gsap='status' className='relative z-20 flex w-full max-w-7xl items-center justify-start gap-2 pt-1 sm:pt-2'>
                            <span className='h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400' />
                            <span className='font-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400'>Resume Intelligence</span>
                        </div>

                        <style>{`
                            @keyframes pedestal-glow {
                                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
                                50%      { transform: translate(-50%, -50%) scale(1.12); opacity: 0.85; }
                            }

                            @keyframes analysis-ambient-glow {
                                0%, 100% {
                                    transform: translate(-50%, -50%) scale(0.94);
                                    opacity: 0.42;
                                }
                                50% {
                                    transform: translate(-50%, -50%) scale(1.06);
                                    opacity: 0.72;
                                }
                            }

                            @keyframes analysis-ambient-drift {
                                0%, 100% {
                                    transform: translate3d(-50%, -50%, 0) scale(1);
                                }
                                50% {
                                    transform: translate3d(-48%, -52%, 0) scale(1.08);
                                }
                            }
                        `}</style>

                        <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                            <div
                                aria-hidden='true'
                                className='absolute inset-0 opacity-[0.11]'
                                style={{
                                    backgroundImage: theme === 'dark' ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)' : 'radial-gradient(circle at 1px 1px, rgba(0,0,0,1) 1px, transparent 0)',
                                    backgroundSize: '32px 32px',
                                }}
                            />

                            <div
                                aria-hidden='true'
                                className='absolute left-1/2 top-[40%] h-96 sm:h-150 w-96 sm:w-150 rounded-full max-w-full'
                                style={{
                                    background:
                                        theme === 'dark' ? 'radial-gradient(circle, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.055) 24%, rgba(255,255,255,0.018) 46%, transparent 72%)' : 'radial-gradient(circle, rgba(0,0,0,0.055) 0%, rgba(0,0,0,0.028) 24%, rgba(0,0,0,0.01) 46%, transparent 72%)',
                                    filter: 'blur(38px)',
                                    animation: prefersReducedMotion ? undefined : 'analysis-ambient-glow 7s ease-in-out infinite',
                                }}
                            />

                            <div
                                aria-hidden='true'
                                className='absolute left-[52%] top-[32%] h-72 sm:h-100 w-96 sm:w-175 rounded-full max-w-full'
                                style={{
                                    background: theme === 'dark' ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 38%, transparent 72%)' : 'radial-gradient(ellipse at center, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.012) 38%, transparent 72%)',
                                    filter: 'blur(55px)',
                                    animation: prefersReducedMotion ? undefined : 'analysis-ambient-drift 11s ease-in-out infinite',
                                }}
                            />

                            <div
                                className='absolute left-1/2 top-[74%] h-96 sm:h-140 w-[90vw] sm:w-260 rounded-full'
                                style={{
                                    background: theme === 'dark' ? 'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 40%, transparent 72%)' : 'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.025) 40%, transparent 72%)',
                                    filter: 'blur(60px)',
                                }}
                            />

                            <div
                                className='absolute inset-0'
                                style={{
                                    background:
                                        theme === 'dark'
                                            ? 'radial-gradient(ellipse 85% 65% at 47% 27%, transparent 0%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.97) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)'
                                            : 'radial-gradient(ellipse 85% 65% at 47% 27%, transparent 0%, rgba(255,255,255,0.45) 58%, rgba(255,255,255,0.96) 100%), linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 100%)',
                                }}
                            />

                            <div
                                className='absolute inset-0'
                                style={{
                                    backgroundImage:
                                        'url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27240%27%20height=%27240%27%20viewBox=%270%200%20240%20240%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%272%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E)',
                                    opacity: theme === 'dark' ? 0.05 : 0.028,
                                    mixBlendMode: 'overlay',
                                }}
                            />
                        </div>

                        <div className='relative z-10 flex w-full max-w-2xl flex-1 flex-col items-center justify-center my-auto py-2 sm:py-6'>
                            <div data-gsap='panel' className='relative flex w-full max-w-md flex-col items-center justify-center p-2 sm:p-6'>
                                <div className={`mx-auto relative h-85 w-55 xs:h-[384px] xs:w-60 sm:h-104 sm:w-64 rounded-none border transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                                    <div ref={resumeViewportRef} className='absolute inset-0 rounded-xl overflow-hidden'>
                                        <div className='absolute -left-3 -top-3 z-30 h-5 w-5 border-l-2 border-t-2 border-zinc-400/60' />
                                        <div className='absolute -right-3 -top-3 z-30 h-5 w-5 border-r-2 border-t-2 border-zinc-400/60' />
                                        <div className='absolute -bottom-3 -left-3 z-30 h-5 w-5 border-b-2 border-l-2 border-zinc-400/60' />
                                        <div className='absolute -bottom-3 -right-3 z-30 h-5 w-5 border-b-2 border-r-2 border-zinc-400/60' />

                                        <div ref={resumeStageRef} className='relative h-full w-full px-4 xs:px-5 pb-6 sm:pb-8 pt-5 sm:pt-6 will-change-transform'>
                                            <ResumeDocument refs={{ nameRef, experienceBlockRef, experienceHeadingRef, projectsHeadingRef, educationHeadingRef, skillsHeadingRef }} />
                                        </div>

                                        <div ref={scanLineRef} className='pointer-events-none absolute inset-x-0 z-15 opacity-0' style={{ top: 0 }}>
                                            <div
                                                className={`h-px w-full -translate-y-1/2 bg-linear-to-r ${
                                                    theme === 'dark' ? 'from-transparent via-zinc-300/75 to-transparent shadow-[0_0_6px_1px_rgba(161,161,170,0.4)]' : 'from-transparent via-zinc-500/75 to-transparent shadow-[0_0_5px_1px_rgba(113,113,122,0.3)]'
                                                }`}
                                            />
                                        </div>

                                        <div ref={finishFlashRef} className={`pointer-events-none absolute inset-0 z-25 opacity-0 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`} />
                                        <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-linear-to-b ${theme === 'dark' ? 'from-zinc-950' : 'from-white'} to-transparent`} />
                                        <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8 bg-linear-to-t ${theme === 'dark' ? 'from-zinc-950' : 'from-white'} to-transparent`} />
                                    </div>

                                    <div ref={lensRef} className='pointer-events-none absolute left-0 top-0 z-30 opacity-0 w-36 h-36 sm:w-44 sm:h-44'>
                                        <div ref={calloutRef} className='absolute -top-10 left-1/2 -translate-x-1/2 sm:left-[calc(100%+14px)] sm:top-1/2 sm:-translate-y-1/2 flex items-center whitespace-nowrap opacity-0 z-40 drop-shadow-md'>
                                            <span className='font-sans text-[11px] sm:text-[13px] font-light tracking-wide text-zinc-700 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 sm:bg-transparent px-2 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 sm:border-none backdrop-blur-xs sm:backdrop-blur-none'>
                                                Let me analyze this resume
                                            </span>

                                            <svg width='28' height='20' viewBox='0 0 28 20' className='hidden sm:block absolute right-full mr-2 text-zinc-400/60 dark:text-zinc-500/50'>
                                                <line x1='28' y1='10' x2='0' y2='10' stroke='currentColor' strokeWidth='1' />
                                            </svg>
                                        </div>

                                        <div className='absolute left-1/2 top-1/2 -z-10 -rotate-45'>
                                            <div className='absolute -left-1.5 top-16 sm:top-20 h-24 sm:h-30 w-2.5 sm:w-3 bg-black/40 blur-sm' />
                                            <div className='absolute -left-3.5 top-16 sm:top-20 h-3.5 sm:h-4 w-6 sm:w-7 rounded-[3px] border border-zinc-600/50 bg-linear-to-r from-zinc-700 via-zinc-400 to-zinc-700 shadow-sm' />
                                            <div className='absolute -left-2.5 top-19 sm:top-23.5 h-1.5 w-4.5 sm:w-5 rounded-b-sm border-x border-b border-zinc-600/50 bg-zinc-800' />
                                            <div className='absolute -left-1.75 top-20 sm:top-24.5 h-20 sm:h-25 w-3 sm:w-3.5 rounded-full border border-zinc-700/50 bg-linear-to-r from-zinc-900 via-zinc-700 to-zinc-950 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]' />
                                            <div className='absolute -left-2.25 top-38 sm:top-48 h-4 sm:h-4.5 w-4 sm:w-4.5 rounded-full border border-zinc-600/50 bg-linear-to-br from-zinc-700 to-zinc-900 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.2)]' />
                                        </div>

                                        <div className={`absolute inset-0 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
                                            <div ref={lensCloneRef} className='absolute left-0 top-0 px-4 xs:px-5 pb-6 sm:pb-8 pt-5 sm:pt-6'>
                                                <ResumeDocument />
                                            </div>
                                            <div className='pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' />
                                        </div>
                                        <div className='pointer-events-none absolute inset-0 rounded-full border border-zinc-300/50 dark:border-zinc-300/25 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)]' />
                                        <div className='pointer-events-none absolute left-[14%] top-[10%] h-[38%] w-[46%] rounded-full bg-white/60 dark:bg-white/10 blur-[6px]' />
                                        <div className='pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-black/5 dark:from-white/4 via-transparent to-transparent' />
                                    </div>
                                </div>

                                <div className='mt-6 sm:mt-8 text-center min-h-16 sm:min-h-18 px-2'>
                                    <AnimatePresence mode='wait'>
                                        <motion.div key={messageIndex} initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                                            <h2 className='text-base xs:text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-white'>{analysisMessages[messageIndex].title}</h2>

                                            <p className='mt-1.5 sm:mt-2 text-[11.5px] xs:text-[12.5px] sm:text-sm text-zinc-500 dark:text-zinc-400'>{analysisMessages[messageIndex].subtitle}</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div data-gsap='role' className='mt-1 sm:mt-2 flex items-center justify-center gap-2 text-center px-4'>
                                <span className='text-[10px] sm:text-[12px] font-mono uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 shrink-0'>Tailoring for</span>
                                <span className='text-[12px] sm:text-[14px] font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-48 sm:max-w-xs'>{targetRole}</span>
                            </div>
                        </div>

                        <div data-gsap='footer' className='relative z-20 flex items-center justify-center gap-2.5 pb-1 sm:pb-2 font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.16em] text-zinc-500'>
                            {isComplete ? (
                                <span className='text-zinc-700 dark:text-zinc-200'>analysis complete</span>
                            ) : (
                                <>
                                    <Loader2 className='h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-zinc-400 dark:text-zinc-500' />
                                    <span className='text-zinc-500 dark:text-zinc-400'>analyzing · {elapsedSeconds}s</span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.header className={`fixed inset-x-0 top-0 z-50 ${isAnalyzing ? 'pointer-events-none' : ''}`} animate={{ opacity: isAnalyzing ? 0 : 1, scale: prefersReducedMotion ? 1 : isAnalyzing ? 0.98 : 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} aria-hidden={isAnalyzing}>
                <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8 max-[649.9px]:px-2 max-[649.9px]:h-auto max-[649.9px]:py-1.5'>
                    <div className='inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 backdrop-blur-md px-3 max-[549.9px]:py-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80 select-none'>
                        <span className='h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 max-[649.9px]:h-1 max-[649.9px]:w-1 max-[549.9px]:h-0.7 max-[549.9px]:w-0.7' />
                        <span className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400 max-[649.9px]:text-[10px] max-[649.9px]:tracking-[0.14em] max-[549.9px]:text-[9px] max-[449.9px]:text-[8px] max-[549.9px]:tracking-widest'>
                            Resume Intelligence
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            aria-label='Chat with AI'
                            onClick={() => navigate('/chat')}
                            className='group relative flex h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 active:scale-[0.97] active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100 dark:active:bg-zinc-800 max-[649.9px]:h-9 max-[649.9px]:w-9 max-[649.9px]:shrink-0 max-[649.9px]:px-0 max-[649.9px]:py-0 outline-none'
                        >
                            <span className='relative z-10 max-[649.9px]:hidden'>Let's chat</span>

                            <span className='relative z-10 flex items-center max-[649.9px]:hidden'>
                                <span className='flex w-0 items-center overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:w-1.5 group-hover:opacity-100'>
                                    <span className='h-px w-1.5 bg-current' />
                                </span>

                                <ChevronRight className='h-4 w-4 shrink-0 -translate-x-0.5 transition-transform duration-300 ease-out group-hover:translate-x-0' strokeWidth={1.8} />
                            </span>
                            <Bot className='hidden max-[649.9px]:block h-5 w-5' strokeWidth={1.8} aria-hidden='true' />
                            <span
                                aria-hidden='true'
                                className='pointer-events-none absolute inset-y-0 -left-1/2 z-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-zinc-500/20 to-transparent opacity-0 dark:via-white/10'
                                style={{ animation: 'chat-shine 3.5s ease-in-out infinite', animationDelay: '1.5s' }}
                            />
                        </button>

                        <a
                            href='https://github.com/farhandotme/Resume-Analyzer'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='GitHub Repository'
                            className='flex h-10 w-10 cursor-pointer items-center outline-none justify-center rounded-lg ring-1 ring-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:ring-zinc-300 hover:text-zinc-900 active:scale-[0.97] active:bg-zinc-50 dark:ring-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:ring-zinc-700 dark:hover:text-zinc-100 dark:active:bg-zinc-800 max-[649.9px]:hidden'
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
                            className='flex h-10 w-10 cursor-pointer outline-none items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 active:scale-[0.97] active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100 dark:active:bg-zinc-800 max-[649.9px]:hidden'
                        >
                            {theme === 'light' ? <Moon size={18} strokeWidth={1.8} /> : <SunMedium size={18} strokeWidth={1.8} />}
                        </button>

                        <div ref={mobileMenuRef} className='relative hidden max-[649.9px]:block'>
                            <button
                                type='button'
                                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isMobileMenuOpen}
                                onClick={() => setIsMobileMenuOpen((current) => !current)}
                                className='group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-transparent text-zinc-600 transition-all duration-200 hover:text-zinc-900 active:scale-[0.92] dark:text-zinc-400 dark:hover:text-zinc-100'
                            >
                                <div className='relative h-3.5 w-4'>
                                    <span className={`absolute right-[-2.5px] top-0 h-0.5 rounded-full bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'left-1/2 right-auto w-5 -translate-x-1/2 translate-y-1.75 rotate-45' : 'w-2.5'}`} />
                                    <span className={`absolute left-0 top-1.75 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                                    <span className={`absolute left-0 top-3.5 h-0.5 rounded-full bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'left-1/2 w-5 -translate-x-1/2 -translate-y-1.75 -rotate-45' : 'w-2.5'}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isMobileMenuOpen && (
                                    <motion.div initial={{ opacity: 0, y: -6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.9 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className='absolute right-0 top-[calc(100%+0.7rem)] z-50'>
                                        <div className='relative flex items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white/80 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:border-zinc-800/80 dark:bg-zinc-900/75 dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]'>
                                            <motion.a
                                                href='https://github.com/faridhussain/Resume-Analyzer'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                aria-label='GitHub Repository'
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.18, delay: 0.04 }}
                                                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white'
                                            >
                                                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' className='h-4.5 w-4.5'>
                                                    <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5-.28-1.15-.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
                                                    <path d='M9 18c-4.51 2-5-2-7-2' />
                                                </svg>
                                            </motion.a>

                                            <div className='h-5 w-px bg-zinc-200 dark:bg-white/10' />

                                            <motion.button
                                                type='button'
                                                aria-label='Toggle Theme'
                                                onClick={() => {
                                                    toggleTheme();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.18, delay: 0.08 }}
                                                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white'
                                            >
                                                {theme === 'light' ? <Moon size={18} strokeWidth={1.8} /> : <SunMedium size={18} strokeWidth={1.8} />}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.header>
            <motion.section
                className={`relative flex h-screen items-center overflow-hidden ${selectedFile ? 'max-[1069.9px]:h-auto max-[1069.9px]:min-h-screen max-[549.9px]:items-start max-[1069.9px]:overflow-visible' : ''} ${isAnalyzing ? 'pointer-events-none' : ''}`}
                animate={{ opacity: isAnalyzing ? 0 : 1, scale: prefersReducedMotion ? 1 : isAnalyzing ? 0.98 : 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden={isAnalyzing}
            >
                <div
                    className={`relative mx-auto grid h-screen w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-20 min-[1070px]:grid-cols-2 min-[1070px]:gap-10 min-[1070px]:px-8 min-[1070px]:pt-0 max-[1310px]:gap-0 max-[1310px]:px-6 max-[1069.9px]:px-5 max-[1069.9px]:translate-y-0 max-[549.9px]:-translate-y-5 ${selectedFile ? 'max-[1069.9px]:h-auto max-[1069.9px]:min-h-screen max-[549.9px]:items-start max-[649.9px]:pt-24 max-[549.9px]:pt-28 max-[449.9px]:pt-35 max-[1069.9px]:pb-8' : ''}`}
                >
                    <div className={`flex flex-col justify-center pb-10 min-[1070px]:pb-0 max-[1069.9px]:mx-auto max-[1069.9px]:w-full max-[1069.9px]:max-w-2xl max-[1069.9px]:justify-self-center max-[1069.9px]:text-center ${selectedFile ? 'max-[549.9px]:pb-4' : ''}`}>
                        <h1 className='hidden min-[1070px]:block text-4xl font-normal leading-[1.08] text-zinc-900 dark:text-white sm:text-5xl lg:text-[3.8rem] max-[1310px]:text-[3.2rem]' style={{ fontFamily: 'Fraunces, serif' }}>
                            <span className='whitespace-nowrap'>
                                Better{' '}
                                <span className='relative inline-block h-[1.08em] min-w-[10ch] overflow-hidden align-bottom whitespace-nowrap'>
                                    <span className='absolute left-0 top-0 whitespace-nowrap text-zinc-400 italic dark:text-zinc-500'>{mobileHeadlineText}</span>
                                </span>
                            </span>
                        </h1>

                        <h1
                            className={`block text-center text-[3.7rem] font-normal leading-[1.08] text-zinc-900 dark:text-white max-[649.9px]:text-[3.3rem] max-[549.9px]:text-[2.9rem] max-[449.9px]:text-[2.3rem] min-[1070px]:hidden ${selectedFile ? 'max-[549.9px]:text-[2.7rem] max-[449.9px]:text-[2.2rem]' : ''}`}
                            style={{ fontFamily: 'Fraunces, serif' }}
                        >
                            <span className='block whitespace-nowrap'>
                                Better <span className='text-zinc-400 italic dark:text-zinc-500'>{mobileHeadlineText}</span>
                            </span>
                        </h1>
                        <p
                            className={`mt-4 max-w-122.5 text-[18px] leading-7 text-zinc-500 dark:text-zinc-400 max-[1310px]:text-[17px] max-[1069.9px]:mx-auto max-[1069.9px]:max-w-155 max-[1069.9px]:text-[17px] max-[1069.9px]:leading-7 max-[1069.9px]:tracking-[0.02em] max-[1069.9px]:text-center max-[649.9px]:text-[15.5px] ${selectedFile ? 'max-[549.9px]:mt-3 max-[449.9px]:text-[13.5px] max-[449.9px]:leading-5.5' : ''}`}
                        >
                            <span className='max-[549.9px]:hidden'>Upload your resume to receive an ATS score, recruiter feedback, and AI-powered recommendations that help you stand out before you apply.</span>
                            <span className='hidden max-[549.9px]:inline max-[449.9px]:inline-block max-[449.9px]:text-[14px] max-[399.9px]:text-[13px] max-[449.9px]:leading-6'>Upload your resume for an ATS score, recruiter feedback, and AI-powered recommendations.</span>
                        </p>
                        <div
                            onClick={() => {
                                if (!selectedFile) {
                                    fileInputRef.current?.click();
                                }
                            }}
                            className={`group relative mt-6 flex min-h-55 select-none max-[1310px]:min-h-48 max-[1069.9px]:mx-auto max-[1069.9px]:w-full max-[449.9px]:w-[calc(100%+16px)] max-[449.9px]:left-1/2 max-[449.9px]:-translate-x-1/2 max-[549.9px]:mt-5 max-[549.9px]:min-h-44 max-[449.9px]:mt-4 flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-200 ${selectedFile ? 'overflow-visible' : 'overflow-hidden'} ${
                                selectedFile
                                    ? 'cursor-default border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/40'
                                    : isDragging
                                      ? 'cursor-copy border-zinc-500 dark:border-zinc-500'
                                      : 'cursor-pointer border-zinc-300 hover:border-zinc-400 active:border-zinc-500 active:scale-[0.995] dark:border-zinc-700 dark:hover:border-zinc-600 dark:active:border-zinc-500'
                            }`}
                        >
                            {!selectedFile && (
                                <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[calc(1rem-2px)]'>
                                    <motion.div
                                        aria-hidden='true'
                                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                        className='pointer-events-none absolute left-1/2 top-1/2 z-0 h-[500%] w-[500%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500'
                                        style={{
                                            background:
                                                theme === 'light' ? 'conic-gradient(from 0deg, transparent 72%, rgba(82,82,91,0.88) 84%, rgba(39,39,42,0.72) 87%, transparent 98%)' : 'conic-gradient(from 0deg, transparent 72%, rgba(161,161,170,0.9) 84%, rgba(113,113,122,0.72) 87%, transparent 98%)',
                                        }}
                                    />

                                    <motion.div
                                        aria-hidden='true'
                                        animate={prefersReducedMotion ? {} : { rotate: -360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                        className='pointer-events-none absolute left-1/2 top-1/2 z-0 h-[500%] w-[500%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500'
                                        style={{
                                            background:
                                                theme === 'light'
                                                    ? 'conic-gradient(from 0deg, transparent 40%, rgba(113,113,122,0.7) 50%, rgba(63,63,70,0.58) 53%, transparent 61%)'
                                                    : 'conic-gradient(from 0deg, transparent 40%, rgba(228,228,231,0.62) 50%, rgba(161,161,170,0.5) 53%, transparent 61%)',
                                        }}
                                    />
                                </div>
                            )}

                            <div
                                className={`relative z-10 flex min-h-55 w-full flex-col max-[1310px]:min-h-48 max-[549.9px]:min-h-44 items-center justify-center rounded-[calc(1rem-2px)] px-8 py-7 max-[1310px]:px-6 max-[1310px]:py-6 max-[549.9px]:px-5 max-[549.9px]:py-5 max-[449.9px]:px-4 max-[449.9px]:py-4 transition-colors duration-300 ${isDragging ? 'bg-zinc-50/90 dark:bg-zinc-900/90' : 'bg-white/80 dark:bg-black/80'}`}
                            >
                                <div
                                    aria-hidden='true'
                                    className={`pointer-events-none absolute inset-0 z-0 bg-size-[16px_16px] transition-opacity duration-500 opacity-100 ${
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
                                    className={`relative z-20 flex h-14 w-14 shrink-0 max-[1310px]:h-12 max-[1310px]:w-12 max-[549.9px]:h-10 max-[549.9px]:w-10 max-[449.9px]:h-9 max-[449.9px]:w-9 items-center justify-center rounded-full transition-all duration-200 ${
                                        selectedFile ? 'bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700' : isDragging ? 'bg-zinc-200 ring-2 ring-zinc-300 dark:bg-zinc-700 dark:ring-zinc-600' : 'bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700'
                                    }`}
                                >
                                    {selectedFile ? (
                                        <FileText className='h-6 w-6 text-zinc-600 max-[1310px]:h-5 max-[1310px]:w-5 max-[549.9px]:h-4.5 max-[549.9px]:w-4.5 max-[449.9px]:h-4 max-[449.9px]:w-4 dark:text-zinc-300' />
                                    ) : (
                                        <UploadCloud className='h-6 w-6 text-zinc-600 max-[1310px]:h-5 max-[1310px]:w-5 dark:text-zinc-300 transition-transform duration-300' />
                                    )}
                                </div>
                                <div className='relative z-20 mt-2.5 w-full'>
                                    <h3 className='mx-auto max-w-[90%] truncate text-[18px] font-semibold text-zinc-900 dark:text-zinc-100 max-[549.9px]:text-[16px] max-[449.9px]:text-[14px] max-[399.9px]:text-[13px]'>{selectedFile ? selectedFile.name : 'Upload your resume'}</h3>

                                    <p className='mx-auto mt-1.5 max-w-[95%] text-sm leading-5 text-zinc-500 dark:text-zinc-400 max-[549.9px]:text-[12.5px] max-[449.9px]:text-[11.5px] max-[449.9px]:leading-4.5 max-[399.9px]:text-[11px]'>
                                        {selectedFile ? (
                                            <>
                                                <span className='hidden max-[549.9px]:inline'>Choose your target role — your analysis will be tailored to it.</span>
                                                <span className='max-[549.9px]:hidden'>Choose the role you're targeting — your analysis will be tailored to it.</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className='max-[449.9px]:hidden'>Drag and drop your PDF here, or click to browse.</span>
                                                <span className='hidden max-[449.9px]:inline'>Click to select your PDF.</span>
                                            </>
                                        )}
                                    </p>

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
                                <div className='relative z-20 mt-1 w-full'>
                                    {selectedFile && (
                                        <div className='w-full max-w-full *:w-full [&_input::placeholder]:text-[14px] max-[549.9px]:[&_input::placeholder]:text-[13.5px] max-[449.9px]:[&_input::placeholder]:text-[13px] max-[399.9px]:[&_input::placeholder]:text-[12px]'>
                                            <TargetRoleSelector value={targetRole} onChange={setTargetRole} onSelectionChange={setIsRoleSelected} onEnter={handleAnalyze} isSelected={isRoleSelected} />
                                        </div>
                                    )}
                                    {selectedFile ? (
                                        <>
                                            <div className='mt-2.5 flex w-full min-w-0 gap-2.5 max-[549.9px]:gap-1.5'>
                                                <button
                                                    type='button'
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        fileInputRef.current?.click();
                                                    }}
                                                    className='inline-flex h-12 min-w-0 shrink-0 cursor-pointer max-[1310px]:h-11 max-[549.9px]:h-9 max-[549.9px]:w-10 max-[549.9px]:flex-none max-[549.9px]:px-0 max-[549.9px]:text-[12.5px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:border-zinc-400 active:bg-zinc-100 active:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:border-zinc-600 dark:active:bg-zinc-800 dark:active:text-zinc-100'
                                                >
                                                    <UploadCloud className='h-3.5 w-3.5' />
                                                    <span className='max-[549.9px]:hidden'>Change PDF</span>
                                                </button>

                                                <div className='group/analyze relative min-w-0 flex-1'>
                                                    <button
                                                        type='button'
                                                        disabled={!isRoleSelected}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleAnalyze();
                                                        }}
                                                        className={`group/btn inline-flex h-12 w-full items-center max-[1310px]:h-11 max-[549.9px]:h-9 max-[549.9px]:px-4 max-[549.9px]:text-[12.5px] max-[449.9px]:text-[12px] justify-center gap-2 rounded-xl px-5 font-medium transition-all duration-200 focus:outline-none min-w-0 ${
                                                            isRoleSelected
                                                                ? 'cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300'
                                                                : 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                                                        }`}
                                                    >
                                                        <span>Analyze Resume</span>

                                                        <ChevronRight className={`h-4 w-4 transition-transform duration-300 ease-out ${isRoleSelected ? 'group-hover/btn:translate-x-1.5 group-active/btn:translate-x-1.5' : ''}`} />
                                                    </button>

                                                    {!isRoleSelected && (
                                                        <div className='pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover/analyze:translate-y-0 group-hover/analyze:opacity-100'>
                                                            <div className='whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900'>Select a target role to continue</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {!isRoleSelected && <p className='mt-1.5 text-center text-[12px] font-medium text-zinc-400 max-[1069.9px]:block min-[1070px]:hidden max-[449.9px]:text-[10.5px] dark:text-zinc-500'>Select a target role to continue</p>}
                                        </>
                                    ) : (
                                        <button
                                            type='button'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className='group/btn mx-auto mt-4 inline-flex h-12 w-full max-w-60 max-[1310px]:h-11 max-[1310px]:max-w-52 max-[549.9px]:mt-3 max-[549.9px]:h-10 max-[549.9px]:max-w-42 max-[549.9px]:px-5 max-[549.9px]:text-[13px] max-[449.9px]:text-[12px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 font-bold text-white transition-all duration-200 hover:bg-zinc-800 active:bg-zinc-700 focus:outline-none focus:ring-0 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300'
                                        >
                                            <span>Select PDF</span>
                                            <ChevronRight className='h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5 group-active/btn:translate-x-1.5' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 pl-1 flex flex-nowrap items-center justify-center gap-x-3 max-[1150px]:gap-x-2 max-[1069.9px]:gap-x-4 whitespace-nowrap text-[13px] font-medium text-zinc-600 dark:text-zinc-400 max-[1069.9px]:text-[14px] max-[649.9px]:text-[12.5px] max-[549.9px]:hidden'>
                            <span className='flex items-center gap-2 max-[1150px]:gap-1.5 max-[1150px]:text-[13px] max-[1069.9px]:text-[14px] max-[649.9px]:text-[12.5px]'>
                                <ShieldCheck className='h-4 w-4 max-[1150px]:h-3.5 max-[1150px]:w-3.5 text-zinc-500 dark:text-zinc-400' />
                                Private by default
                            </span>
                            <span className='h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800' />
                            <span className='flex items-center gap-2 max-[1150px]:gap-1.5 max-[1150px]:text-[13px] max-[1069.9px]:text-[14px] max-[649.9px]:text-[12.5px]'>
                                <Gauge className='h-4 w-4 max-[1150px]:h-3.5 max-[1150px]:w-3.5 text-zinc-500 dark:text-zinc-400' />
                                ATS-aware analysis
                            </span>
                            <span className='h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800' />
                            <span className='flex items-center gap-2 max-[1150px]:gap-1.5 max-[1150px]:text-[13px] max-[1069.9px]:text-[14px] max-[649.9px]:text-[12.5px]'>
                                <CheckCircle2 className='h-4 w-4 max-[1150px]:h-3.5 max-[1150px]:w-3.5 text-zinc-500 dark:text-zinc-400' />
                                Recruiter-focused feedback
                            </span>
                        </div>

                        <div className='mt-4 max-[399.9px]:mt-3 hidden w-fit mx-auto items-center justify-center whitespace-nowrap text-[12px] max-[399.9px]:text-[11px] font-thin text-zinc-600 dark:text-zinc-400 max-[549.9px]:text-[12.5px] max-[549.9px]:flex'>
                            <span>Private by default</span>
                            <span className='mx-2 text-zinc-500 dark:text-zinc-400'>·</span>
                            <span>ATS-aware</span>
                            <span className='mx-2 text-zinc-500 dark:text-zinc-400'>·</span>
                            <span>Recruiter-focused</span>
                        </div>
                    </div>
                    <div className='relative flex items-center justify-center lg:justify-end max-[1310px]:justify-center max-[1069.9px]:hidden'>
                        <div className='relative w-full max-w-md max-[1310px]:max-w-105'>
                            <div className='absolute -inset-10 -z-10 rounded-full bg-zinc-100 dark:bg-zinc-800/30 blur-3xl' />
                            <div className='relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50'>
                                <div className='flex items-center justify-between whitespace-nowrap border-b border-zinc-100 dark:border-zinc-800/80 px-4 py-3'>
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
                                <div className='relative h-144 overflow-hidden max-[1310px]:h-135.25 bg-zinc-50 dark:bg-zinc-900/50'>
                                    <img src='/resume-preview.png' alt='Resume preview skeleton' className='absolute left-1/2 top-0 w-[calc(100%+2px)] -translate-x-1/2 -translate-y-px scale-[1.01] select-none opacity-90 dark:opacity-75 dark:invert' draggable={false} />
                                </div>
                            </div>
                            <div className='animate-float-a absolute -right-7 -top-5 w-36 max-[1310px]:-right-5 max-[1310px]:-top-4 max-[1310px]:w-32 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
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
                            <div className='animate-float-b absolute -left-10 top-[32%] w-40 max-[1310px]:-left-7 max-[1310px]:w-32 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>Hire Rate</span>
                                    <CheckCircle2 className='h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100' />
                                </div>
                                <div className='mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100'>Very High</div>
                            </div>
                            <div className='animate-float-a absolute -left-6 bottom-18 w-36 max-[1310px]:-left-4 max-[1310px]:bottom-14 max-[1310px]:w-32 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>Best Skill</div>
                                <div className='mt-1 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>React</div>
                            </div>
                            <div className='animate-float-b absolute -bottom-6 right-0 w-40 max-[1310px]:-bottom-5 max-[1310px]:w-32 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
                                <div className='font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>Improve</div>
                                <div className='mt-1 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>Docker</div>
                            </div>
                            <div className='animate-float-c absolute -right-10 top-[46%] w-44 max-[1310px]:-right-7 max-[1310px]:w-36 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40'>
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
