import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowUp, FileText, Moon, Paperclip, Sparkles, SunMedium, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.ts';
import { uploadResume } from '../services/uploadResume.ts';

type Message = {
    id: number;
    role: 'user' | 'assistant';
    content: string;
};

const suggestions = ['What are my strongest skills?', 'What should I improve in my resume?', 'Is my experience relevant for this role?'];
const heroWords = ['resume', 'experience', 'skills', 'story'];
const CHAT_ANALYSIS_ROLE = 'General Resume Review';

export default function Chat() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const prefersReducedMotion = Boolean(useReducedMotion());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileErrorTimeoutRef = useRef<number | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [showFileError, setShowFileError] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (fileErrorTimeoutRef.current !== null) {
                window.clearTimeout(fileErrorTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (prefersReducedMotion || selectedFile) return;

        const interval = window.setInterval(() => {
            setWordIndex((current) => (current + 1) % heroWords.length);
        }, 2600);

        return () => window.clearInterval(interval);
    }, [prefersReducedMotion, selectedFile]);

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

    const showFileErrorMessage = () => {
        setShowFileError(true);

        if (fileErrorTimeoutRef.current !== null) {
            window.clearTimeout(fileErrorTimeoutRef.current);
        }

        fileErrorTimeoutRef.current = window.setTimeout(() => {
            setShowFileError(false);
            fileErrorTimeoutRef.current = null;
        }, 3500);
    };

    const handleFile = async (file: File) => {
        if (isAnalyzingResume) return;

        if (file.type !== 'application/pdf') {
            showFileErrorMessage();
            return;
        }

        setShowFileError(false);
        setAnalysisError('');
        setIsAnalyzingResume(true);

        if (fileErrorTimeoutRef.current !== null) {
            window.clearTimeout(fileErrorTimeoutRef.current);
            fileErrorTimeoutRef.current = null;
        }

        try {
            console.log('Uploading resume for chat validation...');

            const uploadedPdfUrl = await uploadResume(file);

            console.log('Resume uploaded successfully');
            console.log('Starting resume validation/analysis...');

            const response = await fetch('http://localhost:3000/resume/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pdfUrl: uploadedPdfUrl,
                    jobTitle: CHAT_ANALYSIS_ROLE,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData?.message || responseData?.error || responseData?.detail || 'Unable to analyze this resume');
            }

            console.log('Resume validated successfully');

            setPdfUrl(uploadedPdfUrl);
            setSelectedFile(file);

            setMessages([
                {
                    id: Date.now(),
                    role: 'assistant',
                    content: "I'm ready. Ask me anything about your resume, experience, skills, or career direction.",
                },
            ]);
        } catch (error) {
            console.error('Resume validation failed:', error);

            const message = error instanceof Error ? error.message : 'Unable to analyze this resume';

            setSelectedFile(null);
            setPdfUrl('');
            setMessages([]);
            setAnalysisError(message);

            if (fileErrorTimeoutRef.current !== null) {
                window.clearTimeout(fileErrorTimeoutRef.current);
            }

            fileErrorTimeoutRef.current = window.setTimeout(() => {
                setAnalysisError('');
                fileErrorTimeoutRef.current = null;
            }, 4500);
        } finally {
            setIsAnalyzingResume(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        void handleFile(file);
        event.currentTarget.value = '';
    };

    const handleDragEnter = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();

        if (selectedFile || isAnalyzingResume) return;
        if (!event.dataTransfer.types.includes('Files')) return;

        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();

        if (selectedFile || isAnalyzingResume) return;
        if (!event.dataTransfer.types.includes('Files')) return;

        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();

        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (selectedFile || isAnalyzingResume) return;
        const file = event.dataTransfer.files?.[0];

        if (!file) return;
        void handleFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPdfUrl('');
        setMessages([]);
        setInput('');
        setIsSending(false);
        setAnalysisError('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || !selectedFile || !pdfUrl || isSending) return;

        setIsSending(true);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: trimmed,
        };

        setMessages((current) => [...current, userMessage]);

        try {
            const response = await fetch('http://localhost:3000/resume/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pdfUrl,
                    message: trimmed,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(typeof data.error === 'string' ? data.error : 'Unable to process your message.');
            }

            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.data?.response ?? data.data?.answer ?? data.data?.message ?? 'I received your message.',
                },
            ]);
        } catch (error) {
            console.error('Chat request failed:', error);

            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleSuggestion = (suggestion: string) => {
        setInput(suggestion);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void sendMessage();
        }
    };

    const isLanding = !selectedFile;

    return (
        <main
            className='relative flex h-dvh w-full flex-col overflow-hidden overscroll-none bg-white text-zinc-950 selection:bg-[#EAF5FF] selection:text-[#3999FF] dark:bg-black dark:text-zinc-100 dark:selection:bg-[#010B1B] dark:selection:text-[#3999FF]'
            onDragEnter={isLanding && !isAnalyzingResume ? handleDragEnter : undefined}
            onDragOver={isLanding && !isAnalyzingResume ? handleDragOver : undefined}
            onDragLeave={isLanding && !isAnalyzingResume ? handleDragLeave : undefined}
            onDrop={isLanding && !isAnalyzingResume ? handleDrop : undefined}
        >
            {!selectedFile && (
                <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden'>
                    <div className='absolute inset-0 bg-[radial-gradient(ellipse_68%_52%_at_50%_32%,rgba(228,228,231,0.9)_0%,rgba(244,244,245,0.65)_34%,rgba(250,250,250,0.25)_56%,rgba(255,255,255,0)_76%)] dark:bg-[radial-gradient(ellipse_65%_55%_at_50%_32%,transparent_0%,black_78%)]' />

                    <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_68%_52%_at_50%_32%,black_0%,transparent_76%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] dark:mask-[radial-gradient(ellipse_65%_55%_at_50%_32%,black_0%,transparent_78%)]' />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: [0, 40, -20, 0], y: [0, -24, 18, 0] }}
                        transition={prefersReducedMotion ? { duration: 1.2 } : { opacity: { duration: 1.2 }, x: { duration: 26, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 26, repeat: Infinity, ease: 'easeInOut' } }}
                        className='absolute left-1/2 top-[26%] h-155 w-225 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-300/10 blur-[130px] dark:bg-zinc-700/25'
                    />
                </div>
            )}

            <header className='absolute inset-x-0 top-0 z-20'>
                <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/85 via-white/35 to-transparent dark:from-black dark:via-black/70 dark:to-transparent' />

                <div className='relative z-10 mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6'>
                    <button type='button' onClick={() => navigate('/')} className='group inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100'>
                        <ArrowLeft className='h-4 w-4 -translate-x-0.5 transition-transform duration-300 group-hover:-translate-x-1' strokeWidth={1.8} />

                        <span className='select-none'>Home</span>
                    </button>

                    <button
                        type='button'
                        onClick={toggleTheme}
                        aria-label='Toggle theme'
                        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white/70 text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-zinc-800 dark:bg-black/70 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-black dark:hover:text-zinc-100'
                    >
                        {theme === 'light' ? <Moon className='h-4.25 w-4.25' strokeWidth={1.8} /> : <SunMedium className='h-4.25 w-4.25' strokeWidth={1.8} />}
                    </button>
                </div>
            </header>

            <div className='relative z-10 min-h-0 flex-1'>
                <AnimatePresence mode='wait'>
                    {!selectedFile ? (
                        <motion.section
                            key='landing'
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className='flex h-full items-center justify-center px-6'
                        >
                            <div className='w-full max-w-3xl text-center'>
                                <motion.div
                                    initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className='mx-auto mb-7 inline-flex select-none items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/50 dark:text-zinc-500'
                                >
                                    <span className='relative flex h-1.5 w-1.5'>
                                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60 dark:bg-zinc-500' />
                                        <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400' />
                                    </span>
                                    Resume Intelligence
                                </motion.div>

                                <motion.div initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}>
                                    <h1 className='text-[3.4rem] font-light leading-[0.94] tracking-tight text-zinc-950 sm:text-[4.5rem] lg:text-[5.8rem] dark:text-white' style={{ fontFamily: 'Fraunces, serif', fontWeight: 300 }}>
                                        Let's talk about
                                    </h1>

                                    <div className='relative flex h-22 items-center justify-center overflow-hidden sm:h-28'>
                                        <AnimatePresence mode='wait' initial={false}>
                                            <motion.h2
                                                key={heroWords[wordIndex]}
                                                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -36 }}
                                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                                className='whitespace-nowrap bg-linear-to-b from-zinc-500 to-zinc-400 bg-clip-text px-3.5 py-2.5 text-center text-[3.4rem] font-light italic leading-none tracking-tighter text-transparent sm:text-[4.5rem] lg:text-[5.8rem] dark:from-zinc-300 dark:to-zinc-500'
                                                style={{ fontFamily: 'Fraunces, serif' }}
                                            >
                                                your {heroWords[wordIndex]}
                                            </motion.h2>
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                <motion.p
                                    initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
                                    className='mx-auto mt-7 max-w-2xl text-[15px] font-light leading-7 tracking-wide text-zinc-500 sm:text-[16px] sm:leading-7 dark:text-zinc-500'
                                >
                                    Upload your resume and let AI understand your experience, strengths, skills, and career direction before you start the conversation.
                                </motion.p>

                                <motion.div initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.36 }} className='mx-auto mt-6 w-full max-w-2xl'>
                                    <div className='relative flex w-full flex-col items-center'>
                                        <input ref={fileInputRef} type='file' accept='application/pdf,.pdf' onChange={handleFileChange} className='hidden' />

                                        <div
                                            onClick={() => {
                                                if (!isAnalyzingResume) {
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                            className={`group relative z-10 w-[85%] max-w-xl cursor-pointer select-none overflow-hidden rounded-3xl border border-dashed border-zinc-800/80 transition-all duration-300 dark:border-zinc-800 ${
                                                isDragging ? 'scale-[1.01] border-zinc-600 dark:border-zinc-600' : ''
                                            } ${isAnalyzingResume ? 'cursor-wait' : ''}`}
                                        >
                                            <motion.div
                                                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                                className='absolute -inset-full opacity-0 transition-opacity duration-500 group-hover:opacity-100'
                                                style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(161,161,170,0.9) 85%, transparent 100%)' }}
                                            />

                                            <motion.div
                                                animate={prefersReducedMotion ? {} : { rotate: -360 }}
                                                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                                className='absolute -inset-full opacity-0 transition-opacity duration-500 group-hover:opacity-100'
                                                style={{ background: 'conic-gradient(from 0deg, transparent 40%, rgba(228,228,231,0.6) 50%, transparent 60%)' }}
                                            />

                                            <div className={`relative flex min-h-55 flex-col items-center justify-center overflow-hidden rounded-[calc(1.5rem-1px)] px-5 py-6 transition-colors duration-300 sm:px-8 ${isDragging ? 'bg-zinc-50/90 dark:bg-zinc-900/90' : 'bg-white/80 dark:bg-black/80'}`}>
                                                <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-size-[16px_16px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)]' />

                                                <div className='relative z-20 flex flex-col items-center'>
                                                    <div className='relative flex items-center justify-center'>
                                                        <motion.div
                                                            initial={{ scale: 1, opacity: 0.35 }}
                                                            animate={prefersReducedMotion ? { scale: 1, opacity: 0 } : { scale: [1, 1.6, 1.6], opacity: [0, 0.35, 0] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                                            className='pointer-events-none absolute inset-0 rounded-2xl bg-zinc-300 dark:bg-zinc-600'
                                                        />

                                                        <motion.div
                                                            initial={{ scale: 1, opacity: 0.35 }}
                                                            animate={prefersReducedMotion ? { scale: 1, opacity: 0 } : { scale: [1, 1.6, 1.6], opacity: [0, 0.35, 0] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
                                                            className='pointer-events-none absolute inset-0 rounded-2xl bg-zinc-300 dark:bg-zinc-600'
                                                        />

                                                        <motion.div
                                                            animate={isDragging ? { scale: 1.08, y: -3 } : { scale: 1, y: 0 }}
                                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                            className='relative flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-linear-to-br from-white to-zinc-50 text-zinc-600 shadow-sm transition-all duration-300 group-hover:border-zinc-300 group-hover:shadow-md dark:border-zinc-700/80 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300 dark:group-hover:border-zinc-600'
                                                        >
                                                            <FileText className='h-6 w-6' strokeWidth={1.5} />
                                                        </motion.div>
                                                    </div>

                                                    <h3 className='mt-6 text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100'>{isAnalyzingResume ? 'Understanding your resume...' : isDragging ? 'Drop your resume to begin' : 'Upload your resume'}</h3>

                                                    <p className='mt-2 text-sm font-light text-zinc-500 dark:text-zinc-400'>{isAnalyzingResume ? 'AI is checking your document before opening chat' : 'PDF only · drag and drop or click to browse'}</p>

                                                    <AnimatePresence>
                                                        {showFileError && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.92 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.92 }}
                                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                                                className='mx-auto mt-3 flex w-fit items-center justify-center gap-3 rounded-lg border border-rose-200/70 bg-rose-50/70 px-4 py-2 dark:border-rose-900/40 dark:bg-rose-950/30'
                                                            >
                                                                <AlertCircle className='h-3.5 w-3.5 shrink-0 text-rose-500 dark:text-rose-400' strokeWidth={1.8} />

                                                                <div className='text-left'>
                                                                    <p className='mb-0.5 text-[13px] font-medium leading-tight text-rose-700 dark:text-rose-300'>Invalid file type</p>

                                                                    <p className='text-[12px] leading-tight text-rose-500/90 dark:text-rose-400/80'>Please upload a PDF file only</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <AnimatePresence>
                                                        {analysisError && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 4 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -4 }}
                                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                                                className='mx-auto mt-3 flex w-fit max-w-md items-center justify-center gap-3 rounded-lg border border-rose-200/70 bg-rose-50/70 px-4 py-2.5 text-left dark:border-rose-900/40 dark:bg-rose-950/30'
                                                            >
                                                                <AlertCircle className='h-3.5 w-3.5 shrink-0 text-rose-500 dark:text-rose-400' strokeWidth={1.8} />

                                                                <div>
                                                                    <p className='mb-0.5 text-[13px] font-medium leading-tight text-rose-700 dark:text-rose-300'>Invalid resume</p>

                                                                    <p className='text-[12px] leading-5 text-rose-500/90 dark:text-rose-400/80'>{analysisError}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {!isAnalyzingResume && (
                                                        <div className='mt-5 inline-flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white/50 px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-zinc-300 group-hover:bg-white group-hover:text-zinc-950 group-hover:shadow-md dark:border-zinc-800 dark:bg-black/50 dark:text-zinc-400 dark:group-hover:border-zinc-700 dark:group-hover:bg-zinc-900 dark:group-hover:text-zinc-100'>
                                                            <span>Choose PDF</span>

                                                            <ArrowUp className='h-4 w-4 transition-transform duration-300 ease-out' strokeWidth={1.8} />
                                                        </div>
                                                    )}

                                                    {isAnalyzingResume && (
                                                        <div className='mt-5 inline-flex select-none items-center gap-2.5 rounded-full border border-zinc-200 bg-white/50 px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 dark:text-zinc-400'>
                                                            <motion.span
                                                                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                                                                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                                                                className='h-3.5 w-3.5 rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200'
                                                            />

                                                            <span>Checking resume</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.section>
                    ) : (
                        <motion.div key='chat' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className='flex h-full min-h-0 flex-col pt-16'>
                            <div className='min-h-0 flex-1 overflow-y-auto'>
                                <div className='mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 pb-8 pt-6 sm:px-6'>
                                    {/* Active Document Info Card */}
                                    <div className='group mb-2 flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-3 pr-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80'>
                                        <div className='flex items-center gap-3.5'>
                                            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200/50 bg-white text-zinc-600 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-950 dark:text-zinc-300'>
                                                <FileText className='h-5 w-5' strokeWidth={1.5} />
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='truncate text-[14px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100'>{selectedFile.name}</p>
                                                <div className='mt-0.5 flex items-center gap-1.5'>
                                                    <span className='relative flex h-1.5 w-1.5'>
                                                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 dark:bg-emerald-500' />
                                                        <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400' />
                                                    </span>
                                                    <p className='font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-500'>Ready to chat</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={removeFile}
                                            aria-label='Close document'
                                            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors duration-200 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                                        >
                                            <X className='h-4 w-4' strokeWidth={1.5} />
                                        </button>
                                    </div>

                                    {messages.map((message) => (
                                        <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                                            {message.role === 'assistant' ? (
                                                <div className='flex max-w-[88%] items-start gap-4'>
                                                    <div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200/60 bg-linear-to-b from-zinc-50 to-zinc-100 text-zinc-600 shadow-sm dark:border-zinc-800/60 dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-300'>
                                                        <Sparkles className='h-4 w-4' strokeWidth={1.5} />
                                                    </div>
                                                    <div className='space-y-2 pt-1.5 text-[15.5px] leading-relaxed text-zinc-800 dark:text-zinc-200'>{message.content}</div>
                                                </div>
                                            ) : (
                                                <div className='max-w-[85%] rounded-3xl rounded-br-sm bg-zinc-900 px-5 py-3 text-[15px] leading-relaxed text-white shadow-sm dark:bg-zinc-100 dark:text-black'>{message.content}</div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {isSending && (
                                        <div className='flex justify-start'>
                                            <div className='flex items-start gap-4'>
                                                <div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200/60 bg-linear-to-b from-zinc-50 to-zinc-100 text-zinc-600 shadow-sm dark:border-zinc-800/60 dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-300'>
                                                    <Sparkles className='h-4 w-4' strokeWidth={1.5} />
                                                </div>
                                                <div className='flex h-9.5 items-center gap-1.5 px-2 text-zinc-400 dark:text-zinc-600'>
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500' style={{ animationDelay: '0ms' }} />
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500' style={{ animationDelay: '150ms' }} />
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500' style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {messages.length === 1 && (
                                        <div className='ml-12 mt-1'>
                                            <p className='mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500'>Suggested questions</p>
                                            <div className='flex flex-wrap gap-2.5'>
                                                {suggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        type='button'
                                                        onClick={() => handleSuggestion(suggestion)}
                                                        className='rounded-xl border border-zinc-200/80 bg-white/50 px-4 py-2 text-[13px] text-zinc-600 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white hover:text-zinc-900 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/50 dark:text-zinc-400 dark:hover:bg-zinc-950 dark:hover:text-zinc-200'
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} className='h-4' />
                                </div>
                            </div>

                            <div className='mx-auto w-full max-w-3xl shrink-0 px-4 pb-6 pt-2 sm:px-6'>
                                <div className='relative flex w-full items-end gap-2 rounded-[28px] border border-zinc-200 bg-white p-1.5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 focus-within:border-zinc-300 focus-within:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:border-zinc-700'>
                                    <button
                                        type='button'
                                        aria-label='Attach file'
                                        className='mb-1 ml-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
                                    >
                                        <Paperclip className='h-5 w-5' strokeWidth={1.5} />
                                    </button>

                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                        disabled={isSending}
                                        placeholder='Ask anything about your resume...'
                                        className='min-h-11 w-full resize-none bg-transparent py-2.5 text-[15px] leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-100 dark:placeholder:text-zinc-600'
                                        style={{ height: '44px' }}
                                    />

                                    <button
                                        type='button'
                                        onClick={() => void sendMessage()}
                                        disabled={!input.trim() || isSending}
                                        aria-label='Send message'
                                        className='mb-1 mr-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-zinc-800 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600'
                                    >
                                        <ArrowUp className='h-5 w-5' strokeWidth={1.5} />
                                    </button>
                                </div>

                                <p className='mt-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600'>AI can make mistakes · verify important information</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}