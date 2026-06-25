import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../../../utils/usePageTitle'

const Login = () => {
    usePageTitle('Login')
    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail]         = useState("")
    const [password, setPassword]   = useState("")
    const [error, setError]         = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        try {
            await handleLogin({ email, password })
            navigate('/verify-otp', { state: { email, type: 'login' } })
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main>
            {/* ── Left Panel ── */}
            <div className="auth-left">
                <Link to="/" className="auth-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#ff2d78"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                    PrepAI
                </Link>

                <div className="auth-left__content">
                    <h2>Ace your next<br /><span>interview</span></h2>
                    <p>AI-powered preparation that adapts to every job you apply for.</p>

                    <ul className="auth-features">
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Personalized questions from real job descriptions
                        </li>
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Face-to-face mock interview with AI voice
                        </li>
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Day-by-day preparation roadmap
                        </li>
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Instant skill gap analysis
                        </li>
                    </ul>
                </div>

                <div className="auth-left__quote">
                    <p>"The best way to predict your future is to prepare for it."</p>
                </div>
            </div>

            {/* ── Right Panel (Form) ── */}
            <div className="auth-right">
                <div className="form-container">
                    <div className="form-heading">
                        <h1>Welcome back</h1>
                        <p className="form-sub">Login to continue your interview prep</p>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input onChange={e => setEmail(e.target.value)}
                                type="email" id="email" placeholder='you@example.com' required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input onChange={e => setPassword(e.target.value)}
                                type="password" id="password" placeholder='Enter your password' required />
                        </div>
                        <button className='primary-button' disabled={submitting}>
                            {submitting ? 'Sending OTP...' : 'Continue →'}
                        </button>
                    </form>

                    <p className="form-footer">Don't have an account? <Link to="/register">Create one free</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login
