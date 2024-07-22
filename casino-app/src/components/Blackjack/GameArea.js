import React from 'react';
import '../GameArea.css';

const calculateHandValue = (hand) => {
    let value = 0;
    let numAces = 0;

    hand.forEach(card => {
        if (card && card.value) {
            if (card.value === 'Ace') {
                numAces += 1;
                value += 11; // Initially count Ace as 11
            } else if (['Jack', 'Queen', 'King'].includes(card.value)) {
                value += 10; // Face cards are worth 10
            } else {
                value += parseInt(card.value, 10); // Ensure numeric value for other cards
            }
        }
    });

    // Adjust the value of Aces from 11 to 1 if the total value exceeds 21
    while (value > 21 && numAces > 0) {
        value -= 10; // Convert an Ace from 11 to 1
        numAces -= 1;
    }

    return value;
};

const GameArea = ({ playerHand, dealerHand, result, dealerSecondCardHidden }) => {
    const getCardImage = (card) => {
        if (card.suit === 'hidden' && card.value === 'hidden') {
            return '/cards/back.png';
        }
        return `/cards/${card.value}_of_${card.suit}.png`;
    };

    const playerHandValue = calculateHandValue(playerHand);
    const dealerHandValue = calculateHandValue(dealerHand);

    return (
        <div className="game-area">
            <div className="dealer-area">
                <h3>Dealer's Hand</h3>
                <div className="hand">
                    {dealerHand.map((card, index) => (
                        <div key={index} className="card">
                            <img src={getCardImage(card)} alt={`${card?.value} of ${card?.suit}`} />
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
                            <img src={getCardImage(card)} alt={`${card?.value} of ${card?.suit}`} />
                        </div>
                    ))}
                </div>
                <div className="hand-value">
                    <p>Value: {playerHandValue}</p>
                </div>
            </div>
            {result && <h2>{result}</h2>}
        </div>
    );
};

export default GameArea;
