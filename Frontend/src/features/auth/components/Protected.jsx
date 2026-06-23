import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from 'react'
import Navbar from "../../../components/Navbar";

const Protected = ({children}) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <div className='page-spinner'>
                <span className='spinner' />
            </div>
        )
    }

    if (!user) {
        return <Navigate to={'/login'} replace />
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default Protected