import React, { useState, useEffect } from 'react';
import '../GameArea.css';

const calculateHandValue = (hand) => {
    if (!hand || !Array.isArray(hand)) {
        return 0;
    }

    let value = 0;
    let numAces = 0;

    hand.forEach(card => {
        if (!card || !card.value) {
            return;
        }

        if (card.value === 'Ace') {
            numAces += 1;
            value += 11; // Initially count Ace as 11
        } else if (['Jack', 'Queen', 'King'].includes(card.value)) {
            value += 10; // Face cards are worth 10
        } else {
            value += parseInt(card.value, 10); // Ensure numeric value for other cards
        }
    });

    // Adjust the value of Aces from 11 to 1 if the total value exceeds 21
    while (value > 21 && numAces > 0) {
        value -= 10; // Convert an Ace from 11 to 1
        numAces -= 1;
    }

    return value;
};

const GameArea = ({ playerHand = [], dealerHand = [], result, dealerSecondCardHidden, gameStatus }) => {
    const [handResult, setHandResult] = useState(null);

    useEffect(() => {
        if (result) {
            setHandResult(result);
        }
    }, [result]);

    useEffect(() => {
        if (gameStatus === 'playing') {
            setHandResult(null);
        }
    }, [gameStatus]);

    const getCardImage = (card) => {
        if (card.suit === 'hidden' && card.value === 'hidden') {
            return '/cards/back.png';
        }
        return `/cards/${card.value}_of_${card.suit}.png`;
    };

    const playerHandValue = calculateHandValue(playerHand);
    const dealerHandValue = calculateHandValue(dealerHand);

    const getResultColor = () => {
        if (handResult === 'Player Wins!') return 'green';
        if (handResult === 'Player Busts!' || handResult === 'Dealer Wins!') return 'red';
        if (handResult === 'Push!') return 'yellow';
        return '';
    };

    return (
        <div className="game-area">
            <div className="dealer-area">
                <h3>Dealer's Hand</h3>
                <div className="hand">
                    {dealerHand.map((card, index) => (
                        <div key={index} className="card">
                            <img src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} />
                        </div>
                    ))}
                </div>
                <div className="hand-value">
                    <p>Value: {dealerSecondCardHidden ? calculateHandValue([dealerHand[0]]) : dealerHandValue}</p>
                </div>
            </div>
            <div className="player-area">
                <h3>Your Hand</h3>
                <div className="hand">
                    {playerHand.map((card, index) => (
                        <div key={index} className="card">
                            <img src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} />
                        </div>
                    ))}
                </div>
                <div className="hand-value" style={{ backgroundColor: getResultColor() }}>
                    <p>Value: {playerHandValue}</p>
                </div>
            </div>
            {handResult && <h2>{handResult}</h2>}
        </div>
    );
};

export default GameArea;
