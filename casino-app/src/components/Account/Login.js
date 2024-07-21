import React, { useState, useContext } from 'react';
import AccountContext from './AccountContext';

const Login = () => {
    const { login } = useContext(AccountContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);

    const handleLogin = () => {
        const isSuccess = login(username, password);
        if (isSuccess) {
            setLoginError(false);
            // Handle successful login
        } else {
            setLoginError(true);
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
        </div>
    );
};

export default Login;
