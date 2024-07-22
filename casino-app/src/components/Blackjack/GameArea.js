import React from 'react';
import '../GameArea.css';

const GameArea = ({ playerHand, dealerHand, result, dealerSecondCardHidden }) => {
    const getCardImage = (card) => {
        if (card.suit === 'hidden' && card.value === 'hidden') {
            return '/cards/back.png';
        }
        return `/cards/${card.value}_of_${card.suit}.png`;
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
                {!dealerSecondCardHidden && <p>Value: {dealerHand.reduce((sum, card) => sum + card.value, 0)}</p>}
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
                <p>Value: {playerHand.reduce((sum, card) => sum + card.value, 0)}</p>
            </div>
            {result && <h2>{result}</h2>}
        </div>
    );
};

export default GameArea;
