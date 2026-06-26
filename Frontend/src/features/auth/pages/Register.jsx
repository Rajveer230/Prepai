import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../../../utils/usePageTitle'

const Register = () => {
    usePageTitle('Register')
    const navigate = useNavigate()
    const { handleRegister } = useAuth()

    const [username, setUsername]   = useState("")
    const [email, setEmail]         = useState("")
    const [password, setPassword]   = useState("")
    const [error, setError]         = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        try {
            await handleRegister({ username, email, password })
            navigate('/dashboard')
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
                    <h2>Start your journey<br /><span>to success</span></h2>
                    <p>Join thousands of candidates who prepare smarter and land their dream jobs.</p>

                    <ul className="auth-features">
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Free to use — no credit card required
                        </li>
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Generate unlimited interview plans
                        </li>
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Practice with voice-based mock interviews
                        </li>
                        <li>
                            <span className="auth-features__icon">✦</span>
                            Get hired with a personalized strategy
                        </li>
                    </ul>
                </div>

                <div className="auth-left__stats">
                    <div className="auth-stat">
                        <span className="auth-stat__num">30s</span>
                        <span className="auth-stat__label">To generate a plan</span>
                    </div>
                    <div className="auth-stat__divider" />
                    <div className="auth-stat">
                        <span className="auth-stat__num">AI</span>
                        <span className="auth-stat__label">Powered interviews</span>
                    </div>
                    <div className="auth-stat__divider" />
                    <div className="auth-stat">
                        <span className="auth-stat__num">100%</span>
                        <span className="auth-stat__label">Personalized</span>
                    </div>
                </div>
            </div>

            {/* ── Right Panel (Form) ── */}
            <div className="auth-right">
                <div className="form-container">
                    <div className="form-heading">
                        <h1>Create account</h1>
                        <p className="form-sub">Start preparing for your next interview</p>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input onChange={e => setUsername(e.target.value)}
                                type="text" id="username" placeholder='Choose a username' required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input onChange={e => setEmail(e.target.value)}
                                type="email" id="email" placeholder='you@example.com' required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input onChange={e => setPassword(e.target.value)}
                                type="password" id="password" placeholder='Create a password' required />
                        </div>
                        <button className='primary-button' disabled={submitting}>
                            {submitting ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p className="form-footer">Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Register
