import React, { useState, useContext } from 'react';
import AccountContext from './AccountContext';

const Register = () => {
    const { register } = useContext(AccountContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async () => {
        try {
            await register(username, password);
            setUsername('');
            setPassword('');
            setErrorMessage(''); // Clear any previous error message
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div>
            <h2>Register</h2>
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
            <button onClick={handleRegister}>Register</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default Register;
