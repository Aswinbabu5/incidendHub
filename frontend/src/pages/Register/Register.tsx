import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../../API/api"
import "./Register.css"

const Register = () => {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "viewer"
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleRegister = async () => {
        try {
            setLoading(true)
            setError("")

            await api.post("/auth/register", form)

            navigate("/")
        }
        catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            )
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">

            <div className="register-card">

                <div className="register-header">
                    <h1>IncidentHub Register</h1>
                    <p>Create your IncidentHub account</p>
                </div>

                <div className="register-field">
                    <label>Name</label>

                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                name: e.target.value
                            })
                        }
                    />
                </div>

                <div className="register-field">
                    <label>Email</label>

                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                email: e.target.value
                            })
                        }
                    />
                </div>

                <div className="register-field">
                    <label>Password</label>

                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value
                            })
                        }
                    />
                </div>

                <div className="register-field">
                    <label>Role</label>

                    <select
                        value={form.role}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                role: e.target.value
                            })
                        }
                    >
                        <option value="viewer">Viewer</option>
                        <option value="engineer">Engineer</option>
                    </select>
                </div>

                {error && (
                    <p className="register-error">
                        {error}
                    </p>
                )}

                <p className="register-login">
                    Already have an account?{" "}
                    <Link to="/">
                        Login
                    </Link>
                </p>

                <button
                    className="register-button"
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading
                        ? "Creating Account..."
                        : "Register"}
                </button>

            </div>

        </div>
    )
}

export default Register