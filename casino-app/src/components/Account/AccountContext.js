import React, { createContext, useState } from 'react';
import axios from 'axios';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [account, setAccount] = useState(null);

    const register = async (username, password) => {
        try {
            await axios.post('http://localhost:3001/register', { username, password });
            setAccount({ username, balance: 1000 });
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password });
            setAccount({ username, balance: response.data.balance });
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const updateBalance = async (username, balance) => {
        try {
            await axios.put(`http://localhost:3001/account/${username}/balance`, { balance });
            setAccount((prevAccount) => ({ ...prevAccount, balance }));
        } catch (error) {
            console.error('Update balance error:', error);
        }
    };

    return (
        <AccountContext.Provider value={{ account, register, login, updateBalance }}>
            {children}
        </AccountContext.Provider>
    );
};

export default AccountContext;
