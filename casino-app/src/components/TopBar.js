import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineDollar } from 'react-icons/ai';
import AccountContext from './Account/AccountContext';
import './TopBar.css';

const TopBar = () => {
    const { account } = useContext(AccountContext);
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/userinfo');
    };

    return (
        <div className="top-bar">
            <div className="left-section">
                <div className="logo">Casino App</div>
            </div>
            <div className="center-section">
                <div className="balance-container">
                    <AiOutlineDollar /> {account ? account.balance : 'Loading...'}
                </div>
            </div>
            <div className="right-section">
                <div className="profile" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                    <FaUserCircle size={30} />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
