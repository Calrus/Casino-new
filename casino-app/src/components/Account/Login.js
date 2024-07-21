import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountContext from './AccountContext';

const Login = () => {
    const { login } = useContext(AccountContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        const isSuccess = await login(username, password);
        if (isSuccess) {
            setLoginError(false);
            setLoginSuccess(true);
            // Redirect to home or another route
            setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
        } else {
            setLoginError(true);
            setLoginSuccess(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {loginError && <p>Invalid username or password</p>}
            {loginSuccess && <p>Login successful! Redirecting...</p>}
        </div>
    );
};

export default Login;
