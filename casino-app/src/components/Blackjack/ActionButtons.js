import React, { useEffect } from 'react';
import { FaHandPaper, FaHandRock, FaHandScissors, FaDollarSign } from 'react-icons/fa';

const ActionButtons = ({ onHit, onStand, onDouble, onPlaceBet, betDisabled, actionDisabled, gameStatus }) => {
    useEffect(() => {
        if (gameStatus === 'finished') {
            // Enable the bet button
            betDisabled = false;
        }
    }, [gameStatus]);

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
                    className={`action-button ${actionDisabled ? 'button-disabled' : ''}`}
                    onClick={onDouble}
                    disabled={actionDisabled}
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
