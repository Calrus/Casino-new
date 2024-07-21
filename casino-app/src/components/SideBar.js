import React from 'react';
import { Link } from 'react-router-dom';
import './SideBar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="logo">Casino App</div>
            <ul>
                <li>
                    <Link to="/blackjack">Blackjack</Link>
                </li>
                {/* Add other game links here */}
            </ul>
        </div>
    );
};

export default Sidebar;
