import React from 'react';
import { FaHandPaper, FaHandRock, FaHandScissors, FaDollarSign } from 'react-icons/fa';

const ActionButtons = ({ onHit, onStand, onPlaceBet }) => {
    return (
        <div className="action-buttons">
            <div className="actions">
                <button className="action-button" onClick={onHit}>
                    <FaHandRock /> Hit
                </button>
                <button className="action-button" onClick={onStand}>
                    <FaHandPaper /> Stand
                </button>
                <button className="action-button" disabled>
                    <FaHandScissors /> Split
                </button>
                <button className="action-button" disabled>
                    <FaDollarSign /> Double
                </button>
            </div>
            <div className="bet-button-container">
                <button className="bet-button" onClick={onPlaceBet}>
                    Bet
                </button>
            </div>
        </div>
    );
};

export default ActionButtons;
