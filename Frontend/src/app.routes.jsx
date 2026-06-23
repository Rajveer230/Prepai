import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./features/auth/pages/login";
import Register from "./features/auth/pages/Register";
import VerifyOtp from "./features/auth/pages/VerifyOtp";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import MockInterview from "./features/interview/pages/MockInterview";
import Profile from "./features/user/pages/Profile";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/verify-otp",
        element: <VerifyOtp />
    },
    {
        path: "/dashboard",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/mock-interview/:sessionId",
        element: <Protected><MockInterview /></Protected>
    },
    {
        path: "/profile",
        element: <Protected><Profile /></Protected>
    }
])
