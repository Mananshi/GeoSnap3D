import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        fetch("http://localhost:4000/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    navigate("/"); // Redirect to home page after successful login
                } else {
                    alert("Invalid credentials");
                }
            })
            .catch(error => console.error("Error logging in:", error));
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="auth-form">
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="auth-button">Login</button>
            </form>
            <p className="auth-cta">
                Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
