import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ArrowRight, User, AlertCircle } from 'lucide-react';
import { sendOtp } from '../services/authApi';

const RULES = {
    fullName: {
        regex: /^[A-Za-z]{2,20}(?:\s[A-Za-z]{2,20}){1,6}$/,
        messages: {
            empty: 'Full name is required.',
            invalid: 'Enter 2-7 words. Each word must contain 2-20 letters and only letters are allowed.'
        }
    },
    email: {
        regex: /^[a-zA-Z0-9._%+-]{1,30}@[a-zA-Z0-9.-]{2,30}\.[a-zA-Z]{2,20}$/,
        messages: {
            empty: 'Email address is required.',
            invalid: 'Enter a valid email address (e.g. you@example.com).'
        }
    },
}

function validate(field, value) {
    const rule = RULES[field];
    if (!value.trim()) return rule.messages.empty;
    if (!rule.regex.test(value.trim())) return rule.messages.invalid;
    return null;
}

function Field({ label, error, touched, children }) {
    return (
        <div className='mb-3 sm:mb-4'>
            <label className='block text-sm font-medium text-[#aaa] mb-1 sm:mb-1.5'>{label}</label>
            {children}
            <div
                style={{
                    maxHeight: error && touched ? '40px' : '0',
                    opacity: error && touched ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.25s ease, opacity 0.2s ease',
                }}
            >
                <p className='flex items-center gap-1.5 mt-1.5 text-xs text-[#ef4444]'>
                    <AlertCircle size={12} className='shrink-0' />{error}
                </p>
            </div>
        </div>
    );
}

