import "./Loading.css"

interface LoadingProps {
    text?: string
}

const Loading = ({ text = "Loading..." }: LoadingProps) => {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{text}</p>
        </div>
    )
}

export default Loading