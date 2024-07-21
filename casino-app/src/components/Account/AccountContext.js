import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        // Fetch account details when the component mounts
        const fetchAccountDetails = async () => {
            if (account && account.username) {
                try {
                    const response = await axios.get(`http://localhost:3001/account/${account.username}`);
                    setAccount({ username: account.username, balance: response.data.balance });
                } catch (error) {
                    console.error('Error fetching account details:', error.response ? error.response.data : error.message);
                }
            }
        };

        fetchAccountDetails();
    }, []);

    const register = async (username, password) => {
        try {
            await axios.post('http://localhost:3001/register', { username, password });
            setAccount({ username, balance: 1000 });
            console.log('Registration successful');
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
        }
    };

    const login = async (username, password) => {
        try {
            console.log('Attempting login with:', username, password);
            const response = await axios.post('http://localhost:3001/login', { username, password });
            console.log('Login response:', response.data);
            setAccount({ username, balance: response.data.balance });
            return true;
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            return false;
        }
    };

    const updateBalance = async (username, balance) => {
        try {
            await axios.put(`http://localhost:3001/account/${username}/balance`, { balance });
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
