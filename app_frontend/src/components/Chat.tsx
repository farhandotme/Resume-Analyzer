import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { AlertCircle, ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Edit3, FileText, Mic, Moon, Sparkles, Square, SquarePen, SunMedium, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.ts';
import { uploadResume } from '../services/uploadResume.ts';
import { sendChatMessage } from '../services/chatResume.ts';

type Message = {
    id: number;
    role: 'user' | 'assistant';
    content: string;
};

const suggestions = [
    'What are my strongest skills?',
    'What should I improve in my resume?',
    'What jobs am I a good fit for?',
    'How can I make my resume stronger?',
    'What are the weaknesses in my resume?',
    'Is my resume ATS-friendly?',
    'How can I improve my experience section?',
    'What skills should I highlight?',
];

const inputPlaceholders = ['Ask anything about your resume...', 'What are my strongest skills?', 'How can I improve my resume?', 'What jobs am I a good fit for?', 'What should I highlight in your resume?'];
const heroWords = ['resume', 'experience', 'skills', 'story'];
const CHAT_ANALYSIS_ROLE = 'General Resume Review';
const CHAT_STORAGE_KEY = 'resume-analyzer-chat';

const GLOW_LAYERS = [
    { inset: 0, radius: 0, borderWidth: 2, blur: 4, opacity: { full: 0.9, reduced: 0.3 } },
    { inset: -2, radius: 0, borderWidth: 12, blur: 16, opacity: { full: 0.6, reduced: 0.2 } },
    { inset: -4, radius: 0, borderWidth: 32, blur: 36, opacity: { full: 0.25, reduced: 0.1 } },
] as const;

const MIC_GRADIENT = 'conic-gradient(from var(--resume-mic-angle), #ff6b22 0deg, #ff315d 70deg, #c84cff 145deg, #5a72ff 225deg, #7090ff 285deg, #ff6b22 360deg) border-box';

type StoredChat = {
    sessionId: string;
    fileName: string;
    fileType: string;
    pdfUrl: string;
    hasIndexedResume: boolean;
    messages: Message[];
};

const getStoredChat = (): StoredChat | null => {
    try {
        const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as StoredChat;
        if (!parsed.sessionId || !parsed.fileName || !parsed.pdfUrl || !Array.isArray(parsed.messages)) {
            sessionStorage.removeItem(CHAT_STORAGE_KEY);
            return null;
        }
        return parsed;
    } catch {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
        return null;
    }
};

export default function Chat() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const prefersReducedMotion = Boolean(useReducedMotion());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const fileErrorTimeoutRef = useRef<number | null>(null);
    const micErrorTimeoutRef = useRef<number | null>(null);

    const [sessionId, setSessionId] = useState(() => {
        const storedChat = getStoredChat();
        return storedChat?.sessionId ?? crypto.randomUUID();
    });

    const [hasIndexedResume, setHasIndexedResume] = useState(() => {
        const storedChat = getStoredChat();
        return storedChat?.hasIndexedResume ?? false;
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(() => {
        const storedChat = getStoredChat();

        if (!storedChat) return null;

        return new File([], storedChat.fileName, {
            type: storedChat.fileType || 'application/pdf',
        });
    });

    const [pdfUrl, setPdfUrl] = useState(() => {
        const storedChat = getStoredChat();
        return storedChat?.pdfUrl ?? '';
    });

    const [input, setInput] = useState('');

    const [messages, setMessages] = useState<Message[]>(() => {
        const storedChat = getStoredChat();
        return storedChat?.messages ?? [];
    });

    const [isDragging, setIsDragging] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholderText, setPlaceholderText] = useState('');
    const [isDeletingPlaceholder, setIsDeletingPlaceholder] = useState(false);
    const [showFileError, setShowFileError] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [micError, setMicError] = useState('');
    const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [originalEditingContent, setOriginalEditingContent] = useState('');
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const transcriptRef = useRef('');
    const shouldCommitTranscriptRef = useRef(false);
    const commitTranscriptTimeoutRef = useRef<number | null>(null);
    const isLeavingChatRef = useRef(false);

    const cursorPositionRef = useRef(0);
    const pendingCursorPositionRef = useRef<number | null>(null);
    const pendingCancelRef = useRef(false);

    const withRemountedTextarea = (callback: (textarea: HTMLTextAreaElement) => void, attemptsLeft = 60) => {
        const textarea = textareaRef.current;

        if (!textarea) {
            if (attemptsLeft <= 0) return;
            requestAnimationFrame(() => withRemountedTextarea(callback, attemptsLeft - 1));
            return;
        }

        requestAnimationFrame(() => callback(textarea));
    };

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (isLeavingChatRef.current) return false;
        return Boolean(selectedFile && messages.length > 0) && currentLocation.pathname !== nextLocation.pathname;
    });

    useEffect(() => {
        if (blocker.state === 'blocked') {
            setShowLeaveConfirmation(true);
        }
    }, [blocker.state]);

    useEffect(() => {
        if (!selectedFile || !pdfUrl) {
            sessionStorage.removeItem(CHAT_STORAGE_KEY);
            return;
        }

        const storedChat: StoredChat = {
            sessionId,
            fileName: selectedFile.name,
            fileType: selectedFile.type || 'application/pdf',
            pdfUrl,
            hasIndexedResume,
            messages,
        };

        try {
            sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(storedChat));
        } catch (error) {
            console.error('Failed to save chat session:', error);
        }
    }, [sessionId, selectedFile, pdfUrl, hasIndexedResume, messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }, [messages]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const frame2 = requestAnimationFrame(() => {
                const container = chatScrollRef.current;
                if (!container) return;

                const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);

                if (maxScrollTop <= 1) {
                    setShowScrollToBottom(false);
                    return;
                }

                const distanceFromBottom = maxScrollTop - container.scrollTop;
                setShowScrollToBottom(distanceFromBottom > 120);
            });

            return () => cancelAnimationFrame(frame2);
        });

        return () => cancelAnimationFrame(frame);
    }, [messages]);

    useEffect(() => {
        if (!selectedFile) return;

        const focusChatInput = () => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        };

        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(focusChatInput);
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [selectedFile]);

    useEffect(() => {
        if (!selectedFile) return;

        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            const textarea = textareaRef.current;
            if (!textarea || isSending || listening || editingMessageId !== null) return;
            if (event.metaKey || event.ctrlKey || event.altKey || event.key === 'Tab' || event.key === 'Escape') {
                return;
            }

            if (event.key === 'Enter') {
                if (document.activeElement !== textarea && !(document.activeElement instanceof HTMLTextAreaElement) && !(document.activeElement instanceof HTMLInputElement)) {
                    textarea.focus();
                }
                return;
            }

            if (event.key.length !== 1) return;
            if (document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLInputElement) return;

            event.preventDefault();

            const start = textarea.selectionStart ?? textarea.value.length;
            const end = textarea.selectionEnd ?? textarea.value.length;
            const newValue = textarea.value.slice(0, start) + event.key + textarea.value.slice(end);

            setInput(newValue);

            requestAnimationFrame(() => {
                textarea.focus();

                const nextCursorPosition = start + event.key.length;
                textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
            });
        };

        window.addEventListener('keydown', handleGlobalKeyDown);

        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [selectedFile, isSending, listening, editingMessageId]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    useEffect(() => {
        if (!listening && shouldCommitTranscriptRef.current) {
            if (commitTranscriptTimeoutRef.current !== null) {
                window.clearTimeout(commitTranscriptTimeoutRef.current);
            }

            commitTranscriptTimeoutRef.current = window.setTimeout(() => {
                const spokenText = transcriptRef.current.trim();

                if (spokenText) {
                    setInput((current) => {
                        const insertAt = Math.min(Math.max(cursorPositionRef.current, 0), current.length);
                        const before = current.slice(0, insertAt);
                        const after = current.slice(insertAt);

                        const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
                        const needsTrailingSpace = after.length > 0 && !/^\s/.test(after);

                        const insertedText = `${needsLeadingSpace ? ' ' : ''}${spokenText}${needsTrailingSpace ? ' ' : ''}`;

                        pendingCursorPositionRef.current = insertAt + (needsLeadingSpace ? 1 : 0) + spokenText.length;

                        return `${before}${insertedText}${after}`;
                    });

                    withRemountedTextarea((textarea) => {
                        textarea.style.height = 'auto';

                        const minHeight = 28;
                        const maxHeight = 160;
                        const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

                        textarea.style.height = `${nextHeight}px`;
                        textarea.focus();

                        const pos = pendingCursorPositionRef.current ?? textarea.value.length;
                        textarea.setSelectionRange(pos, pos);
                        pendingCursorPositionRef.current = null;
                    });
                } else {
                    withRemountedTextarea((textarea) => {
                        textarea.focus();
                        const pos = Math.min(Math.max(cursorPositionRef.current, 0), textarea.value.length);
                        textarea.setSelectionRange(pos, pos);
                    });
                }

                transcriptRef.current = '';
                shouldCommitTranscriptRef.current = false;
                commitTranscriptTimeoutRef.current = null;
                resetTranscript();
            }, 700);
        }

        return () => {
            if (commitTranscriptTimeoutRef.current !== null) {
                window.clearTimeout(commitTranscriptTimeoutRef.current);
                commitTranscriptTimeoutRef.current = null;
            }
        };
    }, [listening, resetTranscript]);

    useEffect(() => {
        if (!listening && pendingCancelRef.current) {
            pendingCancelRef.current = false;

            withRemountedTextarea((textarea) => {
                textarea.focus();
                const pos = Math.min(Math.max(cursorPositionRef.current, 0), textarea.value.length);
                textarea.setSelectionRange(pos, pos);
            });
        }
    }, [listening]);

    useEffect(() => {
        return () => {
            void SpeechRecognition.abortListening();

            if (fileErrorTimeoutRef.current !== null) {
                window.clearTimeout(fileErrorTimeoutRef.current);
            }

            if (micErrorTimeoutRef.current !== null) {
                window.clearTimeout(micErrorTimeoutRef.current);
            }

            if (commitTranscriptTimeoutRef.current !== null) {
                window.clearTimeout(commitTranscriptTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (prefersReducedMotion || !selectedFile || messages.length !== 1 || input) return;

        const currentPlaceholder = inputPlaceholders[placeholderIndex];

        const timeout = window.setTimeout(
            () => {
                if (!isDeletingPlaceholder) {
                    if (placeholderText.length < currentPlaceholder.length) {
                        setPlaceholderText(currentPlaceholder.slice(0, placeholderText.length + 1));
                        return;
                    }

                    setIsDeletingPlaceholder(true);
                    return;
                }

                if (placeholderText.length > 0) {
                    setPlaceholderText(currentPlaceholder.slice(0, placeholderText.length - 1));
                    return;
                }

                setIsDeletingPlaceholder(false);
                setPlaceholderIndex((current) => (current + 1) % inputPlaceholders.length);
            },
            !isDeletingPlaceholder ? (placeholderText.length === currentPlaceholder.length ? 1100 : 50) : placeholderText.length === 0 ? 250 : 30,
        );

        return () => window.clearTimeout(timeout);
    }, [prefersReducedMotion, selectedFile, messages.length, input, placeholderIndex, placeholderText, isDeletingPlaceholder]);

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

    const showMicErrorMessage = (message: string) => {
        setMicError(message);

        if (micErrorTimeoutRef.current !== null) {
            window.clearTimeout(micErrorTimeoutRef.current);
        }

        micErrorTimeoutRef.current = window.setTimeout(() => {
            setMicError('');
            micErrorTimeoutRef.current = null;
        }, 4000);
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

            const nextSessionId = crypto.randomUUID();

            setSessionId(nextSessionId);
            setHasIndexedResume(false);
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
            setHasIndexedResume(false);
            setSessionId(crypto.randomUUID());
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
        shouldCommitTranscriptRef.current = false;
        transcriptRef.current = '';

        if (commitTranscriptTimeoutRef.current !== null) {
            window.clearTimeout(commitTranscriptTimeoutRef.current);
            commitTranscriptTimeoutRef.current = null;
        }

        void SpeechRecognition.abortListening();
        resetTranscript();

        sessionStorage.removeItem(CHAT_STORAGE_KEY);

        setSelectedFile(null);
        setPdfUrl('');
        setHasIndexedResume(false);
        setSessionId(crypto.randomUUID());
        setMessages([]);
        setInput('');
        setIsSending(false);
        setAnalysisError('');
        setMicError('');

        if (textareaRef.current) {
            textareaRef.current.style.height = '28px';
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setInput(value);
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        const minHeight = 24;
        const maxHeight = 160;
        const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${nextHeight}px`;
    };

    const cancelVoiceInput = async () => {
        shouldCommitTranscriptRef.current = false;
        transcriptRef.current = '';
        pendingCancelRef.current = true;

        if (commitTranscriptTimeoutRef.current !== null) {
            window.clearTimeout(commitTranscriptTimeoutRef.current);
            commitTranscriptTimeoutRef.current = null;
        }

        try {
            await SpeechRecognition.abortListening();
        } catch (error) {
            console.error('Unable to cancel speech recognition:', error);
            pendingCancelRef.current = false;
        }

        resetTranscript();
        setMicError('');
    };

    const handleMicToggle = async () => {
        if (isSending) return;

        if (!browserSupportsSpeechRecognition) {
            showMicErrorMessage('Voice input is not supported in this browser.');
            return;
        }

        if (listening) {
            shouldCommitTranscriptRef.current = true;

            try {
                await SpeechRecognition.stopListening();
            } catch (error) {
                console.error('Unable to stop speech recognition:', error);
                shouldCommitTranscriptRef.current = false;
                showMicErrorMessage('Unable to stop voice input. Please try again.');
            }
            return;
        }

        if (commitTranscriptTimeoutRef.current !== null) {
            window.clearTimeout(commitTranscriptTimeoutRef.current);
            commitTranscriptTimeoutRef.current = null;
        }

        const textarea = textareaRef.current;
        cursorPositionRef.current = textarea ? (textarea.selectionStart ?? textarea.value.length) : input.length;

        setMicError('');
        shouldCommitTranscriptRef.current = false;
        transcriptRef.current = '';
        resetTranscript();

        try {
            await SpeechRecognition.startListening({
                continuous: true,
                language: navigator.language || 'en-US',
            });
        } catch (error) {
            console.error('Unable to start speech recognition:', error);
            shouldCommitTranscriptRef.current = false;
            showMicErrorMessage('Unable to start voice input. Please allow microphone access and try again.');
        }
    };

    const copyMessage = async (message: Message) => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopiedMessageId(message.id);

            window.setTimeout(() => {
                setCopiedMessageId((current) => (current === message.id ? null : current));
            }, 1500);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    const editMessage = (message: Message) => {
        setEditingMessageId(message.id);
        setEditingContent(message.content);
        setOriginalEditingContent(message.content);
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditingContent('');
        setOriginalEditingContent('');
    };

    useEffect(() => {
        if (editingMessageId !== null || !isSending) return;

        const timer = window.setTimeout(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [editingMessageId, isSending]);

    useEffect(() => {
        if (editingMessageId === null) return;

        const timer = setTimeout(() => {
            const textarea = editingTextareaRef.current;
            if (!textarea) return;

            textarea.focus();
            const position = textarea.value.length;
            textarea.setSelectionRange(position, position);

            textarea.style.height = 'auto';
            const minHeight = 52;
            const maxHeight = 108;
            const scrollHeight = textarea.scrollHeight;
            const nextHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${nextHeight}px`;
            textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        }, 0);

        return () => clearTimeout(timer);
    }, [editingMessageId]);

    const handleEditingContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setEditingContent(value);

        const textarea = event.target;
        textarea.style.height = 'auto';
        const minHeight = 52;
        const maxHeight = 108;
        const scrollHeight = textarea.scrollHeight;
        const nextHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${nextHeight}px`;
        textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    const saveEditedMessage = async () => {
        const trimmed = editingContent.trim();

        if (!trimmed || editingMessageId === null || !selectedFile || !pdfUrl || isSending) {
            return;
        }

        setIsSending(true);

        setMessages((current) => {
            const editedIndex = current.findIndex((message) => message.id === editingMessageId);

            if (editedIndex === -1) {
                return current;
            }

            return current.slice(0, editedIndex + 1).map((message, index) => (index === editedIndex ? { ...message, content: trimmed } : message));
        });

        setEditingMessageId(null);
        setEditingContent('');
        setOriginalEditingContent('');
        setShowScrollToBottom(false);

        try {
            const data = await sendChatMessage({
                pdfUrl: hasIndexedResume ? undefined : pdfUrl,
                message: trimmed,
                sessionId,
            });

            setHasIndexedResume(true);
            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.data?.answer ?? 'I received your message.',
                },
            ]);
        } catch (error) {
            console.error('Edited chat request failed:', error);
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
            requestAnimationFrame(() => {
                textareaRef.current?.focus();
            });
        }
    };

    const sendMessage = async (messageOverride?: string) => {
        const trimmed = (messageOverride ?? input).trim();

        if (!trimmed || !selectedFile || !pdfUrl || isSending) return;

        if (listening) {
            shouldCommitTranscriptRef.current = false;
            transcriptRef.current = '';
            if (commitTranscriptTimeoutRef.current !== null) {
                window.clearTimeout(commitTranscriptTimeoutRef.current);
                commitTranscriptTimeoutRef.current = null;
            }
            await SpeechRecognition.stopListening();
            resetTranscript();
        }

        setIsSending(true);
        setInput('');

        if (textareaRef.current) {
            textareaRef.current.style.height = '28px';
            textareaRef.current.setSelectionRange(0, 0);
        }

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: trimmed,
        };

        setMessages((current) => [...current, userMessage]);

        try {
            if (!sessionId) {
                throw new Error('Chat session is missing. Please start a new chat.');
            }
            const data = await sendChatMessage({
                pdfUrl: hasIndexedResume ? undefined : pdfUrl,
                message: trimmed,
                sessionId,
            });
            setHasIndexedResume(true);
            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.data?.answer ?? 'I received your message.',
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
            requestAnimationFrame(() => {
                textareaRef.current?.focus();
            });
        }
    };

    const handleSuggestion = (suggestion: string) => {
        void sendMessage(suggestion);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void sendMessage();
        }
    };

    const isLanding = !selectedFile;

    const handleHomeClick = () => {
        if (!selectedFile || messages.length === 0) {
            navigate('/');
            return;
        }
        setShowLeaveConfirmation(true);
    };

    const handleLeaveChat = () => {
        setShowLeaveConfirmation(false);
        isLeavingChatRef.current = true;
        shouldCommitTranscriptRef.current = false;
        transcriptRef.current = '';
        if (commitTranscriptTimeoutRef.current !== null) {
            window.clearTimeout(commitTranscriptTimeoutRef.current);
            commitTranscriptTimeoutRef.current = null;
        }

        void SpeechRecognition.abortListening();
        resetTranscript();

        sessionStorage.removeItem(CHAT_STORAGE_KEY);

        setSelectedFile(null);
        setPdfUrl('');
        setHasIndexedResume(false);
        setSessionId(crypto.randomUUID());
        setMessages([]);
        setInput('');
        setIsSending(false);
        setAnalysisError('');
        setMicError('');

        if (blocker.state === 'blocked') {
            blocker.proceed();
        } else {
            navigate('/');
        }
    };

    const handleChatScroll = () => {
        const container = chatScrollRef.current;
        if (!container) return;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        setShowScrollToBottom(distanceFromBottom > 120);
    };

    const scrollToBottom = () => {
        const container = chatScrollRef.current;
        if (!container) return;
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
        });
        setShowScrollToBottom(false);
    };

    return (
        <main
            className='relative flex h-dvh w-full flex-col overflow-hidden overscroll-none bg-white text-zinc-950 selection:bg-[#EAF5FF] selection:text-[#3999FF] dark:bg-black dark:text-zinc-100 dark:selection:bg-[#010B1B] dark:selection:text-[#3999FF]'
            onDragEnter={isLanding && !isAnalyzingResume ? handleDragEnter : undefined}
            onDragOver={isLanding && !isAnalyzingResume ? handleDragOver : undefined}
            onDragLeave={isLanding && !isAnalyzingResume ? handleDragLeave : undefined}
            onDrop={isLanding && !isAnalyzingResume ? handleDrop : undefined}
        >
            <style>{`
                @property --resume-mic-angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }
                @keyframes resume-mic-border-spin {
                    to {
                        --resume-mic-angle: 360deg;
                    }
                }
            `}</style>

            <AnimatePresence initial={false}>
                {listening === true && (
                    <motion.div
                        key='mic-glow'
                        aria-hidden='true'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className='pointer-events-none fixed inset-0 z-49 mix-blend-multiply brightness-50 contrast-125 saturate-200 dark:mix-blend-plus-lighter dark:brightness-100 dark:contrast-100 dark:saturate-100'
                    >
                        {GLOW_LAYERS.map((layer, index) => (
                            <div key={index} className='absolute inset-0' style={{ filter: `blur(${layer.blur}px)`, opacity: prefersReducedMotion ? layer.opacity.reduced : layer.opacity.full }}>
                                <div
                                    className='absolute border-transparent'
                                    style={{
                                        inset: layer.inset,
                                        borderRadius: layer.radius,
                                        borderWidth: layer.borderWidth,
                                        background: MIC_GRADIENT,
                                        WebkitMask: 'linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)',
                                        WebkitMaskComposite: 'destination-out',
                                        mask: 'linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)',
                                        maskComposite: 'exclude',
                                        animation: prefersReducedMotion ? undefined : 'resume-mic-border-spin 4.5s linear infinite',
                                    }}
                                />
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

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

                <div className='relative z-10 mx-auto grid h-16 w-full max-w-4xl -translate-x-1 sm:-translate-x-2 grid-cols-2 items-center px-4 sm:px-6'>
                    <div className='flex min-w-0 items-center gap-4'>
                        <button type='button' onClick={handleHomeClick} className='group inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100'>
                            <ArrowLeft className='h-4 w-4 -translate-x-0.5 transition-transform duration-300 group-hover:-translate-x-1' strokeWidth={1.8} />
                            <span className='select-none'>Home</span>
                        </button>

                        {selectedFile && (
                            <>
                                <div className='h-4 w-px bg-zinc-200 dark:bg-zinc-800' />
                                <div className='flex min-w-0 items-center gap-2.5'>
                                    <FileText className='h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500' strokeWidth={1.6} />
                                    <span className='max-w-45 truncate text-[13px] font-medium text-zinc-700 dark:text-zinc-300 sm:max-w-65'>{selectedFile.name}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className='ml-auto flex items-center gap-2'>
                        {selectedFile && (
                            <button
                                type='button'
                                onClick={removeFile}
                                aria-label='New chat'
                                title='New chat'
                                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200/80 bg-white/60 text-zinc-500 transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-zinc-800/80 dark:bg-black/60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                            >
                                <SquarePen className='h-4.5 w-4.5' strokeWidth={1.8} />
                            </button>
                        )}

                        <button
                            type='button'
                            onClick={toggleTheme}
                            aria-label='Toggle theme'
                            title='Toggle theme'
                            className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200/80 bg-white/60 text-zinc-500 transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-zinc-800/80 dark:bg-black/60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                        >
                            {theme === 'light' ? <Moon className='h-4.5 w-4.5' strokeWidth={1.8} /> : <SunMedium className='h-4.5 w-4.5' strokeWidth={1.8} />}
                        </button>
                    </div>
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
                                                className={`absolute -inset-full transition-opacity duration-500 ${isAnalyzingResume ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(161,161,170,0.9) 85%, transparent 100%)' }}
                                            />

                                            <motion.div
                                                animate={prefersReducedMotion ? {} : { rotate: -360 }}
                                                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                                className={`absolute -inset-full transition-opacity duration-500 ${isAnalyzingResume ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
                            <div ref={chatScrollRef} onScroll={handleChatScroll} className='chat-scrollbar min-h-0 flex-1 overflow-y-auto'>
                                <div className='mx-auto flex h-full w-full max-w-4xl flex-col px-4 pt-6 pb-6 sm:px-6'>
                                    {messages.length === 1 ? (
                                        <div className='flex flex-1 items-start justify-center pt-[18vh] sm:pt-[20vh]'>
                                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className='w-full max-w-2xl text-center px-4'>
                                                <div className='mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-600'>Resume Intelligence</div>

                                                <div className='mx-auto max-w-xl whitespace-pre-wrap wrap-break-word text-[16px] font-normal leading-7 tracking-[-0.008em] text-zinc-700 dark:text-zinc-300 sm:text-[17px] sm:leading-8'>{messages[0].content}</div>
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className='flex flex-col gap-8'>
                                                {messages.map((message) => (
                                                    <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                                                        {message.role === 'assistant' ? (
                                                            <div className='max-w-[78%]'>
                                                                <div className='mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-600'>Resume Intelligence</div>

                                                                <div className='whitespace-pre-wrap wrap-break-word text-[15px] leading-7 tracking-[-0.005em] text-zinc-800 dark:text-zinc-200'>{message.content}</div>
                                                            </div>
                                                        ) : (
                                                            <div className={`flex flex-col items-end max-w-[78%] ${editingMessageId === message.id ? 'w-full' : ''}`}>
                                                                {editingMessageId === message.id ? (
                                                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className='w-full'>
                                                                        <textarea
                                                                            ref={editingTextareaRef}
                                                                            value={editingContent}
                                                                            onChange={handleEditingContentChange}
                                                                            onKeyDown={(event) => {
                                                                                if (event.key === 'Escape') {
                                                                                    event.preventDefault();
                                                                                    cancelEdit();
                                                                                }

                                                                                if (event.key === 'Enter' && !event.shiftKey) {
                                                                                    event.preventDefault();
                                                                                    void saveEditedMessage();
                                                                                }
                                                                            }}
                                                                            rows={1}
                                                                            className='block max-h-27 min-h-13 w-full resize-none overflow-x-hidden rounded-[18px] rounded-br-md border border-zinc-200 bg-white px-4.5 py-3 text-[15px] leading-7 tracking-[-0.005em] text-zinc-900 outline-none shadow-[0_8px_28px_-14px_rgba(0,0,0,0.14)] transition-colors duration-200 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_8px_28px_-14px_rgba(0,0,0,0.8)] dark:focus:border-zinc-600'
                                                                            style={{ height: '52px', overflowY: 'hidden' }}
                                                                        />

                                                                        <div className='mt-2 flex items-center justify-end gap-2'>
                                                                            <button
                                                                                type='button'
                                                                                onClick={cancelEdit}
                                                                                disabled={isSending}
                                                                                className='cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 select-none'
                                                                            >
                                                                                Cancel
                                                                            </button>

                                                                            <button
                                                                                type='button'
                                                                                onClick={() => void saveEditedMessage()}
                                                                                disabled={!editingContent.trim() || isSending || editingContent === originalEditingContent}
                                                                                className='cursor-pointer rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 select-none'
                                                                            >
                                                                                {isSending ? 'Saving...' : 'Send'}
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                ) : (
                                                                    <>
                                                                        <div className='group flex flex-col items-end gap-2'>
                                                                            <div className='rounded-[18px] rounded-br-md border border-zinc-200/80 bg-zinc-100 px-4.5 py-3 text-[15px] leading-7 tracking-[-0.005em] text-zinc-800 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.18)] dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[0_2px_12px_-5px_rgba(0,0,0,0.5)]'>
                                                                                {message.content}
                                                                            </div>

                                                                            <div className='flex -translate-y-0.5 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
                                                                                <button
                                                                                    type='button'
                                                                                    onClick={() => void copyMessage(message)}
                                                                                    aria-label={copiedMessageId === message.id ? 'Copied' : 'Copy message'}
                                                                                    title={copiedMessageId === message.id ? 'Copied' : 'Copy message'}
                                                                                    className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
                                                                                >
                                                                                    {copiedMessageId === message.id ? <Check className='h-3.5 w-3.5' strokeWidth={2} /> : <Copy className='h-3.5 w-3.5' strokeWidth={1.8} />}
                                                                                </button>

                                                                                <button
                                                                                    type='button'
                                                                                    onClick={() => editMessage(message)}
                                                                                    aria-label='Edit message'
                                                                                    title='Edit message'
                                                                                    className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
                                                                                >
                                                                                    <Edit3 className='h-3.5 w-3.5' strokeWidth={1.8} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {isSending && (
                                                <div className='mt-8 flex justify-start'>
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
                                        </>
                                    )}

                                    <div ref={messagesEndRef} className='h-8 shrink-0' />
                                </div>
                            </div>

                            <div className='relative mx-auto w-full max-w-4xl shrink-0 px-4 pb-3 sm:px-6'>
                                {messages.length === 1 && !isSending && (
                                    <div className='mb-4 text-center'>
                                        <p className='mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500'>Suggested questions</p>

                                        <div className='mx-auto flex max-w-3xl flex-wrap justify-center gap-2'>
                                            {suggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type='button'
                                                    onClick={() => handleSuggestion(suggestion)}
                                                    disabled={isSending}
                                                    className='cursor-pointer select-none rounded-lg border border-zinc-200/80 bg-transparent px-3 py-1.5 text-left text-[12.5px] font-medium text-zinc-500 transition-colors duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/80 dark:text-zinc-500 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70 dark:hover:text-zinc-200'
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {showScrollToBottom && (
                                        <motion.button
                                            type='button'
                                            onClick={scrollToBottom}
                                            aria-label='Scroll to latest message'
                                            title='Scroll to latest message'
                                            initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                            className='absolute bottom-full left-1/2 z-20 mb-2 flex h-9 w-9 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-zinc-500 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-zinc-800/80 dark:bg-zinc-950/90 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                                        >
                                            <ArrowDown className='h-4 w-4' strokeWidth={1.8} />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                                <div className='group/composer relative'>
                                    {editingMessageId !== null && (
                                        <div
                                            role='tooltip'
                                            className='pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 translate-y-1 scale-95 whitespace-nowrap rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs font-normal text-zinc-700 opacity-0 shadow-sm transition-all duration-150 ease-out group-hover/composer:translate-y-0 group-hover/composer:scale-100 group-hover/composer:opacity-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                                        >
                                            Complete your edit to continue
                                            <span aria-hidden='true' className='absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-300 dark:border-t-zinc-700' />
                                            <span aria-hidden='true' className='absolute left-1/2 top-full -mt-px z-10 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-100 dark:border-t-zinc-800' />
                                        </div>
                                    )}

                                    <div
                                        className={`group relative flex w-full items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 py-2 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.12)] transition-all duration-200 focus-within:border-zinc-300 focus-within:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.16)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_8px_28px_-14px_rgba(0,0,0,0.7)] dark:focus-within:border-zinc-700 dark:focus-within:shadow-[0_12px_34px_-14px_rgba(0,0,0,0.85)] ${listening ? 'border-zinc-300/90 dark:border-zinc-700/90' : ''} ${editingMessageId !== null ? 'cursor-not-allowed' : ''}`}
                                    >
                                        <AnimatePresence mode='wait' initial={false}>
                                            {listening ? (
                                                <motion.div key='voice-mode' initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className='flex min-w-0 flex-1 items-center gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={() => void cancelVoiceInput()}
                                                        aria-label='Cancel voice input'
                                                        title='Cancel voice input'
                                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                                                    >
                                                        <X className='h-4.5 w-4.5' strokeWidth={1.8} />
                                                    </button>

                                                    <div className='flex min-w-0 flex-1 items-center gap-3 px-1'>
                                                        <span className='select-none whitespace-nowrap text-[13px] font-medium text-zinc-400 dark:text-zinc-500'>Listening</span>

                                                        <div aria-hidden='true' className='flex h-9 min-w-0 flex-1 items-center gap-0.75 overflow-hidden'>
                                                            {[12, 20, 9, 26, 15, 31, 12, 22, 35, 17, 27, 11, 24, 32, 16, 29, 13, 36, 21, 10, 28, 15, 34, 18, 24, 11, 30, 16].map((height, index) => (
                                                                <motion.span
                                                                    key={index}
                                                                    className='w-0.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500'
                                                                    style={{ height }}
                                                                    animate={prefersReducedMotion ? { opacity: 0.8, scaleY: 1 } : { opacity: [0.45, 0.95, 0.5], scaleY: [0.45, 1, 0.55] }}
                                                                    transition={{ duration: 0.72 + (index % 5) * 0.08, repeat: Infinity, ease: 'easeInOut', delay: index * 0.035 }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key='text-mode' initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className='relative flex min-h-7 min-w-0 flex-1 items-center pl-3'>
                                                    <div className='relative w-full'>
                                                        {!input && messages.length === 1 && (
                                                            <div aria-hidden='true' className='pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center overflow-hidden'>
                                                                <span className='whitespace-nowrap text-[16px] leading-7 text-zinc-400 dark:text-zinc-600'>{placeholderText}</span>
                                                            </div>
                                                        )}

                                                        <textarea
                                                            ref={textareaRef}
                                                            autoFocus
                                                            value={input}
                                                            onChange={handleInputChange}
                                                            onKeyDown={handleKeyDown}
                                                            rows={1}
                                                            placeholder={messages.length > 1 ? 'Ask anything about your resume...' : ''}
                                                            className='chat-composer-scrollbar relative z-10 block max-h-40 min-h-7 w-full translate-y-0.5 resize-none overflow-y-auto bg-transparent p-0 text-[16px] font-normal leading-5.75 text-zinc-900 outline-none placeholder:font-normal placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60'
                                                            disabled={editingMessageId !== null}
                                                            style={{ height: '28px' }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className='relative z-10 flex shrink-0 items-center gap-1.5'>
                                            {micError && (
                                                <div className='absolute bottom-full left-1/2 mb-2 w-max max-w-70 -translate-x-1/2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-[11px] font-medium text-rose-600 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/70 dark:text-rose-300'>
                                                    {micError}
                                                </div>
                                            )}

                                            {listening ? (
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        shouldCommitTranscriptRef.current = true;
                                                        void SpeechRecognition.stopListening();
                                                    }}
                                                    disabled={isSending || editingMessageId !== null}
                                                    aria-label='Stop voice input'
                                                    title='Stop voice input'
                                                    className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-all duration-200 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                                >
                                                    <Square className='h-3.5 w-3.5 fill-current' strokeWidth={1.8} />
                                                </button>
                                            ) : (
                                                <button
                                                    type='button'
                                                    onClick={handleMicToggle}
                                                    disabled={isSending || editingMessageId !== null}
                                                    aria-label='Start voice input'
                                                    title='Voice input'
                                                    className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
                                                >
                                                    <Mic className='h-5 w-5' strokeWidth={1.8} />
                                                </button>
                                            )}

                                            <div className='group/send relative'>
                                                <button
                                                    type='button'
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => void sendMessage()}
                                                    disabled={!input.trim() || isSending || listening || editingMessageId !== null}
                                                    aria-label='Send message'
                                                    className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-zinc-950 text-white transition-all duration-200 hover:bg-zinc-800 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600'
                                                >
                                                    <ArrowUp className='h-5 w-5' strokeWidth={1.8} />
                                                </button>

                                                {(!input.trim() || isSending || listening) && (
                                                    <div
                                                        role='tooltip'
                                                        className='pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 translate-y-1 scale-95 whitespace-nowrap rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs font-normal text-zinc-700 opacity-0 shadow-sm transition-all duration-150 ease-out group-hover/send:translate-y-0 group-hover/send:scale-100 group-hover/send:opacity-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                                                    >
                                                        {listening ? 'stop listening first' : isSending && input.trim() ? 'wait for response' : 'type something'}
                                                        <span aria-hidden='true' className='absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-300 dark:border-t-zinc-700' />
                                                        <span aria-hidden='true' className='absolute left-1/2 top-full -mt-px z-10 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-100 dark:border-t-zinc-800' />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className='mt-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600'>AI can make mistakes · verify important information</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showLeaveConfirmation && (
                    <motion.div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm dark:bg-black/60' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeaveConfirmation(false)}>
                        <motion.div
                            role='dialog'
                            aria-modal='true'
                            aria-labelledby='leave-chat-title'
                            aria-describedby='leave-chat-description'
                            className='w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950'
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <h2 id='leave-chat-title' className='text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100'>
                                Leave this chat?
                            </h2>

                            <p id='leave-chat-description' className='mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400'>
                                Your uploaded resume and current session will be cleared when you leave.
                            </p>

                            <div className='mt-6 flex items-center justify-end gap-2.5'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowLeaveConfirmation(false);
                                        isLeavingChatRef.current = false;

                                        if (blocker.state === 'blocked') {
                                            blocker.reset();
                                        }
                                    }}
                                    className='cursor-pointer select-none rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                                >
                                    Stay
                                </button>

                                <button type='button' onClick={handleLeaveChat} className='cursor-pointer select-none rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'>
                                    Leave
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
