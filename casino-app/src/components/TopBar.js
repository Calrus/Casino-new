import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineDollar } from 'react-icons/ai';
import './TopBar.css';

const TopBar = () => {
    return (
        <div className="top-bar">
            <div className="balance-container">
                <div className="balance">
                    <AiOutlineDollar /> 1000
                </div>
            </div>
            <div className="profile">
                <FaUserCircle size={30} />
            </div>
        </div>
    );
};

export default TopBar;
