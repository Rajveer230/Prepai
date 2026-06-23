import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMock } from '../hooks/useMock'
import { analyzeNervousness } from '../utils/nervousness'
import '../style/mockInterview.scss'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

// ── Speaking Wave ─────────────────────────────────────────────────────────────
const SpeakingWave = () => (
    <div className='speaking-wave'>
        {[...Array(5)].map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />)}
    </div>
)

// ── Nervousness Panel ─────────────────────────────────────────────────────────
const NervousnessPanel = ({ data }) => {
    if (!data || data.score === null) return null

    const { score, label, fillerCount, foundFillers, wpm, totalWords, pace, tips } = data

    const scoreColor = score >= 80 ? '#3fb950' : score >= 60 ? '#f5a623' : score >= 40 ? '#ff8c00' : '#ff4d4d'
    const paceLabel  = pace === 'fast' ? 'Too Fast' : pace === 'slow' ? 'Too Slow' : 'Good'
    const paceColor  = pace === 'good' ? '#3fb950' : '#f5a623'

    const r    = 22
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ

    return (
        <div className='nerv-panel fade-in'>
            <div className='nerv-panel__header'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'/>
                </svg>
                Delivery Analysis
            </div>

            <div className='nerv-metrics'>
                {/* Confidence ring */}
                <div className='nerv-metric nerv-metric--ring'>
                    <svg width='56' height='56' viewBox='0 0 56 56'>
                        <circle cx='28' cy='28' r={r} fill='none' stroke='var(--border)' strokeWidth='4' />
                        <circle cx='28' cy='28' r={r} fill='none'
                            stroke={scoreColor} strokeWidth='4'
                            strokeDasharray={circ}
                            strokeDashoffset={circ - dash}
                            strokeLinecap='round'
                            transform='rotate(-90 28 28)'
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                        <text x='28' y='32' textAnchor='middle' fill='var(--text)'
                            fontSize='11' fontWeight='800'>{score}
                        </text>
                    </svg>
                    <div className='nerv-metric__info'>
                        <span className='nerv-metric__val' style={{ color: scoreColor }}>{label}</span>
                        <span className='nerv-metric__sub'>Confidence</span>
                    </div>
                </div>

                {/* Pace */}
                <div className='nerv-metric'>
                    <div className='nerv-metric__icon nerv-metric__icon--pace'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
                        </svg>
                    </div>
                    <div className='nerv-metric__info'>
                        <span className='nerv-metric__val' style={{ color: paceColor }}>
                            {wpm > 0 ? `${wpm} WPM` : '—'}
                        </span>
                        <span className='nerv-metric__sub'>{wpm > 0 ? paceLabel : 'Pace'}</span>
                    </div>
                </div>

                {/* Filler words */}
                <div className='nerv-metric'>
                    <div className='nerv-metric__icon nerv-metric__icon--filler'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
                        </svg>
                    </div>
                    <div className='nerv-metric__info'>
                        <span className='nerv-metric__val' style={{ color: fillerCount > 3 ? '#f5a623' : 'var(--text)' }}>
                            {fillerCount} filler{fillerCount !== 1 ? 's' : ''}
                        </span>
                        <span className='nerv-metric__sub'>
                            {foundFillers.length > 0
                                ? foundFillers.slice(0, 2).map(f => `"${f.word}" ×${f.count}`).join(' · ')
                                : 'None detected'}
                        </span>
                    </div>
                </div>

                {/* Words */}
                <div className='nerv-metric'>
                    <div className='nerv-metric__icon nerv-metric__icon--words'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <line x1='17' y1='10' x2='3' y2='10'/><line x1='21' y1='6' x2='3' y2='6'/><line x1='21' y1='14' x2='3' y2='14'/><line x1='17' y1='18' x2='3' y2='18'/>
                        </svg>
                    </div>
                    <div className='nerv-metric__info'>
                        <span className='nerv-metric__val'>{totalWords} words</span>
                        <span className='nerv-metric__sub'>{totalWords >= 60 ? 'Detailed' : totalWords >= 30 ? 'Moderate' : 'Too brief'}</span>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <ul className='nerv-tips'>
                {tips.map((tip, i) => (
                    <li key={i}>
                        <span className='nerv-tips__bullet'>→</span>
                        {tip}
                    </li>
                ))}
            </ul>
        </div>
    )
}

