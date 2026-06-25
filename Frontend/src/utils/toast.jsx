import React, { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const [confirm, setConfirm] = useState(null)

    const showToast = useCallback((message, type = "error") => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }, [])

    const showConfirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirm({ message, resolve })
        })
    }, [])

    const handleConfirm = (result) => {
        confirm?.resolve(result)
        setConfirm(null)
    }

    const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Confirm dialog */}
            {confirm && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 10001,
                }}>
                    <div style={{
                        background: "#1c2230", border: "1px solid #2a3348",
                        borderRadius: "0.75rem", padding: "1.5rem",
                        maxWidth: "360px", width: "90%", color: "#e6edf3",
                        fontFamily: "system-ui, sans-serif",
                    }}>
                        <p style={{ marginBottom: "1.25rem", fontSize: "0.95rem" }}>{confirm.message}</p>
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                            <button onClick={() => handleConfirm(false)} style={{
                                background: "none", border: "1px solid #2a3348",
                                color: "#7d8590", padding: "0.5rem 1rem",
                                borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.875rem",
                            }}>Cancel</button>
                            <button onClick={() => handleConfirm(true)} style={{
                                background: "#ff4d4d22", border: "1px solid #ff4d4d55",
                                color: "#ff4d4d", padding: "0.5rem 1rem",
                                borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.875rem",
                                fontWeight: 600,
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast stack */}
            <div style={{
                position: "fixed", bottom: "1.5rem", right: "1.5rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
                zIndex: 10000, maxWidth: "360px",
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        background: t.type === "error" ? "#2d1a1a" : t.type === "success" ? "#1a2d1a" : "#1c2230",
                        border: `1px solid ${t.type === "error" ? "#ff4d4d55" : t.type === "success" ? "#3fb95055" : "#2a3348"}`,
                        borderLeft: `3px solid ${t.type === "error" ? "#ff4d4d" : t.type === "success" ? "#3fb950" : "#f5a623"}`,
                        borderRadius: "0.5rem", padding: "0.75rem 1rem",
                        color: "#e6edf3", fontSize: "0.875rem", lineHeight: 1.5,
                        display: "flex", alignItems: "flex-start", gap: "0.75rem",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                        animation: "slideIn 0.2s ease",
                    }}>
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <button onClick={() => dismiss(t.id)} style={{
                            background: "none", border: "none", color: "#7d8590",
                            cursor: "pointer", padding: 0, fontSize: "1rem", lineHeight: 1,
                        }}>×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}