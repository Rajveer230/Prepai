import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const TOTAL = 60

const VerifyOtp = () => {
    const [digits, setDigits]       = useState(['', '', '', '', '', ''])
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [resendTimer, setResendTimer] = useState(TOTAL)
    const inputRefs = useRef([])

    const navigate  = useNavigate()
    const location  = useLocation()
    const { handleVerifyOtp, handleResendOtp } = useAuth()
    const { email, type } = location.state || {}

    useEffect(() => {
        if (!email) navigate('/login')
        else inputRefs.current[0]?.focus()
    }, [])

    useEffect(() => {
        if (resendTimer === 0) return
        const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
        return () => clearTimeout(t)
    }, [resendTimer])

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const next = [...digits]
        next[index] = value.slice(-1)
        setDigits(next)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0)
            inputRefs.current[index - 1]?.focus()
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const next = [...digits]
        pasted.split('').forEach((c, i) => { next[i] = c })
        setDigits(next)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const otp = digits.join('')
        if (otp.length < 6) { setError('Please enter all 6 digits'); return }
        setError('')
        setSubmitting(true)
        try {
            await handleVerifyOtp({ email, otp })
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleResend = async () => {
        if (resendTimer > 0) return
        setError('')
        try {
            await handleResendOtp({ email })
            setSuccess('New OTP sent!')
            setResendTimer(TOTAL)
            setTimeout(() => setSuccess(''), 4000)
        } catch (err) {
            setError(err.message)
        }
    }

    // SVG circular countdown
    const radius   = 20
    const circ     = 2 * Math.PI * radius
    const progress = (resendTimer / TOTAL) * circ

    const filled = digits.filter(Boolean).length

    return (
        <main className="otp-page">

            {/* Animated background blobs */}
            <div className="otp-blob otp-blob--1" />
            <div className="otp-blob otp-blob--2" />
            <div className="otp-blob otp-blob--3" />

            {/* Step bar */}
            <div className="otp-steps">
                <div className="otp-steps__item otp-steps__item--done">
                    <span>1</span><p>{type === 'register' ? 'Register' : 'Login'}</p>
                </div>
                <div className="otp-steps__line" />
                <div className="otp-steps__item otp-steps__item--active">
                    <span>2</span><p>Verify OTP</p>
                </div>
                <div className="otp-steps__line" />
                <div className="otp-steps__item">
                    <span>3</span><p>Dashboard</p>
                </div>
            </div>

            {/* Card */}
            <div className="otp-card">

                {/* Top accent bar */}
                <div className="otp-card__bar" />

                {/* Icon */}
                <div className="otp-card__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </div>

                <h1 className="otp-card__title">Check your inbox</h1>
                <p className="otp-card__sub">
                    We emailed a 6-digit code to<br />
                    <strong>{email}</strong>
                </p>

                {error   && <p className="form-error">{error}</p>}
                {success && <p className="form-success">{success}</p>}

                {/* Progress dots */}
                <div className="otp-progress">
                    {digits.map((d, i) => (
                        <div key={i} className={`otp-progress__dot ${d ? 'otp-progress__dot--on' : ''}`} />
                    ))}
                </div>

                {/* OTP Inputs */}
                <form onSubmit={handleSubmit}>
                    <div className="otp-inputs" onPaste={handlePaste}>
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`otp-input ${digit ? 'otp-input--filled' : ''}`}
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="primary-button otp-submit"
                        disabled={submitting || filled < 6}
                    >
                        {submitting
                            ? <><span className="btn-spinner" /> Verifying…</>
                            : `Verify ${filled}/6 → `
                        }
                    </button>
                </form>

                {/* Circular timer + resend */}
                <div className="otp-timer">
                    {resendTimer > 0 ? (
                        <>
                            <svg className="otp-timer__ring" viewBox="0 0 50 50" width="50" height="50">
                                <circle cx="25" cy="25" r={radius} fill="none" stroke="#2a3348" strokeWidth="3.5" />
                                <circle
                                    cx="25" cy="25" r={radius}
                                    fill="none" stroke="#ff2d78" strokeWidth="3.5"
                                    strokeDasharray={circ}
                                    strokeDashoffset={circ - progress}
                                    strokeLinecap="round"
                                    transform="rotate(-90 25 25)"
                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                                <text x="25" y="30" textAnchor="middle" fill="#e6edf3" fontSize="11" fontWeight="700">
                                    {resendTimer}s
                                </text>
                            </svg>
                            <span>Resend available in {resendTimer}s</span>
                        </>
                    ) : (
                        <button className="resend-btn" type="button" onClick={handleResend}>
                            ↺ Resend OTP
                        </button>
                    )}
                </div>

                <Link
                    to={type === 'register' ? '/register' : '/login'}
                    className="otp-back"
                >
                    ← Back to {type === 'register' ? 'Register' : 'Login'}
                </Link>
            </div>

            {/* PrepAI brand */}
            <Link to="/" className="otp-brand">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ff2d78"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                PrepAI
            </Link>
        </main>
    )
}

export default VerifyOtp
