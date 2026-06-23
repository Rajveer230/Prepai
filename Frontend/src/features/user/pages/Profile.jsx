import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts'
import { fetchProfileStats, changePassword } from '../services/user.api'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/profile.scss'

// ── helpers ────────────────────────────────────────────────────────────────────
const ScoreRing = ({ value, max = 10, size = 80, label }) => {
    const r = 30, circ = 2 * Math.PI * r
    const pct = value != null ? value / max : 0
    const dash = pct * circ
    return (
        <div className="score-ring">
            <svg width={size} height={size} viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={r} fill="none" stroke="#2a3348" strokeWidth="6" />
                <circle cx="35" cy="35" r={r} fill="none"
                    stroke="#ff2d78" strokeWidth="6"
                    strokeDasharray={circ} strokeDashoffset={circ - dash}
                    strokeLinecap="round" transform="rotate(-90 35 35)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x="35" y="40" textAnchor="middle" fill="#e6edf3" fontSize="13" fontWeight="800">
                    {value != null ? value : '—'}
                </text>
            </svg>
            {label && <span className="score-ring__label">{label}</span>}
        </div>
    )
}

const StatCard = ({ icon, label, value, sub, accent }) => (
    <div className="stat-card" style={{ '--accent': accent || '#ff2d78' }}>
        <div className="stat-card__icon">{icon}</div>
        <div className="stat-card__body">
            <span className="stat-card__value">{value ?? '—'}</span>
            <span className="stat-card__label">{label}</span>
            {sub && <span className="stat-card__sub">{sub}</span>}
        </div>
    </div>
)

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__label">{payload[0]?.payload?.title || label}</p>
            <p className="chart-tooltip__val">Score: <strong>{payload[0].value}/10</strong></p>
        </div>
    )
}

