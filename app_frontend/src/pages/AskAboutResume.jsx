import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from '../components/Toaster.jsx';
import { supabase } from '../utils/supabase.js';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Upload, X, AlertCircle, ArrowLeft, Send, Sparkles, Bot, User, RotateCcw, MessageCircle } from 'lucide-react';

const MAX_SIZE_BYTES = 1 * 1024 * 1024;
const MAX_SIZE_LABEL = '1 MB';
const BUCKET_NAME = 'resume';

const CHAT_ENDPOINT = 'http://localhost:3000/resume/chat';

const SUGGESTED_PROMPTS = [
    "What's my biggest strength on this resume?",
    'How can I improve my ATS score?',
    'What skills am I missing for this role?',
    'Should I apply to senior-level roles with this resume?',
];

function Spinner({ size = 15 }) {
    return (
        <svg className='animate-spin' width={size} height={size} viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeOpacity='0.3' />
            <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
        </svg>
    );
}

function Background() {
    return null;
}

function TypingDots() {
    return (
        <div className='flex items-center gap-1.5 px-1'>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className='w-1.5 h-1.5 rounded-full bg-[#D9A919]'
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

function ChatBubble({ role, content, isError }) {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isUser ? 'bg-[#1a1a1a] border-[#2a2a2a]' : isError ? 'bg-[#1f0a0a] border-[#3a1515]' : 'bg-[#1a1200] border-[#65531e]'
                }`}
            >
                {isUser ? <User size={14} className='text-[#999]' /> : <Bot size={14} className={isError ? 'text-[#fca5a5]' : 'text-[#D9A919]'} />}
            </div>

            <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-all  ${
                    isUser
                        ? 'bg-[#D9A919] text-black font-medium rounded-tr-sm wrap-break-word'
                        : isError
                          ? 'bg-[#1a0a0a] border border-[#3a1515] text-[#f87171] rounded-tl-sm'
                          : 'bg-[#0e0e0e] border border-[#1f1f1f] text-[#ddd] rounded-tl-sm'
                }`}
            >
                {content}
            </div>
        </motion.div>
    );
}

