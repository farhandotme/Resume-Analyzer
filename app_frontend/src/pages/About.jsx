import Navbar from '../components/Navbar';

export default function About() {
    return (
        <div className='relative min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col overflow-hidden'>
            <Navbar />
            <div className='relative z-10 w-[80%] md:w-[60%] mx-auto py-20 flex flex-col gap-10'>
                <div className='flex flex-col gap-3'>
                    <h1 className='text-4xl font-black'>About <span className='text-[#F5C517]'>Resume Analyser</span></h1>
                    <p className='text-gray-400 text-lg leading-relaxed'>Resume Analyser is an AI-powered tool that helps job seekers understand exactly what their resume is missing — skills, experience gaps, and what companies are actually looking for.</p>
                </div>
                <div className='h-px w-full bg-linear-to-r from-[#D9A919]/30 via-[#D9A919]/10 to-transparent' />
                <div className='flex flex-col gap-4'>
                    <h2 className='text-xl font-bold text-[#D9A919]'>How it works</h2>
                    <ul className='flex flex-col gap-3 text-gray-400 text-base leading-relaxed list-none'>
                        <li className='flex gap-3'><span className='text-[#D9A919] font-bold mt-0.5'>01</span> Upload your resume in PDF or text format.</li>
                        <li className='flex gap-3'><span className='text-[#D9A919] font-bold mt-0.5'>02</span> Our AI scans it for skills, gaps, and missing keywords.</li>
                        <li className='flex gap-3'><span className='text-[#D9A919] font-bold mt-0.5'>03</span> Get instant feedback tailored to the roles you're targeting.</li>
                        <li className='flex gap-3'><span className='text-[#D9A919] font-bold mt-0.5'>04</span> Ask follow-up questions about your resume in plain English.</li>
                    </ul>
                </div>
                <div className='h-px w-full bg-linear-to-r from-[#D9A919]/30 via-[#D9A919]/10 to-transparent' />
                <div className='flex flex-col gap-4'>
                    <h2 className='text-xl font-bold text-[#D9A919]'>Built with</h2>
                    <p className='text-gray-400 text-base leading-relaxed'>React, Tailwind CSS, Node.js, and powered by large language models for resume analysis and chat.</p>
                </div>
                <p className='text-[#555] text-sm italic'>More detailed documentation, feature breakdown, and team info coming soon.</p>
            </div>
        </div>
    );
}