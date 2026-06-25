import api from "../../../utils/api";

export async function startMockSession(reportId) {
    const response = await api.post(`/api/mock/start/${reportId}`)
    return response.data
}

export async function submitAnswer({ sessionId, userAnswer, nervousnessScore, fillerCount, wpm }) {
    const response = await api.post(`/api/mock/submit/${sessionId}`, {
        userAnswer,
        nervousnessScore,
        fillerCount,
        wpm,
    })
    return response.data
}

export async function getSession(sessionId) {
    const response = await api.get(`/api/mock/${sessionId}`)
    return response.data
}