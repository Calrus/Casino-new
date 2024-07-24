const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

const drawCard = () => {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
};

const calculateHandValue = (hand) => {
    let value = 0;
    let numAces = 0;

    hand.forEach(card => {
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

const dealInitialCards = () => {
    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];
    return { playerHand, dealerHand };
};

module.exports = { drawCard, calculateHandValue, dealInitialCards };
