import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../api/authApi";

const DEMO_EMAIL = "demo@aiemployee.local";
const DEMO_PASSWORD = "employee123";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isFormValid = email.trim().includes("@") && password.trim().length >= 6;

    function useDemoAccount() {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        setError("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        if (!trimmedEmail || !trimmedEmail.includes("@")) return setError("Enter a valid email address");
        if (trimmedPassword.length < 6) return setError("Password must be at least 6 characters long");

        setError("");
        setLoading(true);
        try {
            if (trimmedEmail === DEMO_EMAIL && trimmedPassword === DEMO_PASSWORD) {
                login("demo-session", { id: 1, name: "Alex Morgan", role: "admin" });
                navigate("/dashboard");
                return;
            }

            const response = await loginUser({ email: trimmedEmail, password: trimmedPassword });
            if (!response.success) throw new Error("Invalid email or password");
            login(response.token, response.user);
            navigate("/dashboard");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Unable to sign in right now.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand"><span>✦</span> AI Employee</div>
                <h1 className="login-heading">Welcome back.</h1>
                <p className="login-subtitle">Sign in to your autonomous workspace.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email" className="login-label">Email</label>
                    <input id="email" className="login-input" type="email" placeholder="you@company.com" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
                    <label htmlFor="password" className="login-label">Password</label>
                    <div className="password-container">
                        <input id="password" className="login-input" type={showPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
                        <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "◉" : "◌"}</button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button" disabled={!isFormValid || loading}>{loading ? "Signing in..." : "Sign in"}</button>
                </form>
                <button className="demo-button" onClick={useDemoAccount}>Try demo workspace <span>→</span></button>
                <p className="demo-hint">Demo: {DEMO_EMAIL} · {DEMO_PASSWORD}</p>
            </div>
        </div>
    );
}

export default Login;
