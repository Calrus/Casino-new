import React, { useState } from 'react';
import BetSection from './BetSection';
import ActionButtons from './ActionButtons';
import GameArea from './GameArea';
import './Blackjack.css';

const Blackjack = () => {
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerBet, setPlayerBet] = useState(0);
    const [gameStatus, setGameStatus] = useState('betting'); // 'betting', 'playing', 'finished'
    const [betAmount, setBetAmount] = useState(0);

    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const drawCard = () => {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { suit, value };
    };

    const dealInitialCards = () => {
        let playerCards = [drawCard(), drawCard()];
        let dealerCards = [drawCard(), drawCard()];
        setPlayerHand(playerCards);
        setDealerHand(dealerCards);
        setGameStatus('playing');
    };

    const handleBet = () => {
        setPlayerBet(betAmount);
        dealInitialCards();
    };

    const handleBetChange = (amount) => {
        setBetAmount(amount);
    };

    const handleHit = () => {
        setPlayerHand((prevHand) => [...prevHand, drawCard()]);
    };

    const handleStand = () => {
        // Implement stand logic here
        setGameStatus('finished');
    };

    return (
        <div className="blackjack">
            <div className="controls">
                <BetSection betAmount={betAmount} onBetChange={handleBetChange} />
                <ActionButtons onHit={handleHit} onStand={handleStand} onBet={handleBet} />
            </div>
            <GameArea playerHand={playerHand} dealerHand={dealerHand} />
        </div>
    );
};

export default Blackjack;
