'use client';

type ReportDocumentProps = {
    analysisResult: any;
    theme: 'light' | 'dark';
};

type ScoreBreakdownItem = {
    label: string;
    score: number;
    out_of: number;
    reason?: string;
};

type ResumeFix = {
    priority?: string;
    section?: string;
    fix?: string;
    why?: string;
};

type ActionPlanItem = {
    timeline?: string;
    action?: string;
    impact?: string;
};

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const FRAUNCES = '"Fraunces", ui-serif, Georgia, serif';

const priorityClass = (priority: string | undefined, isDark: boolean) => {
    const value = clean(priority).toLowerCase();

    if (value.includes('critical')) {
        return isDark ? 'border-zinc-600 bg-zinc-100 text-zinc-950' : 'border-zinc-900 bg-zinc-950 text-white';
    }

    if (value.includes('high')) {
        return isDark ? 'border-zinc-600 bg-zinc-800 text-zinc-100' : 'border-zinc-700 bg-zinc-700 text-white';
    }

    if (value.includes('medium')) {
        return isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-200' : 'border-zinc-300 bg-zinc-100 text-zinc-900';
    }

    return isDark ? 'border-zinc-700 bg-transparent text-zinc-400' : 'border-zinc-200 bg-transparent text-zinc-500';
};