// ── main component ────────────────────────────────────────────────────────────
const Profile = () => {
    const navigate = useNavigate()
    const { user: authUser } = useAuth()

    const [data, setData]         = useState(null)
    const [loading, setLoading]   = useState(true)
    const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [pwError, setPwError]   = useState('')
    const [pwSuccess, setPwSuccess] = useState('')
    const [pwLoading, setPwLoading] = useState(false)

    useEffect(() => {
        fetchProfileStats()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handlePwChange = async (e) => {
        e.preventDefault()
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwError('Passwords do not match'); return
        }
        setPwError(''); setPwSuccess(''); setPwLoading(true)
        try {
            const res = await changePassword({
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            })
            setPwSuccess(res.message)
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
            setTimeout(() => setPwSuccess(''), 4000)
        } catch (err) {
            setPwError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setPwLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="profile-loading">
                <span className="spinner" />
                <p>Loading your profile…</p>
            </div>
        )
    }

    const { user, stats } = data || {}
    const initials = user?.username?.slice(0, 2).toUpperCase() || '??'
    const memberDate = user?.memberSince
        ? new Date(user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—'

    return (
        <div className="profile-page">

            {/* ── Top bar ── */}
            <div className="profile-topbar">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Dashboard
                </button>
                <h1 className="profile-topbar__title">My Profile & Analytics</h1>
            </div>

            <div className="profile-grid">

                {/* ══════ LEFT SIDEBAR ══════ */}
                <aside className="profile-sidebar">

                    {/* Avatar card */}
                    <div className="profile-avatar-card">
                        <div className="profile-avatar-card__ring">
                            <div className="profile-avatar-card__av">{initials}</div>
                        </div>
                        <h2 className="profile-avatar-card__name">{user?.username}</h2>
                        <p className="profile-avatar-card__email">{user?.email}</p>
                        <div className="profile-avatar-card__badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                            PrepAI Member
                        </div>
                        <div className="profile-avatar-card__since">
                            Member since {memberDate}
                        </div>
                    </div>

                    {/* Score rings */}
                    <div className="rings-card">
                        <h3 className="card-title">Mock Interview Scores</h3>
                        <div className="rings-row">
                            <ScoreRing value={stats?.avgScore} label="Avg" />
                            <div className="rings-divider" />
                            <ScoreRing value={stats?.bestScore} label="Best" />
                        </div>
                        <p className="rings-note">out of 10 points</p>
                    </div>

                    {/* Change password */}
                    <div className="pw-card">
                        <h3 className="card-title">Change Password</h3>
                        {pwError   && <p className="form-msg form-msg--err">{pwError}</p>}
                        {pwSuccess && <p className="form-msg form-msg--ok">{pwSuccess}</p>}
                        <form onSubmit={handlePwChange} className="pw-form">
                            <div className="pw-field">
                                <label>Current Password</label>
                                <input type="password" placeholder="••••••••"
                                    value={pwForm.currentPassword}
                                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                    required />
                            </div>
                            <div className="pw-field">
                                <label>New Password</label>
                                <input type="password" placeholder="Min 6 characters"
                                    value={pwForm.newPassword}
                                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                    required />
                            </div>
                            <div className="pw-field">
                                <label>Confirm New Password</label>
                                <input type="password" placeholder="Re-enter new password"
                                    value={pwForm.confirm}
                                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                    required />
                            </div>
                            <button type="submit" className="pw-submit" disabled={pwLoading}>
                                {pwLoading ? 'Saving…' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </aside>

                {/* ══════ RIGHT MAIN ══════ */}
                <main className="profile-main">

                    {/* Stat cards */}
                    <div className="stats-grid">
                        <StatCard
                            accent="#ff2d78"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                            label="Interview Plans"
                            value={stats?.totalReports ?? 0}
                            sub="Reports generated"
                        />
                        <StatCard
                            accent="#58a6ff"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                            label="Mock Interviews"
                            value={stats?.totalMocks ?? 0}
                            sub="Completed sessions"
                        />
                        <StatCard
                            accent="#a855f7"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                            label="Average Score"
                            value={stats?.avgScore != null ? `${stats.avgScore}/10` : '—'}
                            sub="Across all sessions"
                        />
                        <StatCard
                            accent="#3fb950"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                            label="Best Score"
                            value={stats?.bestScore != null ? `${stats.bestScore}/10` : '—'}
                            sub="Personal record"
                        />
                    </div>

                    {/* Score trend chart */}
                    <div className="chart-card">
                        <div className="chart-card__header">
                            <h3 className="card-title">Score Progress</h3>
                            <span className="chart-card__sub">Last {stats?.scoreTrend?.length || 0} mock interviews</span>
                        </div>
                        {stats?.scoreTrend?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={stats.scoreTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#ff2d78" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3348" vertical={false} />
                                    <XAxis dataKey="session" tick={{ fill: '#7d8590', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 10]} tick={{ fill: '#7d8590', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone" dataKey="score"
                                        stroke="url(#lineGrad)" strokeWidth={3}
                                        dot={{ fill: '#ff2d78', r: 5, strokeWidth: 0 }}
                                        activeDot={{ r: 7, fill: '#ff2d78', stroke: '#ff8fab', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="chart-empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3d4f6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                <p>Complete a mock interview to see your score trend</p>
                                <Link to="/dashboard">Start Mock Interview →</Link>
                            </div>
                        )}
                    </div>

                    {/* Technical vs Behavioral */}
                    <div className="chart-row">
                        <div className="chart-card">
                            <div className="chart-card__header">
                                <h3 className="card-title">Technical vs Behavioral</h3>
                                <span className="chart-card__sub">Average score (%)</span>
                            </div>
                            {stats?.breakdown?.some(b => b.score > 0) ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={stats.breakdown} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a3348" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#7d8590', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#7d8590', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                                        <Tooltip
                                            formatter={(v) => [`${v}%`, 'Score']}
                                            contentStyle={{ background: '#1e2535', border: '1px solid #2a3348', borderRadius: 8, color: '#e6edf3' }}
                                        />
                                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                            {stats.breakdown.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">
                                    <p>No data yet</p>
                                </div>
                            )}
                        </div>

                        {/* Recent reports */}
                        <div className="chart-card">
                            <div className="chart-card__header">
                                <h3 className="card-title">Recent Plans</h3>
                                <Link to="/dashboard" className="chart-card__link">View all →</Link>
                            </div>
                            {stats?.recentReports?.length > 0 ? (
                                <ul className="recent-list">
                                    {stats.recentReports.map((r, i) => (
                                        <li key={r._id} className="recent-item"
                                            onClick={() => navigate(`/interview/${r._id}`)}>
                                            <div className="recent-item__num">{i + 1}</div>
                                            <div className="recent-item__info">
                                                <p className="recent-item__title">{r.title}</p>
                                                <p className="recent-item__date">
                                                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className={`recent-item__score ${r.matchScore >= 80 ? 'high' : r.matchScore >= 60 ? 'mid' : 'low'}`}>
                                                {r.matchScore}%
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="chart-empty">
                                    <p>No plans generated yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}

export default Profile
