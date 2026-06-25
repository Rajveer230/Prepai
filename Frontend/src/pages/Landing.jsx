import React from 'react'
import { usePageTitle } from '../utils/usePageTitle'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import './landing.scss'

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
        ),
        title: 'AI-Powered Prep',
        desc: 'Paste any job description — our AI generates a custom interview strategy tailored to that exact role.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
        ),
        title: 'Mock Interview',
        desc: 'Practice face-to-face with an AI interviewer. Speak your answers — get scored and feedback instantly.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
        ),
        title: 'Preparation Roadmap',
        desc: 'Get a day-by-day study plan that tells you exactly what to learn before your interview.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
        ),
        title: 'Skill Gap Analysis',
        desc: 'Know exactly which skills you are missing so you can focus your time where it matters most.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
        ),
        title: 'Resume Upload',
        desc: 'Upload your PDF resume — the AI reads it and personalizes your interview plan to your background.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        ),
        title: 'Technical + Behavioral',
        desc: 'Get both technical deep-dives and behavioral questions with model STAR-format answers.',
    },
]

const steps = [
    { num: '01', title: 'Paste Job Description', desc: 'Copy the job posting and paste it into the platform.' },
    { num: '02', title: 'Upload Resume or Describe Yourself', desc: 'Let the AI understand your background and experience.' },
    { num: '03', title: 'Get Your Interview Plan', desc: 'Receive questions, roadmap, and skill gap report in ~30 seconds.' },
    { num: '04', title: 'Practice with Mock Interview', desc: 'Speak your answers to an AI interviewer and get real-time feedback.' },
]

const Landing = () => {
    const { user } = useAuth()
    const navigate  = useNavigate()

    return (
        <div className='landing'>

            {/* ── Navbar ── */}
            <nav className='land-nav'>
                <div className='land-nav__brand'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ff2d78"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                    <span>PrepAI</span>
                </div>
                <div className='land-nav__actions'>
                    {user ? (
                        <button className='btn-primary' onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
                    ) : (
                        <>
                            <Link to='/login' className='btn-ghost'>Login</Link>
                            <Link to='/register' className='btn-primary'>Get Started Free</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className='hero'>
                <div className='hero__badge'>AI-Powered Interview Coach</div>
                <h1 className='hero__title'>
                    Prepare Smarter.<br />
                    <span className='hero__accent'>Get Hired Faster.</span>
                </h1>
                <p className='hero__sub'>
                    Paste any job description — our AI builds a personalized interview plan,<br />
                    practice questions, and a mock interview session just for you.
                </p>
                <div className='hero__cta'>
                    {user ? (
                        <button className='btn-primary btn-primary--lg' onClick={() => navigate('/dashboard')}>
                            Go to Dashboard →
                        </button>
                    ) : (
                        <>
                            <Link to='/register' className='btn-primary btn-primary--lg'>Start Preparing Free</Link>
                            <Link to='/login' className='btn-ghost btn-ghost--lg'>I have an account</Link>
                        </>
                    )}
                </div>
                <p className='hero__note'>No credit card required &bull; Free to use</p>

                {/* Stats */}
                <div className='hero__stats'>
                    <div className='stat'><span className='stat__num'>30s</span><span className='stat__label'>To generate plan</span></div>
                    <div className='stat-divider' />
                    <div className='stat'><span className='stat__num'>20+</span><span className='stat__label'>Questions per report</span></div>
                    <div className='stat-divider' />
                    <div className='stat'><span className='stat__num'>AI</span><span className='stat__label'>Voice mock interview</span></div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className='features'>
                <div className='section-header'>
                    <h2>Everything you need to <span className='accent'>ace the interview</span></h2>
                    <p>One platform — from preparation to practice</p>
                </div>
                <div className='features__grid'>
                    {features.map((f, i) => (
                        <div key={i} className='feature-card'>
                            <div className='feature-card__icon'>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className='how-it-works'>
                <div className='section-header'>
                    <h2>How it <span className='accent'>works</span></h2>
                    <p>From job description to interview-ready in minutes</p>
                </div>
                <div className='steps'>
                    {steps.map((s, i) => (
                        <div key={i} className='step'>
                            <div className='step__num'>{s.num}</div>
                            <div className='step__content'>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                            {i < steps.length - 1 && <div className='step__arrow'>→</div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className='cta-banner'>
                <h2>Ready to land your dream job?</h2>
                <p>Start preparing smarter and walk into your next interview with confidence</p>
                {user ? (
                    <button className='btn-primary btn-primary--lg' onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
                ) : (
                    <Link to='/register' className='btn-primary btn-primary--lg'>Start for Free →</Link>
                )}
            </section>

            {/* ── Footer ── */}
            <footer className='land-footer'>
                <span>© 2026 PrepAI — AI Interview Preparation</span>
                <div className='land-footer__links'>
                    <a href='#'>Privacy</a>
                    <a href='#'>Terms</a>
                    <a href='#'>Help</a>
                </div>
            </footer>

        </div>
    )
}

export default Landing