export default function SignupEmail() {
    const [values, setValues] = useState({ fullName: '', email: '' });
    const [activeErrorField, setActiveErrorField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const navigate = useNavigate();

    const set = (field) => (e) => {
        setValues((v) => ({ ...v, [field]: e.target.value }));
        if (activeErrorField === field) setActiveErrorField(null);
        if (apiError) setApiError('');
    };

    const handleContinue = async () => {
        for (const field of ['fullName', 'email']) {
            const err = validate(field, values[field]);
            if (err) {
                setActiveErrorField(field);
                return;
            }
        }

        setActiveErrorField(null);
        try {
            setLoading(true);
            const data = await sendOtp({ email: values.email.trim() });
            if (data.success) {
                // Pass name + email forward via sessionStorage
                sessionStorage.setItem('signup_name', values.fullName.trim());
                sessionStorage.setItem('signup_email', values.email.trim());
                navigate('/signupEmail/otp');
            }
        } catch (error) {
            setApiError(error.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const errorFor = (field) => activeErrorField === field ? validate(field, values[field]) : null;
    const isValid = values.fullName && values.email;

    return (
        <div className='relative min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden flex items-center justify-center'>
            {/* Glows */}
            <div className='absolute pointer-events-none' style={{ top: 0, right: 0, width: '45%', height: '70%', background: 'radial-gradient(ellipse at 100% 0%, rgba(217,169,25,0.15) 0%, transparent 60%)' }} />
            <div className='absolute pointer-events-none' style={{ bottom: 0, left: 0, width: '45%', height: '70%', background: 'radial-gradient(ellipse at 0% 100%, rgba(217,169,25,0.12) 0%, transparent 60%)' }} />

            {/* SVG curves */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none' viewBox='0 0 1000 800' preserveAspectRatio='xMidYMid slice'>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <path key={`tr-${i}`} d={`M ${1000} ${i * 80} Q ${800 - i * 30} ${200 + i * 60} ${600 - i * 40} ${800}`} fill='none' stroke={`rgba(217,169,25,${0.2 - i * 0.02})`} strokeWidth='0.7' />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <path key={`bl-${i}`} d={`M ${0} ${800 - i * 80} Q ${200 + i * 30} ${600 - i * 60} ${400 + i * 40} ${0}`} fill='none' stroke={`rgba(217,169,25,${0.17 - i * 0.02})`} strokeWidth='0.7' />
                ))}
            </svg>

            {/* Back to Home */}
            <Link to='/' className='group absolute top-6 left-6 flex items-center gap-1.5 text-sm md:text-base text-[#8a8686] hover:text-[#D9A919] transition-colors duration-200 z-10'>
                <ArrowLeft className='duration-300 group-hover:-translate-x-0.5 transition-transform' size={15} strokeWidth={2} />Home
            </Link>

            <div className='relative z-10 w-full max-w-sm mx-4 py-10 sm:py-12'>

                {/* Step indicator */}
                <div className='flex items-center justify-center gap-2 mb-6'>
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#D9A919] flex items-center justify-center text-black text-xs font-bold'>1</div>
                        <span className='text-xs text-[#D9A919] font-medium'>Your info</span>
                    </div>
                    <div className='w-8 h-px bg-[#2a2a2a]' />
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#555] text-xs font-bold'>2</div>
                        <span className='text-xs text-[#555]'>Verify</span>
                    </div>
                    <div className='w-8 h-px bg-[#2a2a2a]' />
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#555] text-xs font-bold'>3</div>
                        <span className='text-xs text-[#555]'>Password</span>
                    </div>
                </div>

                {/* Header */}
                <div className='text-center mb-4 sm:mb-7'>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight whitespace-nowrap'>
                        Sign up for <span className='text-[#D9A919]'>Resume Analyser</span>
                    </h1>
                    <p className='mt-1.5 sm:mt-2 text-sm sm:text-base text-[#8a8686]'>
                        Already have an account?{' '}
                        <Link to='/login' className='inline-flex items-center gap-1 text-[#D9A919] group'>
                            Log in <ArrowRight size={15} className='transition-transform duration-300 group-hover:translate-x-0.5' />
                        </Link>
                    </p>
                </div>

                {/* Google */}
                <div className='mb-4 sm:mb-5'>
                    <button className='w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-[#111] border border-[#2a2a2a] text-sm font-medium text-gray-300 hover:border-[#4a3a10] hover:bg-[#161200] hover:text-white transition-all duration-200 cursor-pointer'>
                        <svg width='16' height='16' viewBox='0 0 24 24'>
                            <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                            <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                            <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z' />
                            <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                        </svg>
                        Sign up with Google
                    </button>
                </div>

                {/* Divider */}
                <div className='flex items-center gap-3 mb-4 sm:mb-5'>
                    <div className='flex-1 h-px bg-[#222]' />
                    <span className='text-sm text-[#555]'>or</span>
                    <div className='flex-1 h-px bg-[#222]' />
                </div>

                {/* API error */}
                <div style={{ maxHeight: apiError ? '60px' : '0', opacity: apiError ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.25s ease', marginBottom: apiError ? '16px' : '0' }}>
                    <div className='flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-[#1a0a0a] border border-[#3d1515] text-xs text-[#f87171]'>
                        <AlertCircle size={13} className='shrink-0 mt-0.5' />{apiError}
                    </div>
                </div>

                {/* Fields */}
                <Field label='Full Name' error={errorFor('fullName')} touched={activeErrorField === 'fullName'}>
                    <div className='relative'>
                        <User size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]' />
                        <input
                            type='text'
                            value={values.fullName}
                            onChange={set('fullName')}
                            placeholder='Negan Smith'
                            className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-[#111] border text-sm text-white placeholder-[#444] focus:outline-none transition-all duration-200 ${activeErrorField === 'fullName' ? 'border-[#ef4444] focus:border-[#ef4444]' : 'border-[#2a2a2a] hover:border-[#444242] focus:border-[#D9A919]'}`}
                        />
                    </div>
                </Field>

                <Field label='Email' error={errorFor('email')} touched={activeErrorField === 'email'}>
                    <div className='relative'>
                        <Mail size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]' />
                        <input
                            type='email'
                            value={values.email}
                            onChange={set('email')}
                            placeholder='negan.smith@example.com'
                            className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-[#111] border text-sm text-white placeholder-[#444] focus:outline-none transition-all duration-200 ${activeErrorField === 'email' ? 'border-[#ef4444] focus:border-[#ef4444]' : 'border-[#2a2a2a] hover:border-[#444242] focus:border-[#D9A919]'}`}
                        />
                    </div>
                </Field>

                {/* Continue button */}
                <button
                    onClick={handleContinue}
                    disabled={!isValid || loading}
                    className='w-full mt-2 py-2 sm:py-2.5 rounded-xl bg-[#D9A919] text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(217,169,25,0.35)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer'
                >
                    {loading ? (
                        <span className='flex items-center justify-center gap-2'>
                            <svg className='animate-spin' width='14' height='14' viewBox='0 0 24 24' fill='none'>
                                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeOpacity='0.3' />
                                <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
                            </svg>
                            Sending OTP…
                        </span>
                    ) : (
                        <span className='flex items-center justify-center gap-1.5'>
                            Continue <ArrowRight size={15} />
                        </span>
                    )}
                </button>

                <p className='mt-4 sm:mt-5 text-center text-xs text-[#444] leading-relaxed'>
                    By signing up, you agree to our{' '}
                    <Link to='/terms' className='text-[#888] hover:text-[#D9A919] transition-colors duration-200'>Terms</Link>
                    {' '}and{' '}
                    <Link to='/privacy' className='text-[#888] hover:text-[#D9A919] transition-colors duration-200'>Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}