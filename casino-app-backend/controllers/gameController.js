const express = require('express');
const { drawCard, calculateHandValue, dealInitialCards } = require('../utils/handUtils');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

// In-memory storage for game states
const gameStates = {};

router.post('/start-game', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const { playerHand, dealerHand } = dealInitialCards();

    gameStates[username] = {
        playerHand,
        dealerHand
    };

    console.log('Game started:', gameStates[username]);
    res.json({ playerHand, dealerHand: [dealerHand[0], { suit: 'hidden', value: 'hidden' }] });
});

router.post('/hit', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState) {
        console.error('No game state found for user:', username);
        return res.status(400).json({ error: 'Game not started or game state not found' });
    }

    const playerHand = gameState.playerHand;
    playerHand.push(drawCard());
    gameState.playerHand = playerHand;

    console.log('Updated game state after hit:', gameStates[username]);

    const playerHandValue = calculateHandValue(playerHand);
    if (playerHandValue > 21) {
        res.json({ playerHand, result: 'Player Busts!' });
    } else {
        res.json({ playerHand });
    }
});

router.post('/stand', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState) {
        console.error('No game state found for user:', username);
        return res.status(400).json({ error: 'Game not started or game state not found' });
    }

    const playerHand = gameState.playerHand;
    const dealerHand = gameState.dealerHand;
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }
    gameState.dealerHand = dealerHand;

    console.log('Updated game state after stand:', gameStates[username]);

    const playerHandValue = calculateHandValue(playerHand);
    const dealerHandValue = calculateHandValue(dealerHand);

    let result;
    if (playerHandValue > 21) {
        result = 'Player Busts!';
    } else if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
        result = 'Player Wins!';
    } else if (playerHandValue < dealerHandValue) {
        result = 'Dealer Wins!';
    } else {
        result = 'Push!';
    }

    res.json({ playerHand, dealerHand, result });
});

router.get('/current-hand', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState) {
        return res.status(404).json({ error: 'No game in progress' });
    }

    res.json({
        playerHand: gameState.playerHand,
        dealerHand: [gameState.dealerHand[0], { suit: 'hidden', value: 'hidden' }]
    });
});

module.exports = router;
