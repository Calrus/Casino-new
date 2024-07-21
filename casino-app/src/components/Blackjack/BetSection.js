import React from 'react';

const BetSection = ({ betAmount, onBetChange }) => {
    const handleBetChange = (e) => {
        onBetChange(Number(e.target.value));
    };

    return (
        <div className="bet-section">
            <label htmlFor="bet-amount">Bet Amount:</label>
            <input
                type="number"
                id="bet-amount"
                name="bet-amount"
                value={betAmount}
                onChange={handleBetChange}
                placeholder="Enter your bet"
            />
        </div>
    );
};

export default BetSection;
