'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    background: 'linear-gradient(135deg, #fef2f2, #fff, #fff7ed)',
                    padding: '16px',
                }}>
                    <div style={{
                        maxWidth: '400px',
                        width: '100%',
                        background: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        padding: '32px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#fef2f2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '32px',
                        }}>
                            ⚠️
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', margin: '0 0 8px' }}>
                            Critical Error
                        </h2>
                        <p style={{ color: '#666', margin: '0 0 24px' }}>
                            The application encountered a critical error. Please try refreshing.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
