const express = require('express');
const { drawCard, calculateHandValue, dealInitialCards } = require('../utils/handUtils');
const authenticateJWT = require('../middleware/authenticateJWT');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// In-memory storage for game states
const gameStates = {};

// Initialize SQLite database
const db = new sqlite3.Database('./users.db');

router.post('/start-game', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const { playerHand, dealerHand } = dealInitialCards();

    gameStates[username] = {
        playerHand,
        dealerHand,
        betAmount: req.body.betAmount,
        gameStatus: 'playing'
    };

    console.log('Game started:', gameStates[username]);
    res.json({ playerHand, dealerHand: [dealerHand[0], { suit: 'hidden', value: 'hidden' }] });
});

router.post('/hit', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState || gameState.gameStatus !== 'playing') {
        console.error('No game state found or game not in progress for user:', username);
        return res.status(400).json({ error: 'Game not started or game state not found' });
    }

    const playerHand = gameState.playerHand;
    playerHand.push(drawCard());
    gameState.playerHand = playerHand;

    console.log('Updated game state after hit:', gameStates[username]);

    const playerHandValue = calculateHandValue(playerHand);
    if (playerHandValue > 21) {
        gameState.gameStatus = 'finished';
        res.json({ playerHand, result: 'Player Busts!' });
    } else {
        res.json({ playerHand });
    }
});

router.post('/stand', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState || gameState.gameStatus !== 'playing') {
        console.error('No game state found or game not in progress for user:', username);
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
    let newBalance;

    db.get('SELECT balance FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error fetching user balance:', err.message);
            return res.status(500).json({ error: 'Failed to fetch user balance' });
        }

        const currentBalance = row.balance;
        const betAmount = gameState.betAmount;

        if (playerHandValue > 21) {
            result = 'Player Busts!';
            newBalance = currentBalance; // No change
        } else if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
            result = 'Player Wins!';
            newBalance = currentBalance + betAmount * 2; // Player wins the bet
        } else if (playerHandValue < dealerHandValue) {
            result = 'Dealer Wins!';
            newBalance = currentBalance; // No change
        } else {
            result = 'Push!';
            newBalance = currentBalance + betAmount; // Return the bet
        }

        db.run('UPDATE users SET balance = ? WHERE username = ?', [newBalance, username], function (err) {
            if (err) {
                console.error('Error updating balance:', err.message);
                return res.status(500).json({ error: 'Failed to update balance' });
            }

            gameState.gameStatus = 'finished';
            console.log('Game status set to finished:', gameState);
            res.json({ playerHand, dealerHand, result, newBalance });
        });
    });
});

router.get('/current-hand', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState) {
        return res.status(404).json({ error: 'No game in progress' });
    }

    res.json({
        playerHand: gameState.playerHand,
        dealerHand: [gameState.dealerHand[0], { suit: 'hidden', value: 'hidden' }],
        betAmount: gameState.betAmount
    });
});

module.exports = router;
