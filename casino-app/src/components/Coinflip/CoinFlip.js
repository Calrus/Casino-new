import React, { useState, useContext } from 'react';
import axios from 'axios';
import AccountContext from '../Account/AccountContext';
import './CoinFlip.css';

const CoinFlip = () => {
    const { account, updateBalance } = useContext(AccountContext);
    const [betAmount, setBetAmount] = useState(0);
    const [chosenSide, setChosenSide] = useState('');
    const [gameStatus, setGameStatus] = useState('betting');
    const [flipResult, setFlipResult] = useState('');
    const [isFlipping, setIsFlipping] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleBetChange = (amount) => {
        setBetAmount(amount);
    };

    const handleSideChange = (side) => {
        setChosenSide(side);
    };

    const handleFlip = async () => {
        if (betAmount > account.balance) {
            alert('Insufficient balance to place the bet.');
            return;
        }
        if (!chosenSide) {
            alert('Please choose heads or tails.');
            return;
        }

        setIsUpdating(true);
        setIsFlipping(true);

        try {
            const response = await axios.post('http://localhost:3001/game/coinflip/flip', { betAmount, chosenSide }, {
                headers: { Authorization: `Bearer ${account.token}` },
            });

            setTimeout(() => {
                setFlipResult(response.data.flipResult);
                setGameStatus('finished');
                setIsFlipping(false);
                updateBalance(account.username, response.data.newBalance);
            }, 1000);

        } catch (error) {
            console.error('Error flipping coin:', error.response);
            setIsFlipping(false);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="coin-flip">
            <div className="coin-flip-controls">
                {gameStatus === 'betting' && (
                    <>
                        <div className="bet-section">
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => handleBetChange(parseInt(e.target.value))}
                                placeholder="Bet Amount"
                            />
                        </div>
                        <div className="side-buttons">
                            <button onClick={() => handleSideChange('heads')} className={chosenSide === 'heads' ? 'selected' : ''}>Heads</button>
                            <button onClick={() => handleSideChange('tails')} className={chosenSide === 'tails' ? 'selected' : ''}>Tails</button>
                        </div>
                        <button onClick={handleFlip} disabled={isUpdating} className="flip-button">Flip Coin</button>
                    </>
                )}
                {gameStatus === 'finished' && (
                    <>
                        <p>Result: {flipResult === chosenSide ? 'You Win!' : 'You Lose!'}</p>
                        <p>Coin landed on: {flipResult}</p>
                        <button onClick={() => {
                            setGameStatus('betting');
                            setFlipResult('');
                            setChosenSide('');
                        }}>Play Again</button>
                    </>
                )}
            </div>
            <div className="coin-container">
                <div className={`coin ${isFlipping ? 'flipping' : flipResult}`}>
                    <div className="heads">
                        <img src="/path/to/heads-image.png" alt="Heads" />
                    </div>
                    <div className="tails">
                        <img src="/path/to/tails-image.png" alt="Tails" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoinFlip;
