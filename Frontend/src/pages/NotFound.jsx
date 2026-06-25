import React from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../utils/usePageTitle'

const NotFound = () => {
    usePageTitle('Page Not Found')

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0d1117',
            color: '#e6edf3',
            textAlign: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
        }}>
            <p style={{ fontSize: '5rem', fontWeight: 800, color: '#ff2d78', margin: 0, lineHeight: 1 }}>404</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '1rem 0 0.5rem' }}>Page not found</h1>
            <p style={{ color: '#7d8590', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
            <Link to="/" style={{
                background: '#ff2d78',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
            }}>← Back to Home</Link>
        </div>
    )
}

export default NotFound