export default function ReportDocument({ analysisResult, theme }: ReportDocumentProps) {
    const data = analysisResult?.data?.data;

    const meta = data?.meta ?? {};
    const hero = data?.hero ?? {};
    const candidate = data?.candidate ?? {};
    const isDark = theme === 'dark';
    const scoreBreakdown: ScoreBreakdownItem[] = Array.isArray(data?.score_breakdown) ? data.score_breakdown : [];
    const resumeFixes: ResumeFix[] = Array.isArray(data?.resume_fixes) ? data.resume_fixes : [];
    const actionPlan: ActionPlanItem[] = Array.isArray(data?.action_plan) ? data.action_plan : [];
    const atsScore = Number(hero?.ats_score ?? 0);
    const topFixes = resumeFixes.slice(0, 3);
    const timelineOrder = ['this week', 'this month', 'in 3 months'];
    const matchedActions = timelineOrder.map((timeline) => actionPlan.find((item) => clean(item.timeline).toLowerCase() === timeline)).filter(Boolean) as ActionPlanItem[];
    const topActions = matchedActions.length > 0 ? (matchedActions.length < 3 ? [...matchedActions, ...actionPlan.filter((item) => !matchedActions.includes(item))].slice(0, 3) : matchedActions) : actionPlan.slice(0, 3);
    const strongestAsset = clean(candidate?.strongest_asset);
    const biggestBlocker = clean(candidate?.biggest_blocker);
    const finalVerdict = clean(data?.final_verdict) || clean(data?.motivation);
    const pageClass = isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900';
    const primaryText = isDark ? 'text-zinc-100' : 'text-zinc-950';
    const secondaryText = isDark ? 'text-zinc-300' : 'text-zinc-600';
    const mutedText = isDark ? 'text-zinc-500' : 'text-zinc-400';
    const subtleText = isDark ? 'text-zinc-600' : 'text-zinc-300';
    const mainBorder = isDark ? 'border-zinc-800' : 'border-zinc-300';
    const softBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
    const strongBorder = isDark ? 'border-zinc-300' : 'border-zinc-950';
    const subtleSurface = isDark ? 'bg-zinc-900/60' : 'bg-zinc-50';
    const darkPanel = isDark ? 'bg-zinc-900' : 'bg-zinc-950';
    const progressTrack = isDark ? 'bg-zinc-800' : 'bg-zinc-200';
    const progressFill = isDark ? 'bg-zinc-100' : 'bg-zinc-950';

    return (
        <div id='resume-report' className={`relative flex h-[297mm] w-[210mm] flex-col overflow-hidden px-[14mm] pb-[13mm] pt-[13mm] ${pageClass}`}>
            <header className={`shrink-0 border-b-[1.5px] pb-[5mm] ${strongBorder}`}>
                <div className='flex items-end justify-between'>
                    <div>
                        <div className='mb-[3mm] flex items-center gap-2'>
                            <span className={`h-1.5 w-1.5 ${isDark ? 'bg-zinc-100' : 'bg-zinc-950'}`} />
                            <span className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.3em] ${mutedText}`}>Resume Intelligence</span>
                        </div>
                        <h1 className={`text-[38px] font-medium leading-[0.9] tracking-[-0.03em] ${primaryText}`} style={{ fontFamily: FRAUNCES }}>
                            {clean(hero?.name) || 'Resume Analysis'}
                        </h1>

                        <p className={`mt-[2mm] text-[12px] font-medium uppercase tracking-widest ${secondaryText}`}>{clean(meta?.job_title) || 'Software Engineer'}</p>
                    </div>

                    <div className='text-right'>
                        <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.25em] ${primaryText}`}>{clean(meta?.powered_by) || 'Resume Analysis'}</p>

                        {clean(meta?.generated_at) && <p className={`mt-[2mm] font-mono text-[8px] uppercase tracking-[0.15em] ${subtleText}`}>{meta.generated_at}</p>}
                    </div>
                </div>
            </header>

            <section className={`mt-[5mm] shrink-0 border-b pb-[5mm] ${mainBorder}`}>
                <div className='flex'>
                    <div className='flex-[0.92] pr-[8mm]'>
                        <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.28em] ${mutedText}`}>ATS Score</p>
                        <div className='mt-[3mm] flex items-end gap-2'>
                            <span className={`text-[104px] font-normal leading-[0.75] tracking-tighter ${primaryText}`} style={{ fontFamily: FRAUNCES }}>
                                {atsScore}
                            </span>
                            <span className={`pb-1.25 text-[14px] ${mutedText}`}>/ 100</span>
                        </div>

                        <p className={`mt-[4.5mm] max-w-[80mm] text-[11px] leading-[1.6] ${secondaryText}`} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                            {clean(hero?.one_liner) || 'Your resume has been evaluated across skills, experience, projects, structure, and ATS compatibility.'}
                        </p>
                    </div>

                    <div className={`flex-[1.08] border-l pl-[8mm] ${mainBorder}`}>
                        <div className='flex items-start justify-between'>
                            <div>
                                <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.25em] ${mutedText}`}>Verdict</p>
                                <p className={`mt-[3mm] text-[34px] font-medium leading-[0.9] tracking-[-0.02em] ${primaryText}`} style={{ fontFamily: FRAUNCES }}>
                                    {clean(hero?.verdict) || 'Needs Work'}
                                </p>
                            </div>

                            <div className='text-right'>
                                <p className={`font-mono text-[8.5px] uppercase tracking-[0.22em] ${mutedText}`}>Hire Probability</p>
                                <p className={`mt-[2.5mm] font-mono text-[13px] font-bold tracking-widest ${primaryText}`}>{clean(hero?.hire_probability) || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className={`mt-[5mm] flex items-center justify-between border-t pt-[3.5mm] ${softBorder}`}>
                            <div>
                                <p className={`font-mono text-[7.5px] uppercase tracking-[0.2em] ${mutedText}`}>Candidate level</p>
                                <p className={`mt-[1.8mm] text-[11.5px] font-semibold ${primaryText}`}>{clean(candidate?.level) || '—'}</p>
                            </div>

                            <div className='text-right'>
                                <p className={`font-mono text-[7.5px] uppercase tracking-[0.2em] ${mutedText}`}>Application status</p>
                                <p className={`mt-[1.8mm] text-[11.5px] font-semibold ${primaryText}`}>{candidate?.ready_to_apply ? 'Ready to apply' : 'Needs work'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {scoreBreakdown.length > 0 && (
                <section className='mt-[4mm] shrink-0 pb-[4mm]'>
                    <div className='mb-[4mm] flex items-end justify-between'>
                        <p className={`font-mono text-[8px] font-bold uppercase tracking-[0.25em] ${primaryText}`}>Score breakdown</p>
                        <span className={`font-mono text-[7px] uppercase tracking-[0.15em] ${subtleText}`}>{scoreBreakdown.length} categories</span>
                    </div>

                    <div className='flex gap-[8mm]'>
                        {scoreBreakdown.slice(0, 5).map((item) => {
                            const percentage = item.out_of > 0 ? (item.score / item.out_of) * 100 : 0;

                            return (
                                <div key={item.label} className='min-w-0 flex-1'>
                                    <div className='flex items-baseline justify-between gap-1'>
                                        <span className={`truncate font-mono text-[8.5px] font-semibold uppercase tracking-wider ${primaryText}`}>{item.label}</span>
                                        <span className={`shrink-0 font-mono text-[8.5px] tabular-nums ${mutedText}`}>
                                            {item.score}/{item.out_of}
                                        </span>
                                    </div>

                                    <div className={`mt-[3.5mm] h-px ${progressTrack}`}>
                                        <div className={`h-full ${progressFill}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {(strongestAsset || biggestBlocker) && (
                <section className='mt-[4mm] flex shrink-0 gap-[12mm]'>
                    <div className={`flex-1 border-l-[1.5px] pl-[5mm] ${strongBorder}`}>
                        <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.25em] ${mutedText}`}>Strongest asset</p>
                        <p className={`mt-[3mm] text-[11px] leading-[1.6] ${primaryText}`} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                            {strongestAsset || 'No strongest asset was identified.'}
                        </p>
                    </div>

                    <div className={`flex-1 border-l-[1.5px] pl-[5mm] ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
                        <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.25em] ${mutedText}`}>Biggest blocker</p>
                        <p className={`mt-[3mm] text-[11px] leading-[1.6] ${secondaryText}`} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                            {biggestBlocker || 'No major blocker was identified.'}
                        </p>
                    </div>
                </section>
            )}

            {topFixes.length > 0 && (
                <section className='mt-[5mm] shrink-0'>
                    <div className='mb-[3.5mm] flex items-end justify-between'>
                        <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.25em] ${primaryText}`}>Fix these first</p>
                        <span className={`font-mono text-[7.5px] uppercase tracking-[0.2em] ${subtleText}`}>
                            Top {topFixes.length} priorit
                            {topFixes.length === 1 ? 'y' : 'ies'}
                        </span>
                    </div>

                    <div className='flex gap-[5mm]'>
                        {topFixes.map((item, index) => (
                            <div key={`${item.section}-${index}`} className={`flex-1 border-[0.5px] px-[5mm] py-[4mm] ${softBorder} ${subtleSurface}`}>
                                <div className='flex items-center justify-between gap-2'>
                                    <span className={`font-mono text-[10px] ${mutedText}`} style={{ fontFamily: FRAUNCES }}>
                                        0{index + 1}
                                    </span>
                                    <span className={`rounded-xs border px-2 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.15em] ${priorityClass(item.priority, isDark)}`}>{clean(item.priority) || 'Priority'}</span>
                                </div>

                                <p className={`mt-[3.5mm] text-[12.5px] font-bold tracking-tight ${primaryText}`}>{clean(item.section) || 'Resume'}</p>

                                {clean(item.fix) && (
                                    <p className={`mt-[2mm] text-[10px] leading-[1.6] ${secondaryText}`} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                                        {item.fix}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {topActions.length > 0 && (
                <section className={`mt-[5mm] shrink-0 px-[5mm] py-[5mm] ${darkPanel} text-white`}>
                    <div className='mb-[4mm] flex items-end justify-between'>
                        <p className='font-mono text-[8.5px] font-bold uppercase tracking-[0.25em] text-zinc-400'>What to do next</p>
                        <span className='font-mono text-[7.5px] uppercase tracking-[0.2em] text-zinc-500'>Action plan</span>
                    </div>

                    <div className='flex'>
                        {topActions.map((item, index) => (
                            <div key={`${item.timeline}-${index}`} className={`flex-1 ${index !== 0 ? 'border-l-[0.5px] border-zinc-700 pl-[6mm]' : ''} ${index !== topActions.length - 1 ? 'pr-[6mm]' : ''}`}>
                                <p className='font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500'>{clean(item.timeline) || 'Next'}</p>
                                <p className='mt-[2.5mm] text-[10.5px] font-light leading-[1.6] text-zinc-200' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                                    {clean(item.action) || 'Continue improving your resume'}
                                </p>

                                {clean(item.impact) && <p className='mt-[3mm] font-mono text-[7.5px] uppercase tracking-[0.2em] text-zinc-600'>{item.impact} impact</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className={`mt-[5mm] mb-[4mm] flex shrink-0 gap-[10mm] border-t-[1.5px] pt-[5mm] ${strongBorder}`}>
                <div className='flex-[0.55]'>
                    <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.28em] ${primaryText}`}>Bottom line</p>
                    <p className={`mt-[3mm] text-[26px] leading-[0.9] tracking-[-0.02em] ${primaryText}`} style={{ fontFamily: FRAUNCES }}>
                        {clean(hero?.verdict) || 'Needs Work'}
                    </p>

                    <p className={`mt-[3.5mm] text-[9px] leading-[1.6] ${secondaryText}`}>{candidate?.ready_to_apply ? 'Your resume is ready for applications, with a few high-impact improvements remaining.' : 'Your resume needs improvement before applying.'}</p>
                </div>

                <div className={`flex-[1.45] border-l-[0.5px] pl-[8mm] ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
                    <p className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.28em] ${mutedText}`}>Final verdict</p>
                    <p className={`mt-[3mm] max-w-[130mm] text-[14px] font-normal leading-[1.6] ${primaryText}`} style={{ fontFamily: FRAUNCES, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}>
                        {finalVerdict || 'Keep improving and shipping.'}
                    </p>
                </div>
            </section>

            <footer className={`mt-auto flex shrink-0 items-center justify-between border-t-[0.5px] pt-[3.5mm] ${softBorder}`}>
                <span className={`font-mono text-[7.5px] font-bold uppercase tracking-[0.3em] ${primaryText}`}>ScoreMyResume</span>
                <span className={`font-mono text-[7px] uppercase tracking-[0.25em] ${subtleText}`}>AI-generated resume analysis</span>
            </footer>
        </div>
    );
}
