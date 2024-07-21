import React, { useState } from 'react';
import BetSection from './BetSection';
import ActionButtons from './ActionButtons';
import GameArea from './GameArea';
import TopBar from '../TopBar'; // Ensure correct import
import './Blackjack.css';

const Blackjack = () => {
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerBet, setPlayerBet] = useState(0);
    const [gameStatus, setGameStatus] = useState('betting'); // 'betting', 'playing', 'finished'
    const [betAmount, setBetAmount] = useState(0);
    const [result, setResult] = useState('');
    const [balance, setBalance] = useState(1000); // Initial balance

    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const drawCard = () => {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { suit, value };
    };

    const calculateHandValue = (hand) => {
        let value = 0;
        let numAces = 0;

        hand.forEach(card => {
            if (card.value === 'A') {
                numAces += 1;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value, 10);
            }
        });

        while (value > 21 && numAces > 0) {
            value -= 10;
            numAces -= 1;
        }

        return value;
    };

    const dealInitialCards = () => {
        let playerCards = [drawCard(), drawCard()];
        let dealerCards = [drawCard(), drawCard()];
        setPlayerHand(playerCards);
        setDealerHand(dealerCards);
        setGameStatus('playing');
        setResult('');
    };

    const handleBet = () => {
        if (betAmount > balance) {
            alert('Insufficient balance to place the bet.');
            return;
        }
        setPlayerBet(betAmount);
        setBalance(balance - betAmount);
        dealInitialCards();
    };

    const handleBetChange = (amount) => {
        setBetAmount(amount);
    };

    const handleHit = () => {
        setPlayerHand((prevHand) => [...prevHand, drawCard()]);
    };

    const handleStand = () => {
        let dealerValue = calculateHandValue(dealerHand);
        while (dealerValue < 17) {
            setDealerHand((prevHand) => {
                const newHand = [...prevHand, drawCard()];
                dealerValue = calculateHandValue(newHand);
                return newHand;
            });
        }
        determineResult();
    };

    const determineResult = () => {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        if (dealerValue > 21 || playerValue > dealerValue) {
            setResult('Player Wins!');
            setBalance(balance + playerBet * 2);
        } else if (playerValue < dealerValue) {
            setResult('Dealer Wins!');
        } else {
            setResult('Push!');
            setBalance(balance + playerBet);
        }
        setGameStatus('finished');
    };

    return (
        <div className="blackjack">
            <TopBar balance={balance} />
            <div className="controls">
                <BetSection betAmount={betAmount} onBetChange={handleBetChange} />
                <ActionButtons onHit={handleHit} onStand={handleStand} onPlaceBet={handleBet} />
            </div>
            <GameArea
                playerHand={playerHand}
                dealerHand={dealerHand}
                playerHandValue={calculateHandValue(playerHand)}
                dealerHandValue={calculateHandValue(dealerHand)}
                result={result}
            />
        </div>
    );
};

export default Blackjack;
