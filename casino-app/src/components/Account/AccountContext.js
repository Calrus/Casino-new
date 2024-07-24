import React, { createContext, useState } from 'react';
import axios from 'axios';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [account, setAccount] = useState(null);

    const register = async (username, password) => {
        try {
            await axios.post('http://localhost:3001/auth/register', { username, password });
            console.log('Registration successful');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                throw new Error('Username already exists');
            } else {
                console.error('Registration error:', error.response ? error.response.data : error.message);
                throw new Error('Registration failed');
            }
        }
    };

    const login = async (username, password) => {
        try {
            console.log('Attempting login with:', username, password);
            const response = await axios.post('http://localhost:3001/auth/login', { username, password });
            console.log('Login response:', response.data);
            const { token, balance } = response.data;
            setAccount({ username, balance, token });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header with 'Bearer'
            return true;
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            return false;
        }
    };

    const updateBalance = async (username, balance) => {
        try {
            await axios.put(`http://localhost:3001/account/${username}/balance`, { balance }, {
                headers: { Authorization: `Bearer ${account.token}` } // Ensure token is included
            });
            setAccount((prevAccount) => ({ ...prevAccount, balance }));
        } catch (error) {
            console.error('Update balance error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <AccountContext.Provider value={{ account, register, login, updateBalance }}>
            {children}
        </AccountContext.Provider>
    );
};

export default AccountContext;
