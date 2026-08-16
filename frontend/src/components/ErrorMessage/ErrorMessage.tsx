import "./ErrorMessage.css"

interface ErrorMessageProps {
    message: string
    onRetry?: () => void
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
    return (
        <div className="error-container">
            <div className="error-icon">!</div>
            <h2>Something went wrong</h2>
            <p>{message}</p>
            {
                onRetry && (
                    <button onClick={onRetry}>Try Again</button>
                )
            }
        </div>
    )
}

export default ErrorMessage