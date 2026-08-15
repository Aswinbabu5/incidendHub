import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../API/authApi'
import './Login.css'
import { getErrorMessage } from '../../Utils/errorHandler'

const Login = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPass] = useState<string>("")
    const [error, setError] = useState<string>("")

    const navigate = useNavigate()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault()
            setError("")

            const data = await loginUser({ email, password })

            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.User))

            navigate("/dashboard")
        }
        catch (error) {
            setError(getErrorMessage(error, "Invalid email or password"))
        }
    }
    return (
        <div className='login-page'>
            <div className='login-container'>
                <h1>IncidentHub Login</h1>
                <p className='login-subtitle'>Sign-in To Manage Incidents</p>
                <form className='login-form' onSubmit={handleSubmit}>
                    <section className='form-group'>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </section>

                    <section className='form-group'>
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPass(e.target.value)} required />
                    </section>
                    {
                        error && <p className='login-error'>{error}</p>
                    }
                    <span>Don't have an account?{" "}<a href="" onClick={(e) => {e.preventDefault(); navigate("/register")}}>register</a></span>
                    <button type='submit' className='login-button'>Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login
