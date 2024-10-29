import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        const signupData = { email, password };

        fetch(`http://localhost:4000/signup`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData),
        })
            .then(response => {
                if (!response.ok) {
                    // Log response details for debugging
                    console.error("Response not ok:", response);
                    return response.json().then(err => {
                        throw new Error(err.error || "Signup failed");
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.userId) { // Assuming userId is returned on successful signup
                    alert("Signup successful. Please login.");
                    navigate("/login"); // Redirect to login page after successful signup
                } else {
                    alert("Signup failed. Please try again.");
                }
            })
            .catch(error => {
                console.error("Error signing up:", error);
                alert("An error occurred: " + error.message); // Alert the user about the error
            });
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup} className="auth-form">
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
                <button type="submit" className="auth-button">Sign Up</button>
            </form>
            <p className="auth-cta">
                Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
        </div>
    );
};

export default Signup;
