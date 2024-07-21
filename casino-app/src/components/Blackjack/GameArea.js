import React from 'react';

const GameArea = ({ playerHand, dealerHand }) => {
    const cardValueMap = {
        '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
        'J': 'jack', 'Q': 'queen', 'K': 'king', 'A': 'ace'
    };

    const renderCard = (card) => {
        const cardValue = cardValueMap[card.value];
        const cardImage = `${cardValue}_of_${card.suit}.png`;
        return (
            <img
                key={`${card.value}_of_${card.suit}`}
                src={`${process.env.PUBLIC_URL}/cards/${cardImage}`}
                alt={`${card.value} of ${card.suit}`}
                className="card"
            />
        );
    };

    return (
        <div className="game-area">
            <div className="dealer-area">
                <h2>Dealer's Hand</h2>
                <div className="hand">
                    {dealerHand.map((card) => renderCard(card))}
                </div>
            </div>
            <div className="player-area">
                <h2>Player's Hand</h2>
                <div className="hand">
                    {playerHand.map((card) => renderCard(card))}
                </div>
            </div>
        </div>
    );
};

export default GameArea;
