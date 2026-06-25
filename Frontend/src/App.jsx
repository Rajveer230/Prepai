import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import api from "./utils/api"

function App() {
  const [warming, setWarming] = useState(false)

  useEffect(() => {
    let timer = setTimeout(() => setWarming(true), 3000)

    api.get("/api/auth/get-me")
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        setWarming(false)
      })

    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider>
      {warming && (
        <div style={{
          position: "fixed", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)",
          background: "#1c2230", border: "1px solid #2a3348", borderRadius: "0.65rem",
          padding: "0.65rem 1.25rem", color: "#e6edf3", fontSize: "0.85rem",
          display: "flex", alignItems: "center", gap: "0.6rem",
          zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <span style={{
            width: 12, height: 12, borderRadius: "50%",
            border: "2px solid #ff2d78", borderTopColor: "transparent",
            display: "inline-block", animation: "spin 0.8s linear infinite",
          }} />
          Server is warming up — this takes ~30s on first load
        </div>
      )}
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App