import React from "react"
import './ErrorBoundary.css'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    message: string
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            hasError: false,
            message: ""
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            message: error.message
        }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Global UI Error:", error)
        console.error("Component stack:", info.componentStack)
    }

    handleReload = () => {
        window.location.reload()
    }

    handleDashboard = () => {
        window.location.href = "/dashboard"
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="global-error-page">
                    <div className="global-error-card">
                        <h1>Something went wrong</h1>
                        <p>IncidentHub encountered an unexpected UI error.</p>

                        <div className="global-error-actions">
                            <button onClick={this.handleReload}>Try Again</button>
                            <button onClick={this.handleDashboard}>Go to Dashboard</button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary