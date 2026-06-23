import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import axios from "axios"

function App() {
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true }).catch(() => {})
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App