// ── Result Screen ─────────────────────────────────────────────────────────────
const ResultScreen = ({ session, nervousnessHistory, onBack }) => {
    const score = session.overallScore
    const color = score >= 80 ? '#3fb950' : score >= 50 ? '#f5a623' : '#ff4d4d'

    const validNerv = nervousnessHistory.filter(n => n !== null && n.score !== null)
    const avgConfidence = validNerv.length
        ? Math.round(validNerv.reduce((s, n) => s + n.score, 0) / validNerv.length)
        : null
    const confColor = avgConfidence >= 80 ? '#3fb950' : avgConfidence >= 60 ? '#f5a623' : '#ff4d4d'

    const totalFillers = validNerv.reduce((s, n) => s + (n.fillerCount || 0), 0)
    const avgWpm = validNerv.length
        ? Math.round(validNerv.filter(n => n.wpm > 0).reduce((s, n) => s + n.wpm, 0) / (validNerv.filter(n => n.wpm > 0).length || 1))
        : 0

    const r = 54, circumference = 2 * Math.PI * r
    const offset = circumference - (score / 100) * circumference

    return (
        <div className='result-screen fade-in'>
            <h1 className='result-screen__title'>Interview Complete!</h1>
            <p className='result-screen__sub'>You answered all {session.questions.length} questions</p>

            {/* Dual score display */}
            <div className='result-scores'>
                <div className='result-score-item'>
                    <svg width='140' height='140' viewBox='0 0 120 120' className='result-ring'>
                        <circle cx='60' cy='60' r={r} fill='none' stroke='var(--border)' strokeWidth='8' />
                        <circle cx='60' cy='60' r={r} fill='none' stroke={color} strokeWidth='8'
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap='round' transform='rotate(-90 60 60)'
                            style={{ transition: 'stroke-dashoffset 1.4s ease', filter: `drop-shadow(0 0 8px ${color}88)` }} />
                        <text x='60' y='56' textAnchor='middle' fill='var(--text)' fontSize='22' fontWeight='800' dominantBaseline='middle'>{score}</text>
                        <text x='60' y='76' textAnchor='middle' fill='var(--muted)' fontSize='10'>/ 100</text>
                    </svg>
                    <p className='result-score-item__label'>Answer Quality</p>
                    <p className='result-score-item__sub' style={{ color }}>
                        {score >= 80 ? 'Excellent' : score >= 50 ? 'Good effort' : 'Needs practice'}
                    </p>
                </div>

                {avgConfidence !== null && (
                    <div className='result-score-item'>
                        <div className='result-conf-ring' style={{ '--color': confColor }}>
                            <svg width='140' height='140' viewBox='0 0 120 120'>
                                <circle cx='60' cy='60' r={r} fill='none' stroke='var(--border)' strokeWidth='8' />
                                <circle cx='60' cy='60' r={r} fill='none' stroke={confColor} strokeWidth='8'
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (avgConfidence / 100) * circumference}
                                    strokeLinecap='round' transform='rotate(-90 60 60)'
                                    style={{ transition: 'stroke-dashoffset 1.4s ease 0.3s', filter: `drop-shadow(0 0 8px ${confColor}88)` }} />
                                <text x='60' y='56' textAnchor='middle' fill='var(--text)' fontSize='22' fontWeight='800' dominantBaseline='middle'>{avgConfidence}</text>
                                <text x='60' y='76' textAnchor='middle' fill='var(--muted)' fontSize='10'>/ 100</text>
                            </svg>
                        </div>
                        <p className='result-score-item__label'>Delivery Score</p>
                        <p className='result-score-item__sub' style={{ color: confColor }}>
                            {avgConfidence >= 80 ? 'Very Confident' : avgConfidence >= 60 ? 'Moderate' : 'Needs work'}
                        </p>
                    </div>
                )}
            </div>

            {/* Delivery stats bar */}
            {avgConfidence !== null && (
                <div className='result-delivery-stats'>
                    <div className='result-delivery-stat'>
                        <span className='result-delivery-stat__val'>{totalFillers}</span>
                        <span className='result-delivery-stat__label'>Total filler words</span>
                    </div>
                    <div className='result-delivery-stat'>
                        <span className='result-delivery-stat__val'>{avgWpm > 0 ? `${avgWpm}` : '—'}</span>
                        <span className='result-delivery-stat__label'>Avg WPM</span>
                    </div>
                    <div className='result-delivery-stat'>
                        <span className='result-delivery-stat__val'>{validNerv.length}</span>
                        <span className='result-delivery-stat__label'>Questions analyzed</span>
                    </div>
                </div>
            )}

            <p className='result-screen__label' style={{ color }}>
                {score >= 80 ? 'Excellent performance!' : score >= 50 ? 'Good effort, keep practicing!' : 'Needs more practice'}
            </p>

            <div className='result-screen__breakdown'>
                {session.questions.map((q, i) => (
                    <div key={i} className='breakdown-item'>
                        <span className='breakdown-item__label'>
                            <span className={`breakdown-item__type breakdown-item__type--${q.type}`}>
                                {q.type === 'technical' ? 'T' : 'B'}
                            </span>
                            Q{i + 1}
                        </span>
                        <span className='breakdown-item__score' style={{
                            color: q.score >= 8 ? '#3fb950' : q.score >= 5 ? '#f5a623' : '#ff4d4d'
                        }}>{q.score ?? 0}/10</span>
                    </div>
                ))}
            </div>

            <button className='mock-btn mock-btn--primary' onClick={onBack}>← Back to Interview Plan</button>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const MockInterview = () => {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { session, loading, evaluation, fetchSession, submitUserAnswer, clearEvaluation } = useMock()

    const [aiState, setAiState]           = useState('idle')
    const [transcript, setTranscript]     = useState('')
    const [interim, setInterim]           = useState('')
    const [isLastQ, setIsLastQ]           = useState(false)
    const [feedbackData, setFeedbackData] = useState(null)
    const [nervData, setNervData]         = useState(null)
    const [nervHistory, setNervHistory]   = useState([])
    const [cameraReady, setCameraReady]   = useState(false)
    const [cameraError, setCameraError]   = useState('')

    const videoRef        = useRef(null)
    const streamRef       = useRef(null)
    const recognitionRef  = useRef(null)
    const listenStartRef  = useRef(null)   // tracks when user started speaking

    const speechSupported = !!SpeechRecognition

    useEffect(() => {
        fetchSession(sessionId)
        return () => { stopCamera(); stopListening(); window.speechSynthesis.cancel() }
    }, [])

    useEffect(() => {
        if (session && session.status === 'active') {
            if (!streamRef.current) startCamera()
            const q = session.questions[session.currentIndex]
            if (q && aiState === 'idle') {
                setTranscript('')
                setInterim('')
                setNervData(null)
                setAiState('speaking')
                speakQuestion(q.question)
            }
        }
    }, [session?.currentIndex, session?.status])

    // ── Camera ────────────────────────────────────────────────────────────────
    const startCamera = async () => {
        setCameraError('')
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current = stream
            if (videoRef.current) videoRef.current.srcObject = stream
            setCameraReady(true)
        } catch (err) {
            setCameraReady(false)
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') setCameraError('permission')
            else if (err.name === 'NotFoundError') setCameraError('notfound')
            else setCameraError('unavailable')
        }
    }

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
    }

    // ── Text-to-Speech ─────────────────────────────────────────────────────────
    const speakQuestion = (text) => {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate  = 0.88
        utterance.pitch = 1.05
        const voices    = window.speechSynthesis.getVoices()
        const preferred = voices.find(v => v.name.includes('Google') && v.lang === 'en-US')
            || voices.find(v => v.lang === 'en-US') || voices[0]
        if (preferred) utterance.voice = preferred
        utterance.onend  = () => { setAiState('listening'); startListening() }
        utterance.onerror= () => { setAiState('listening'); startListening() }
        window.speechSynthesis.speak(utterance)
    }

    // ── Speech Recognition ─────────────────────────────────────────────────────
    const startListening = () => {
        if (!speechSupported) return
        stopListening()
        listenStartRef.current = Date.now()

        const rec = new SpeechRecognition()
        rec.continuous     = true
        rec.interimResults = true
        rec.lang           = 'en-US'

        let final = ''
        rec.onresult = (e) => {
            let interimText = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript
                if (e.results[i].isFinal) {
                    final += (final ? ' ' : '') + t
                    setTranscript(final)
                    setInterim('')
                } else {
                    interimText += t
                    setInterim(interimText)
                }
            }
        }
        rec.onerror = (e) => { if (e.error !== 'aborted') console.error(e.error) }
        rec.start()
        recognitionRef.current = rec
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        recognitionRef.current = null
        setInterim('')
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleDoneAnswering = async () => {
        stopListening()
        window.speechSynthesis.cancel()
        setAiState('evaluating')
        setInterim('')

        const finalAnswer  = transcript.trim()
        const durationSec  = listenStartRef.current
            ? (Date.now() - listenStartRef.current) / 1000
            : 0

        const nerv = analyzeNervousness(finalAnswer, durationSec)
        setNervData(nerv)
        setNervHistory(prev => [...prev, nerv])

        const data = await submitUserAnswer({
            sessionId,
            userAnswer:       finalAnswer,
            nervousnessScore: nerv.score,
            fillerCount:      nerv.fillerCount,
            wpm:              nerv.wpm,
        })
        if (data) {
            setIsLastQ(data.isCompleted)
            setFeedbackData(data.evaluation)
            setAiState('feedback')
        }
    }

    const handleSkip = async () => {
        stopListening()
        window.speechSynthesis.cancel()
        setAiState('evaluating')
        setNervHistory(prev => [...prev, null])
        const data = await submitUserAnswer({ sessionId, userAnswer: '' })
        if (data) {
            setIsLastQ(data.isCompleted)
            setFeedbackData(data.evaluation)
            setAiState('feedback')
        }
    }

    const handleNext = () => {
        setFeedbackData(null)
        setNervData(null)
        setTranscript('')
        clearEvaluation()
        if (isLastQ) fetchSession(sessionId)
        else setAiState('idle')
    }

    // ── Guards ────────────────────────────────────────────────────────────────
    if (loading && !session) {
        return (
            <div className='mock-page mock-page--loading'>
                <span className='spinner' />
                <p>Setting up your interview...</p>
            </div>
        )
    }
    if (!session) return null

    if (session.status === 'completed') {
        return (
            <div className='mock-page'>
                <ResultScreen
                    session={session}
                    nervousnessHistory={nervHistory}
                    onBack={() => navigate(`/interview/${session.reportId}`)}
                />
            </div>
        )
    }

    const currentQ       = session.questions[session.currentIndex]
    const total          = session.questions.length
    const progress       = (session.currentIndex / total) * 100
    const fullTranscript = transcript + (interim ? (transcript ? ' ' : '') + interim : '')

    return (
        <div className='mock-page mock-page--interview'>

            {/* Header */}
            <header className='mock-header'>
                <button className='mock-exit' onClick={() => {
                    window.speechSynthesis.cancel()
                    navigate(`/interview/${session.reportId}`)
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Exit
                </button>
                <p className='mock-header__title'>{session.reportTitle}</p>
                <span className='mock-header__count'>Q{session.currentIndex + 1} / {total}</span>
            </header>

            {/* Progress bar */}
            <div className='mock-progress'>
                <div className='mock-progress__fill' style={{ width: `${progress}%` }} />
            </div>

            {/* Video grid */}
            <div className='video-grid'>

                {/* AI Interviewer */}
                <div className={`interviewer-box ${aiState === 'speaking' ? 'interviewer-box--speaking' : ''}`}>
                    <div className='interviewer-avatar'>
                        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="40" fill="#1c2230"/>
                            <circle cx="40" cy="30" r="14" fill="#2a3348"/>
                            <ellipse cx="40" cy="62" rx="20" ry="13" fill="#2a3348"/>
                            <circle cx="40" cy="30" r="11" fill="#3d4f6b"/>
                            <circle cx="35" cy="28" r="2.5" fill="#e6edf3"/>
                            <circle cx="45" cy="28" r="2.5" fill="#e6edf3"/>
                            <path d="M35 35 Q40 39 45 35" stroke="#e6edf3" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        </svg>
                    </div>
                    <div className='interviewer-info'>
                        <p className='interviewer-name'>Alex Chen</p>
                        <p className='interviewer-role'>Technical Interviewer</p>
                    </div>

                    {aiState === 'speaking' && (
                        <div className='interviewer-status interviewer-status--speaking'>
                            <SpeakingWave /><span>Asking question...</span>
                        </div>
                    )}
                    {aiState === 'listening' && (
                        <div className='interviewer-status interviewer-status--listening'>
                            <span className='status-dot status-dot--green' /><span>Listening...</span>
                        </div>
                    )}
                    {aiState === 'evaluating' && (
                        <div className='interviewer-status interviewer-status--evaluating'>
                            <span className='btn-spinner' style={{ borderTopColor: '#f5a623', borderColor: 'rgba(245,166,35,0.3)' }} />
                            <span>Evaluating...</span>
                        </div>
                    )}
                    {aiState === 'feedback' && (
                        <div className='interviewer-status interviewer-status--feedback'>
                            <span className='status-dot status-dot--blue' /><span>Review feedback</span>
                        </div>
                    )}

                    <div className='question-bubble'>
                        <span className={`q-type-badge q-type-badge--${currentQ.type}`}>{currentQ.type}</span>
                        <p>{currentQ.question}</p>
                    </div>
                </div>

                {/* User Camera */}
                <div className='user-box'>
                    <video ref={videoRef} autoPlay muted playsInline className='user-video'
                        style={{ display: cameraReady ? 'block' : 'none' }} />
                    {!cameraReady && (
                        <div className='user-video-placeholder'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7d8590" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                {cameraError === 'permission' && <line x1="1" y1="1" x2="23" y2="23"/>}
                            </svg>
                            <p>
                                {cameraError === 'permission'  && 'Camera permission denied'}
                                {cameraError === 'notfound'    && 'No camera found'}
                                {cameraError === 'unavailable' && 'Camera unavailable'}
                                {!cameraError                  && 'Starting camera...'}
                            </p>
                            {cameraError === 'permission' && (
                                <p className='camera-hint'>Click the 🔒 lock icon → Allow Camera</p>
                            )}
                            {cameraError && (
                                <button className='mock-btn mock-btn--ghost'
                                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                                    onClick={startCamera}>
                                    Retry
                                </button>
                            )}
                        </div>
                    )}
                    <div className='user-label'>You</div>
                    {aiState === 'listening' && (
                        <div className='user-mic-indicator'><span className='recording-dot' /></div>
                    )}
                </div>
            </div>

            {/* Bottom panel */}
            <div className='interview-bottom'>

                {/* Transcript */}
                {(aiState === 'listening' || aiState === 'evaluating' || aiState === 'feedback') && (
                    <div className='transcript-area fade-in'>
                        <span className='transcript-label'>Your answer</span>
                        <p className='transcript-text'>
                            {fullTranscript || <em className='transcript-placeholder'>Start speaking — your words appear here</em>}
                        </p>
                    </div>
                )}

                {/* Feedback row: AI evaluation + nervousness side by side */}
                {aiState === 'feedback' && (feedbackData || nervData) && (
                    <div className='feedback-row fade-in'>
                        {/* AI Feedback */}
                        {feedbackData && (
                            <div className='inline-feedback'>
                                <div className='inline-feedback__score'>
                                    <span style={{ color: feedbackData.score >= 8 ? '#3fb950' : feedbackData.score >= 5 ? '#f5a623' : '#ff4d4d' }}>
                                        {feedbackData.score}/10
                                    </span>
                                    <div className='score-bar' style={{ width: '140px' }}>
                                        <div className='score-bar__fill' style={{
                                            width: `${feedbackData.score * 10}%`,
                                            background: feedbackData.score >= 8 ? '#3fb950' : feedbackData.score >= 5 ? '#f5a623' : '#ff4d4d'
                                        }} />
                                    </div>
                                    <span className='inline-feedback__badge'>Answer Quality</span>
                                </div>
                                <p className='inline-feedback__text'>{feedbackData.feedback}</p>
                                <ul className='inline-feedback__points'>
                                    {feedbackData.keyPoints.map((p, i) => <li key={i}><span>→</span>{p}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Nervousness Panel */}
                        <NervousnessPanel data={nervData} />
                    </div>
                )}

                {/* Controls */}
                <div className='interview-controls'>
                    {aiState === 'listening' && (
                        <>
                            <button className='mock-btn mock-btn--ghost' onClick={handleSkip} disabled={loading}>Skip</button>
                            <button className='mock-btn mock-btn--primary' onClick={handleDoneAnswering} disabled={loading}>
                                Done Answering →
                            </button>
                        </>
                    )}
                    {aiState === 'feedback' && (
                        <button className='mock-btn mock-btn--primary' onClick={handleNext} disabled={loading}>
                            {isLastQ ? 'View Final Results →' : 'Next Question →'}
                        </button>
                    )}
                    {aiState === 'speaking' && (
                        <button className='mock-btn mock-btn--ghost' onClick={() => {
                            window.speechSynthesis.cancel()
                            setAiState('listening')
                            startListening()
                        }}>
                            Skip Intro →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MockInterview
