import { UploadCloud, CheckCircle2, FileText, Gauge, ChevronRight, SunMedium, Moon, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme.ts';
import { uploadResume } from '../services/uploadResume.ts';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isDragging, setIsDragging] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

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
        if (!selectedFile) return;

        try {
            console.log('Uploading resume...');

            const pdfUrl = await uploadResume(selectedFile);

            console.log('Resume uploaded successfully');
            console.log('PDF URL:', pdfUrl);

            console.log('Starting resume analysis...');

            const response = await fetch('http://localhost:3000/resume/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pdfUrl,
                    jobTitle: 'Software Engineer',
                }),
            });

            if (!response.ok) {
                throw new Error(`Analysis request failed: ${response.status}`);
            }

            const result = await response.json();

            console.log('Resume analysis completed');
            console.log('Analysis result:', result);

            setAnalysisResult(result);

            navigate('/story', {
                state: {
                    analysisResult: result,
                },
            });
        } catch (error) {
            console.error('Resume analysis failed:', error);
        }
    };

    return (
        <div className='h-screen w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 transition-colors duration-300'>
            <header className='fixed inset-x-0 top-0 z-50'>
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
                            className='flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:ring-zinc-300 hover:text-zinc-900 dark:ring-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:ring-zinc-700 dark:hover:text-zinc-100'
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
                            className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                        >
                            {theme === 'light' ? <Moon size={18} strokeWidth={1.8} /> : <SunMedium size={18} strokeWidth={1.8} />}
                        </button>
                    </div>
                </div>
            </header>
            <section className='relative flex h-screen items-center overflow-hidden'>
                <div className='relative mx-auto grid h-screen w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pt-0'>
                    <div className='flex flex-col justify-center pb-10 lg:pb-0'>
                        <h1 className='text-4xl font-semibold text-zinc-900 dark:text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]' style={{ fontFamily: 'Geist, sans-serif' }}>
                            Better <span className='text-zinc-400 dark:text-zinc-500 italic'>resume.</span>
                            <br />
                            Better <span className='text-zinc-400 dark:text-zinc-500 italic'>interviews.</span>
                            <br />
                            Better <span className='text-zinc-400 dark:text-zinc-500 italic'>career.</span>
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
                            <div className='mt-4 w-full'>
                                <h3 className='mx-auto max-w-[90%] truncate text-base font-semibold text-zinc-900 dark:text-zinc-100'>{selectedFile ? selectedFile.name : isDragging ? 'Drop your PDF here' : 'Upload your resume'}</h3>

                                <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>{selectedFile ? 'PDF selected and ready to analyze.' : 'Drag and drop your PDF here, or click to browse.'}</p>
                            </div>
                            {selectedFile ? (
                                <div className='mt-6 flex w-full max-w-60 flex-col gap-2.5'>
                                    <button
                                        type='button'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleAnalyze();
                                        }}
                                        className='group/btn inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 font-medium text-white transition-all duration-200 hover:bg-zinc-800 focus:outline-none focus:ring-0 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                                    >
                                        <span>Analyze Resume</span>
                                        <ChevronRight className='h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5' />
                                    </button>
                                    <button
                                        type='button'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className='inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                    >
                                        <UploadCloud className='h-3.5 w-3.5' />
                                        <span>Change PDF</span>
                                    </button>
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
                                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60'></span>
                                            <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span>
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
                                    <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
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
                                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60' />
                                        <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
                                    </span>
                                    <span className='text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'>Generating...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
