import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Token retrieved from local storage:', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Optionally validate the token with a backend call here
            setAccount({ token }); // Simplified for example; retrieve full account data as needed
        }
    }, []);

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
            console.log('Attempting to login with', username, password);
            const response = await axios.post('http://localhost:3001/auth/login', { username, password });
            console.log('Login response:', response.data);
            const { token, balance } = response.data;
            localStorage.setItem('token', token);
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('Authorization header set with token:', token);
            } else {
                console.error('Failed to set authorization header: No token found');
            }
            setAccount({ username, balance, token });
            return true;
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            return false;
        }
    };

    const updateBalance = async (username, balance) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.put(`http://localhost:3001/account/${username}/balance`, { balance }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAccount((prevAccount) => ({ ...prevAccount, balance }));
            } else {
                console.error('Failed to update balance: No token found');
            }
        } catch (error) {
            console.error('Update balance error:', error.response ? error.response.data : error.message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setAccount(null);
    };

    return (
        <AccountContext.Provider value={{ account, register, login, updateBalance, logout }}>
            {children}
        </AccountContext.Provider>
    );
};

export default AccountContext;
