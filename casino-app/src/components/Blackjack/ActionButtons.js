import React from 'react';
import { FaHandPaper, FaHandRock, FaHandScissors, FaDollarSign } from 'react-icons/fa';

const ActionButtons = ({ onHit, onStand, onPlaceBet, betDisabled, actionDisabled }) => {
    return (
        <div className="action-buttons">
            <div className="actions">
                <button
                    className={`action-button ${actionDisabled ? 'button-disabled' : ''}`}
                    onClick={onHit}
                    disabled={actionDisabled}
                >
                    <FaHandRock /> Hit
                </button>
                <button
                    className={`action-button ${actionDisabled ? 'button-disabled' : ''}`}
                    onClick={onStand}
                    disabled={actionDisabled}
                >
                    <FaHandPaper /> Stand
                </button>
                <button
                    className="action-button button-disabled"
                    disabled
                >
                    <FaHandScissors /> Split
                </button>
                <button
                    className="action-button button-disabled"
                    disabled
                >
                    <FaDollarSign /> Double
                </button>
            </div>
            <div className="bet-button-container">
                <button
                    className={`bet-button ${betDisabled ? 'button-disabled' : ''}`}
                    onClick={onPlaceBet}
                    disabled={betDisabled}
                >
                    Bet
                </button>
            </div>
        </div>
    );
};

export default ActionButtons;
