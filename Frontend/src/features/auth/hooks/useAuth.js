import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data.token) localStorage.setItem("token", data.token)
            setUser(data.user)
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
            if (data.token) localStorage.setItem("token", data.token)
            setUser(data.user)
            return data
        } catch (err) {
            const message = err?.response?.data?.message || "Registration failed."
            throw new Error(message)
        } finally {
            setLoading(false)
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

    return { user, loading, handleRegister, handleLogin, handleLogout }
}