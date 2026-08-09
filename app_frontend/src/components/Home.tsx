import { UploadCloud, CheckCircle2, FileText, Gauge, ChevronRight, SunMedium, Moon, ShieldCheck, Cpu, Loader2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useTheme } from '../hooks/useTheme.ts';
import { uploadResume } from '../services/uploadResume.ts';
import TargetRoleSelector from './TargetRoleSelector';

const ANALYSIS_HEADING = 'Understanding your resume';

export default function Home() {
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [isRoleSelected, setIsRoleSelected] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

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

    const [analysisStep, setAnalysisStep] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const headlinePhrases = ['resume.', 'interviews.', 'career.'];
    const [headlineIndex, setHeadlineIndex] = useState(0);

    const navigate = useNavigate();
    const prefersReducedMotion = Boolean(useReducedMotion());

    const overlayRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRafRef = useRef<number | null>(null);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setHeadlineIndex((current) => (current + 1) % headlinePhrases.length);
        }, 3200);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAnalyzing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isAnalyzing]);

    useEffect(() => {
        if (!isAnalyzing) return;

        const interval = window.setInterval(() => {
            setAnalysisStep((current) => {
                if (current >= analysisSteps.length - 1) {
                    return current;
                }
                return current + 1;
            });
        }, 1800);

        return () => window.clearInterval(interval);
    }, [isAnalyzing]);

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

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const lineColor = 'rgba(244,244,245,0.14)';
        const lineColorStrong = 'rgba(244,244,245,0.32)';
        const scanColor = 'rgba(255,255,255,0.85)';

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let width = 0;
        let height = 0;

        const lineWidths: number[] = Array.from({ length: 12 }, (_, i) => {
            const seed = Math.sin(i * 12.9898) * 43758.5453;
            return 0.35 + (seed - Math.floor(seed)) * 0.55;
        });

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        let scanProgress = prefersReducedMotion ? 0.5 : 0;
        let lastTime = performance.now();

        const draw = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;

            ctx.clearRect(0, 0, width, height);

            const paddingX = 14;
            const paddingY = 16;
            const lineHeight = (height - paddingY * 2) / lineWidths.length;
            const lineThickness = Math.max(1.4, lineHeight * 0.26);

            lineWidths.forEach((w, i) => {
                const y = paddingY + i * lineHeight + lineHeight / 2;
                const lineEndX = paddingX + (width - paddingX * 2) * w;

                ctx.strokeStyle = lineColor;
                ctx.lineWidth = lineThickness;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(paddingX, y);
                ctx.lineTo(lineEndX, y);
                ctx.stroke();

                const scanY = scanProgress * height;
                const distance = Math.abs(scanY - y);
                const band = lineHeight * 1.4;

                if (distance < band) {
                    const strength = 1 - distance / band;
                    ctx.strokeStyle = lineColorStrong;
                    ctx.globalAlpha = strength;
                    ctx.beginPath();
                    ctx.moveTo(paddingX, y);
                    ctx.lineTo(lineEndX, y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });

            if (!prefersReducedMotion) {
                const scanY = scanProgress * height;
                const gradient = ctx.createLinearGradient(0, scanY - 16, 0, scanY + 16);
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(0.5, scanColor);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, scanY - 16, width, 32);

                scanProgress += delta * 0.00035;
                if (scanProgress > 1.2) scanProgress = -0.2;

                canvasRafRef.current = requestAnimationFrame(draw);
            }
        };

        if (prefersReducedMotion) {
            draw(performance.now());
        } else {
            canvasRafRef.current = requestAnimationFrame(draw);
        }

        const handleResize = () => resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvasRafRef.current) cancelAnimationFrame(canvasRafRef.current);
        };
    }, [isAnalyzing, theme, prefersReducedMotion]);

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
            alert('Please select a PDF file.');
            return;
        }
        setSelectedFile(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        handleFile(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        handleFile(file);
    };

    const handleAnalyze = async () => {
        const trimmedRole = targetRole.trim();

        if (!selectedFile || !isRoleSelected) return;

        setIsAnalyzing(true);
        setIsComplete(false);
        setAnalysisStep(0);

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

            if (!response.ok) {
                throw new Error(`Analysis request failed: ${response.status}`);
            }

            const result = await response.json();

            console.log('Resume analysis completed\nAnalysis result:', result);

            setAnalysisStep(analysisSteps.length - 1);
            setIsComplete(true);

            await playCompletionAnimation();
            navigate('/story');
        } catch (error) {
            console.error('Resume analysis failed:', error);
            setIsComplete(false);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className='h-screen w-full overflow-hidden select-none bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased transition-colors duration-300'>
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
                        className='fixed inset-0 z-[100] flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 text-zinc-100 font-sans'
                    >
                        {/* Background Grid & Monochrome Radial Orbs */}
                        <div className='absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]' />
                        <div className='pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02] blur-[120px]' />
                        <div className='pointer-events-none absolute left-1/2 top-[40%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-zinc-400/[0.04] blur-[80px]' />

                        <div className='relative z-10 flex w-full max-w-2xl flex-col items-center'>
                            {/* Top Badge */}
                            <div data-gsap='status' className='mb-12 inline-flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 backdrop-blur-md shadow-lg'>
                                <Cpu className='h-4 w-4 text-zinc-300' />
                                <span className='font-mono text-[11px] font-medium uppercase tracking-widest text-zinc-300'>AI Engine Active</span>
                            </div>

                            {/* Central Glass Card */}
                            <div data-gsap='panel' className='relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl'>
                                {/* White/Zinc Corner Accents */}
                                <div className='absolute -left-[1px] -top-[1px] h-4 w-4 rounded-tl-3xl border-l-2 border-t-2 border-zinc-400/60' />
                                <div className='absolute -right-[1px] -top-[1px] h-4 w-4 rounded-tr-3xl border-r-2 border-t-2 border-zinc-400/60' />
                                <div className='absolute -bottom-[1px] -left-[1px] h-4 w-4 rounded-bl-3xl border-b-2 border-l-2 border-zinc-400/60' />
                                <div className='absolute -bottom-[1px] -right-[1px] h-4 w-4 rounded-br-3xl border-b-2 border-r-2 border-zinc-400/60' />

                                {/* Document Scanner Area */}
                                <div className='mx-auto relative h-52 w-40 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner'>
                                    <canvas ref={canvasRef} className='h-full w-full' />
                                </div>

                                {/* Dynamic Progress Bar */}
                                <div className='mt-10 w-full'>
                                    <div className='flex justify-between items-center mb-2.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400'>
                                        <span>Phase {analysisStep + 1} of 4</span>
                                        <span className='text-zinc-200'>{Math.round(((analysisStep + 1) / 4) * 100)}%</span>
                                    </div>
                                    <div className='h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden'>
                                        <motion.div className='h-full bg-white dark:bg-zinc-100' initial={{ width: 0 }} animate={{ width: `${((analysisStep + 1) / 4) * 100}%` }} transition={{ duration: 0.8, ease: 'easeInOut' }} />
                                    </div>
                                </div>

                                {/* Step Messaging */}
                                <div className='mt-8 text-center min-h-[4.5rem]'>
                                    <AnimatePresence mode='wait'>
                                        <motion.div key={analysisStep} initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                                            <h2 className='text-xl font-semibold tracking-tight text-white'>{analysisMessages[analysisStep].title}</h2>
                                            <p className='mt-2 text-sm text-zinc-400'>{analysisMessages[analysisStep].subtitle}</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Target Role Pill */}
                            <div data-gsap='role' className='mt-10 flex flex-col items-center'>
                                <span className='text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-3'>Tailoring Analysis For</span>
                                <div className='inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-5 py-2 shadow-lg backdrop-blur-sm'>
                                    <span className='relative flex h-2 w-2'>
                                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-75'></span>
                                        <span className='relative inline-flex h-2 w-2 rounded-full bg-zinc-200'></span>
                                    </span>
                                    <span className='text-sm font-medium text-zinc-200'>{targetRole}</span>
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div data-gsap='footer' className='absolute bottom-10 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500'>
                                {isComplete ? (
                                    <span className='text-zinc-200'>Analysis complete</span>
                                ) : (
                                    <>
                                        <Loader2 className='h-3.5 w-3.5 animate-spin text-zinc-400' />
                                        <span>Analyzing · {elapsedSeconds}s</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.header className={`fixed inset-x-0 top-0 z-50 ${isAnalyzing ? 'pointer-events-none' : ''}`} animate={{ opacity: isAnalyzing ? 0 : 1, scale: prefersReducedMotion ? 1 : isAnalyzing ? 0.98 : 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} aria-hidden={isAnalyzing}>
                <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8'>
                    <div className='inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 backdrop-blur-md px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80'>
                        <span className='h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' />
                        <span className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400'>AI Resume Analysis</span>
                    </div>
                    <div className='flex items-center gap-2'>
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
                            onClick={toggleTheme}
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
                                            transition={{
                                                duration: 0.45,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
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
                            onDragOver={!selectedFile ? handleDragOver : undefined}
                            onDragLeave={!selectedFile ? handleDragLeave : undefined}
                            onDrop={!selectedFile ? handleDrop : undefined}
                            className={`group mt-6 flex min-h-55 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-7 text-center transition-all duration-200 ${
                                selectedFile
                                    ? 'cursor-default border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/40'
                                    : isDragging
                                      ? 'cursor-copy border-zinc-500 bg-zinc-100/80 dark:border-zinc-500 dark:bg-zinc-800/80'
                                      : 'cursor-pointer border-zinc-200 bg-white/50 hover:border-zinc-400 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80'
                            }`}
                        >
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
                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                                    selectedFile ? 'bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700' : isDragging ? 'bg-zinc-200 ring-2 ring-zinc-300 dark:bg-zinc-700 dark:ring-zinc-600' : 'bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700'
                                }`}
                            >
                                {selectedFile ? <FileText className='h-6 w-6 text-zinc-600 dark:text-zinc-300' /> : <UploadCloud className='h-6 w-6 text-zinc-600 dark:text-zinc-300 transition-transform duration-300' />}
                            </div>
                            <div className='mt-3 w-full'>
                                <h3 className='mx-auto max-w-[90%] truncate text-base font-semibold text-zinc-900 dark:text-zinc-100'>{selectedFile ? selectedFile.name : isDragging ? 'Drop your PDF here' : 'Upload your resume'}</h3>

                                <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>{selectedFile ? `Choose the role you're targeting — your analysis will be tailored to it.` : 'Drag and drop your PDF here, or click to browse.'}</p>
                            </div>
                            {selectedFile && <TargetRoleSelector value={targetRole} onChange={setTargetRole} onSelectionChange={setIsRoleSelected} />}
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
