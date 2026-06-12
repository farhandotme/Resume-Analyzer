import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createAccount } from '../services/authApi';

const PASSWORD_RULE = {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,50}$/,
    messages: {
        empty: 'Password is required.',
        invalid: 'Must be 8-50 characters with uppercase, lowercase, number, and special character.',
    },
};

function validate(field, value, extra = {}) {
    if (field === 'password') {
        if (!value.trim()) return PASSWORD_RULE.messages.empty;
        if (!PASSWORD_RULE.regex.test(value)) return PASSWORD_RULE.messages.invalid;
        return null;
    }
    if (field === 'confirmPassword') {
        if (!value) return 'Please confirm your password.';
        if (value !== extra.password) return "Passwords don't match.";
        return null;
    }
}

function getStrength(pwd) {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: '#ef4444' };
    if (score === 3) return { level: score, label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { level: score, label: 'Good', color: '#3b82f6' };
    return { level: score, label: 'Strong', color: '#22c55e' };
}

function Field({ label, error, touched, children }) {
    return (
        <div className='mb-3 sm:mb-4'>
            <label className='block text-sm font-medium text-[#aaa] mb-1 sm:mb-1.5'>{label}</label>
            {children}
            <div style={{ maxHeight: error && touched ? '40px' : '0', opacity: error && touched ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.25s ease, opacity 0.2s ease' }}>
                <p className='flex items-center gap-1.5 mt-1.5 text-xs text-[#ef4444]'>
                    <AlertCircle size={12} className='shrink-0' />{error}
                </p>
            </div>
        </div>
    );
}

export default function SignupPassword() {
    const [values, setValues] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeErrorField, setActiveErrorField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // const navigate = useNavigate();

    const name  = sessionStorage.getItem('signup_name') || '';
    const email = sessionStorage.getItem('signup_email') || '';
    const token = sessionStorage.getItem('signup_token') || '';

    // Guard — if session is missing, send back to start
    useEffect(() => {
        // if (!email || !token) navigate('/signup');
    }, []);

    const set = (field) => (e) => {
        setValues((v) => ({ ...v, [field]: e.target.value }));
        if (activeErrorField === field) setActiveErrorField(null);
        if (apiError) setApiError('');
    };

    const strength = getStrength(values.password);
    const errorFor = (field) => activeErrorField === field ? validate(field, values[field], { password: values.password }) : null;
    const isValid = values.password && values.confirmPassword;

    const handleCreate = async () => {
        for (const field of ['password', 'confirmPassword']) {
            const err = validate(field, values[field], { password: values.password });
            if (err) {
                setActiveErrorField(field);
                return;
            }
        }

        setActiveErrorField(null);
        try {
            setLoading(true);
            const data = await createAccount({ name, email, password: values.password, token });
            if (data.success) {
                sessionStorage.removeItem('signup_name');
                sessionStorage.removeItem('signup_email');
                sessionStorage.removeItem('signup_token');
                // navigate('/');
            }
        } catch (error) {
            setApiError(error.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

            {/* Back */}
            <Link to='/signup/otp' className='group absolute top-6 left-6 flex items-center gap-1.5 text-sm md:text-base text-[#8a8686] hover:text-[#D9A919] transition-colors duration-200 z-10'>
                <ArrowLeft className='duration-300 group-hover:-translate-x-0.5 transition-transform' size={15} strokeWidth={2} />Back
            </Link>

            <div className='relative z-10 w-full max-w-sm mx-4 py-10 sm:py-12'>

                {/* Step indicator */}
                <div className='flex items-center justify-center gap-2 mb-6'>
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#2a1f00] border border-[#D9A919] flex items-center justify-center'>
                            <CheckCircle2 size={13} className='text-[#D9A919]' />
                        </div>
                        <span className='text-xs text-[#555]'>Your info</span>
                    </div>
                    <div className='w-8 h-px bg-[#D9A919] opacity-40' />
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#2a1f00] border border-[#D9A919] flex items-center justify-center'>
                            <CheckCircle2 size={13} className='text-[#D9A919]' />
                        </div>
                        <span className='text-xs text-[#555]'>Verify</span>
                    </div>
                    <div className='w-8 h-px bg-[#D9A919] opacity-40' />
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#D9A919] flex items-center justify-center text-black text-xs font-bold'>3</div>
                        <span className='text-xs text-[#D9A919] font-medium'>Password</span>
                    </div>
                </div>

                {/* Header */}
                <div className='text-center mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Set your password</h1>
                    <p className='mt-2 text-sm text-[#8a8686]'>
                        Almost there,{' '}
                        <span className='text-[#D9A919] font-medium'>{name.split(' ')[0]}</span>
                    </p>
                </div>

                {/* API error */}
                <div style={{ maxHeight: apiError ? '60px' : '0', opacity: apiError ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.25s ease', marginBottom: apiError ? '16px' : '0' }}>
                    <div className='flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-[#1a0a0a] border border-[#3d1515] text-xs text-[#f87171]'>
                        <AlertCircle size={13} className='shrink-0 mt-0.5' />{apiError}
                    </div>
                </div>

                {/* Password */}
                <Field label='Password' error={errorFor('password')} touched={activeErrorField === 'password'}>
                    <div className='relative'>
                        <Lock size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]' />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            onChange={set('password')}
                            placeholder='••••••••'
                            className={`w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-[#111] border text-sm text-white placeholder-[#444] focus:outline-none transition-all duration-200 ${activeErrorField === 'password' ? 'border-[#ef4444] focus:border-[#ef4444]' : 'border-[#2a2a2a] hover:border-[#444242] focus:border-[#D9A919]'}`}
                        />
                        <button type='button' onClick={() => setShowPassword((v) => !v)} className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D9A919] transition-colors duration-200'>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    {values.password && (
                        <div className='mt-2'>
                            <div className='flex gap-1 mb-1'>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className='flex-1 h-0.75 rounded-full transition-all duration-300' style={{ backgroundColor: i <= strength.level ? strength.color : '#222' }} />
                                ))}
                            </div>
                            <p className='text-xs' style={{ color: strength.color }}>{strength.label}</p>
                        </div>
                    )}
                </Field>

                {/* Confirm Password */}
                <div className='mb-5 sm:mb-6'>
                    <Field label='Confirm Password' error={errorFor('confirmPassword')} touched={activeErrorField === 'confirmPassword'}>
                        <div className='relative'>
                            <Lock size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]' />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={values.confirmPassword}
                                onChange={set('confirmPassword')}
                                placeholder='••••••••'
                                className={`w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-[#111] border text-sm text-white placeholder-[#444] focus:outline-none transition-all duration-200 ${activeErrorField === 'confirmPassword' ? 'border-[#ef4444] focus:border-[#ef4444]' : values.confirmPassword && values.confirmPassword === values.password ? 'border-[#22c55e] focus:border-[#22c55e]' : 'border-[#2a2a2a] hover:border-[#444242] focus:border-[#D9A919]'}`}
                            />
                            <button type='button' onClick={() => setShowConfirmPassword((v) => !v)} className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#D9A919] transition-colors duration-200'>
                                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            {values.confirmPassword && values.confirmPassword === values.password && (
                                <CheckCircle2 size={14} className='absolute right-9 top-1/2 -translate-y-1/2 text-[#22c55e] pointer-events-none' />
                            )}
                        </div>
                    </Field>
                </div>

                {/* Create account button */}
                <button
                    onClick={handleCreate}
                    disabled={!isValid || loading}
                    className='w-full py-2 sm:py-2.5 rounded-xl bg-[#D9A919] text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(217,169,25,0.35)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer'
                >
                    {loading ? (
                        <span className='flex items-center justify-center gap-2'>
                            <svg className='animate-spin' width='14' height='14' viewBox='0 0 24 24' fill='none'>
                                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeOpacity='0.3' />
                                <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
                            </svg>
                            Creating account…
                        </span>
                    ) : 'Create account'}
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