export default function AskAboutResume() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const sendingRef = useRef(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            toast('Please login to ask about your resume', 'error');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, sending]);

    function validateFile(f) {
        if (!f) return 'No file selected.';
        if (f.type !== 'application/pdf') return 'Only PDF files are allowed.';
        if (f.size > MAX_SIZE_BYTES) return `File too large. Max is ${MAX_SIZE_LABEL}.`;
        return null;
    }

    function handleFileChange(f) {
        const err = validateFile(f);
        if (err) {
            setError(err);
            setFile(null);
            return;
        }
        setError('');
        setFile(f);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        handleFileChange(e.dataTransfer.files[0]);
    }

    async function handleUpload() {
        if (!file) {
            setError('Please select a PDF first.');
            toast('Please select a PDF first.', 'error');
            return;
        }

        setUploading(true);
        setError('');

        const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '-')}`;

        const { data, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
            contentType: 'application/pdf',
            upsert: false,
        });

        if (uploadError) {
            setError(`Upload failed: ${uploadError.message}`);
            toast('Failed to upload resume.', 'error');
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

        const publicUrl = urlData.publicUrl;
        setUploadedUrl(publicUrl);
        toast('Resume uploaded successfully.', 'success');
        setUploading(false);

        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: `I've got your resume loaded — ${file.name}. Ask me anything about it: what to improve, how it stacks up for a role, or what to highlight in an interview.`,
            },
        ]);
    }

    function handleRemoveFile() {
        setFile(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleChangeResume() {
        setUploadedUrl('');
        setFile(null);
        setMessages([]);
        setInput('');
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function resetTextarea() {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }

    async function sendMessage(text) {
        const question = text.trim();
        if (!question || sendingRef.current) return;

        sendingRef.current = true;

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user',
            content: question,
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        resetTextarea();
        setSending(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                CHAT_ENDPOINT,
                {
                    pdfUrl: uploadedUrl,
                    message: question,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const answer = response?.data?.data?.answer ?? "I couldn't generate a response just now.";

            setMessages((prev) => [
                ...prev,
                {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content: answer,
                },
            ]);
        } catch (err) {
            console.error(err);
            toast('Failed to get response from AI.', 'error');
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    isError: true,
                    content: 'Something went wrong answering that. Please try again.',
                },
            ]);
        } finally {
            setSending(false);
            sendingRef.current = false;
            textareaRef.current?.focus();
        }
    }

    function handleInputKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    function autoResizeTextarea(e) {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
    }

    const showSuggestions = messages.length <= 1 && !sending;

    return (
        <div className='relative min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden flex flex-col'>
            <Background />

            {!uploadedUrl && (
                <>
                    <Link to='/' className='group fixed top-6 left-6 flex items-center gap-1.5 text-sm text-[#8a8686] hover:text-[#D9A919] transition-colors duration-200 z-20'>
                        <ArrowLeft size={15} className='duration-300 group-hover:-translate-x-0.5 transition-transform' strokeWidth={2} />
                        Home
                    </Link>

                    <div className='relative z-10 flex items-start justify-center py-12 px-4 min-h-screen w-full'>
                        <div className='w-full max-w-xl mt-8'>
                            <div className='flex items-center gap-4 mb-7'>
                                <div className='w-12 h-12 rounded-2xl bg-[#1a1200] border border-[#65531e] flex items-center justify-center shrink-0'>
                                    <MessageCircle size={22} className='text-[#D9A919]' />
                                </div>
                                <div>
                                    <h1 className='text-2xl font-bold tracking-tight'>
                                        Ask About Your <span className='text-[#D9A919]'>Resume</span>
                                    </h1>
                                    <p className='text-sm text-[#8a8686] mt-0.5'>Upload your PDF · Chat with an AI that's read it</p>
                                </div>
                            </div>

                            <div className='bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl p-6 sm:p-7'>
                                {!file && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragOver(true);
                                        }}
                                        onDragLeave={() => setDragOver(false)}
                                        className={`rounded-xl border-2 border-dashed text-center py-12 px-6 cursor-pointer transition-all duration-200 ${
                                            dragOver ? 'border-[#D9A919] bg-[#161200]' : 'border-[#2a2a2a] bg-[#111] hover:border-[#4a3a10] hover:bg-[#161200]'
                                        }`}
                                    >
                                        <div className='w-14 h-14 mx-auto mb-4 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center'>
                                            <Upload size={22} className='text-[#555]' />
                                        </div>
                                        <p className='text-[15px] font-semibold text-[#ddd] mb-1'>Drag & drop your PDF here</p>
                                        <p className='text-xs text-[#555]'>or click to browse · PDF only · max {MAX_SIZE_LABEL}</p>
                                        <input ref={fileInputRef} type='file' accept='.pdf,application/pdf' className='hidden' onChange={(e) => handleFileChange(e.target.files[0])} />
                                    </div>
                                )}

                                {file && (
                                    <div className='flex items-center gap-3 bg-[#111] border border-[#2a2a2a] rounded-xl p-3.5 mb-4'>
                                        <div className='w-10 h-10 rounded-lg bg-[#1f0a0a] border border-[#3a1515] flex items-center justify-center shrink-0'>
                                            <FileText size={18} className='text-[#ef4444]' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-semibold text-[#ddd] truncate'>{file.name}</p>
                                            <p className='text-xs text-[#555] mb-1.5'>
                                                {formatSize(file.size)} / {MAX_SIZE_LABEL}
                                            </p>
                                            <div className='h-1 rounded-full bg-[#222] overflow-hidden'>
                                                <div
                                                    className='h-full rounded-full transition-all duration-300'
                                                    style={{
                                                        width: `${Math.min((file.size / MAX_SIZE_BYTES) * 100, 100)}%`,
                                                        background: file.size > MAX_SIZE_BYTES * 0.8 ? '#f97316' : '#D9A919',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <button onClick={handleRemoveFile} title='Remove' className='text-[#555] hover:text-[#D9A919] transition-colors duration-200 p-1.5 shrink-0'>
                                            <X size={15} />
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <div className='flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1a0a0a] border border-[#3d1515] text-xs text-[#f87171] mb-4'>
                                        <AlertCircle size={13} className='shrink-0' />
                                        <span className='translate-y-px'>{error}</span>
                                    </div>
                                )}

                                {file && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className='w-full py-2.5 rounded-xl bg-[#D9A919] text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(217,169,25,0.35)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer flex items-center justify-center gap-2'
                                    >
                                        {uploading ? (
                                            <>
                                                <Spinner />
                                                Uploading…
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle size={16} />
                                                Upload & Start Chat
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {uploadedUrl && (
                <div className='relative z-10 flex flex-col w-full h-dvh overflow-hidden'>
                    <div className='shrink-0 border-b border-[#1a1a1a] bg-[#0A0A0A]/95 backdrop-blur-sm'>
                        <div className='max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3 min-w-0'>
                                <Link to='/' className='shrink-0 text-[#8a8686] hover:text-[#D9A919] transition-colors duration-200 p-1 -ml-1' title='Home'>
                                    <ArrowLeft size={17} strokeWidth={2} />
                                </Link>
                                <div className='w-7 h-7 rounded-lg border border-[#3a2f10] bg-[#D9A919]/5 flex items-center justify-center shrink-0'>
                                    <MessageCircle size={14} className='text-[#D9A919]' />
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-[#eee] truncate leading-tight'>Resume Q&A</p>
                                    <p className='text-[11px] text-[#666] truncate leading-tight'>{file?.name || 'Your resume'}</p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 shrink-0'>
                                <button
                                    onClick={() => navigate('/')}
                                    title='Home'
                                    className='w-8 h-8 rounded-lg border border-[#1f1f1f] hover:border-[#4a3a10] text-[#777] hover:text-[#D9A919] flex items-center justify-center transition-colors duration-200 cursor-pointer'
                                >
                                    <ArrowLeft size={14} />
                                </button>

                                <button
                                    onClick={handleChangeResume}
                                    title='Use a different resume'
                                    className='w-8 h-8 rounded-lg border border-[#1f1f1f] hover:border-[#4a3a10] text-[#777] hover:text-[#D9A919] flex items-center justify-center transition-colors duration-200 cursor-pointer'
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 min-h-0 overflow-y-auto' data-lenis-prevent>
                        <div className='max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-col gap-5'>
                            <AnimatePresence initial={false}>
                                {messages.map((m) => (
                                    <ChatBubble key={m.id} role={m.role} content={m.content} isError={m.isError} />
                                ))}
                            </AnimatePresence>

                            {sending && (
                                <div className='flex items-start gap-3'>
                                    <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-[#1a1200] border-[#65531e]'>
                                        <Bot size={14} className='text-[#D9A919]' />
                                    </div>
                                    <div className='bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl rounded-tl-sm px-4 py-3'>
                                        <TypingDots />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {showSuggestions && (
                        <div className='shrink-0 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-3 flex flex-wrap gap-2'>
                            {SUGGESTED_PROMPTS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => sendMessage(p)}
                                    className='text-xs text-[#D9A919] bg-[#161200] border border-[#3a2f10] hover:border-[#65531e] hover:bg-[#1a1500] rounded-full px-3.5 py-2 transition-colors duration-200 cursor-pointer flex items-center gap-1.5'
                                >
                                    <Sparkles size={11} />
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className='shrink-0 border-t border-[#1a1a1a] bg-[#0A0A0A]'>
                        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-4'>
                            <div className='flex items-end gap-2.5 bg-[#0e0e0e] border border-[#1f1f1f] focus-within:border-[#65531e] rounded-2xl px-3.5 py-2.5 transition-colors duration-200'>
                                <textarea
                                    data-lenis-prevent-wheel
                                    ref={textareaRef}
                                    value={input}
                                    onChange={autoResizeTextarea}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder='Ask anything about your resume…'
                                    rows={1}
                                    className='flex-1 bg-transparent text-sm text-[#eee] placeholder:text-[#555] resize-none outline-none py-1.5 max-h-35 overflow-y-auto leading-relaxed'
                                />
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || sending}
                                    className='shrink-0 w-9 h-9 rounded-xl bg-[#D9A919] text-black flex items-center justify-center hover:shadow-[0_0_16px_rgba(217,169,25,0.35)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer'
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                            <p className='text-[11px] text-[#444] mt-2 text-center'>Press Enter to send · Shift + Enter for a new line</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
