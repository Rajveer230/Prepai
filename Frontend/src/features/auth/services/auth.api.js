import api from "../../../utils/api";

export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', { username, email, password })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function logout() {
    const response = await api.post("/api/auth/logout")
    localStorage.removeItem("token")
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function verifyOtp({ email, otp }) {
    const response = await api.post("/api/auth/verify-otp", { email, otp })
    if (response.data.token) {
        localStorage.setItem("token", response.data.token)
    }
    return response.data
}

export async function resendOtp({ email }) {
    const response = await api.post("/api/auth/resend-otp", { email })
    return response.data
}