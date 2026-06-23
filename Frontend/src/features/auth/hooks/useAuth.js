import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, verifyOtp, resendOtp } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            return data
        } catch (err) {
            const message = err?.response?.data?.message || "Login failed. Check your credentials."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            return data
        } catch (err) {
            const message = err?.response?.data?.message || "Registration failed."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async ({ email, otp }) => {
        setLoading(true)
        try {
            const data = await verifyOtp({ email, otp })
            setUser(data.user)
            return true
        } catch (err) {
            const message = err?.response?.data?.message || "Verification failed."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async ({ email }) => {
        try {
            await resendOtp({ email })
            return true
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to resend OTP."
            throw new Error(message)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleVerifyOtp, handleResendOtp, handleLogout }
}
