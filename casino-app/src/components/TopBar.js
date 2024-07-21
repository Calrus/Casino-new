import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineDollar } from 'react-icons/ai';
import './TopBar.css';

const TopBar = () => {
    return (
        <div className="top-bar">
            <div className="left-section">
                <div className="logo">Casino App</div>
            </div>
            <div className="center-section">
                <div className="balance-container">
                    <AiOutlineDollar /> 1000
                </div>
            </div>
            <div className="right-section">
                <div className="profile">
                    <FaUserCircle size={30} />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
