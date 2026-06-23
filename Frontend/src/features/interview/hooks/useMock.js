import { useState } from "react"
import { startMockSession, submitAnswer, getSession } from "../services/mock.api"

export const useMock = () => {
    const [session, setSession]       = useState(null)
    const [evaluation, setEvaluation] = useState(null)
    const [loading, setLoading]       = useState(true)

    const startSession = async (reportId) => {
        setLoading(true)
        try {
            const data = await startMockSession(reportId)
            setSession(data.session)
            return data.session
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to start mock interview")
            return null
        } finally {
            setLoading(false)
        }
    }

    const submitUserAnswer = async ({ sessionId, userAnswer, nervousnessScore, fillerCount, wpm }) => {
        setLoading(true)
        setEvaluation(null)
        try {
            const data = await submitAnswer({ sessionId, userAnswer, nervousnessScore, fillerCount, wpm })
            setEvaluation(data.evaluation)
            setSession(prev => ({
                ...prev,
                currentIndex: data.isCompleted ? prev.currentIndex : data.nextIndex,
                status: data.isCompleted ? "completed" : "active",
                overallScore: data.overallScore ?? prev.overallScore,
            }))
            return data
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to submit answer")
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchSession = async (sessionId) => {
        setLoading(true)
        try {
            const data = await getSession(sessionId)
            setSession(data.session)
        } catch (err) {
            alert(err?.response?.data?.message || "Session not found")
        } finally {
            setLoading(false)
        }
    }

    const clearEvaluation = () => setEvaluation(null)

    return { session, loading, evaluation, startSession, submitUserAnswer, fetchSession, clearEvaluation }
}
