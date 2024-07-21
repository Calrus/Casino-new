import React from 'react';
import './SideBar.css';

const SideBar = () => {
    return (
        <div className="sidebar">
            <div className="logo">Casino App</div>
            <ul>
                <li>Game 1</li>
                <li>Game 2</li>
                <li>Game 3</li>
            </ul>
        </div>
    );
};

export default SideBar;
