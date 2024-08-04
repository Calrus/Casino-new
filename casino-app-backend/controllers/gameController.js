const express = require('express');
const { drawCard, calculateHandValue, dealInitialCards } = require('../utils/handUtils');
const authenticateJWT = require('../middleware/authenticateJWT');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// In-memory storage for game states
const gameStates = {};

// Initialize SQLite database
const db = new sqlite3.Database('./users.db');

// Promisify the database operations
const dbGet = (query, params) => new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const dbRun = (query, params) => new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

router.post('/start-game', authenticateJWT, async (req, res) => {
    const username = req.user.username;
    const { playerHand, dealerHand } = dealInitialCards();
    const betAmount = req.body.betAmount;

    try {
        const row = await dbGet('SELECT balance FROM users WHERE username = ?', [username]);
        const currentBalance = row.balance;

        if (currentBalance < betAmount) {
            return res.status(400).json({ error: 'Insufficient balance to place the bet' });
        }

        const newBalance = currentBalance - betAmount;
        await dbRun('UPDATE users SET balance = ? WHERE username = ?', [newBalance, username]);

        gameStates[username] = {
            playerHand,
            dealerHand,
            betAmount,
            gameStatus: 'playing'
        };

        console.log('Game started:', gameStates[username]);
        res.json({ playerHand, dealerHand: [dealerHand[0], { suit: 'hidden', value: 'hidden' }] });
    } catch (err) {
        console.error('Error in start-game:', err.message);
        res.status(500).json({ error: 'Failed to start game' });
    }
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
        res.json({
            playerHand,
            dealerHand: gameState.dealerHand,
            result: 'Player Busts!',
            gameStatus: 'finished'
        });
    } else {
        res.json({ playerHand });
    }
});

router.post('/double', authenticateJWT, async (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState || gameState.gameStatus !== 'playing') {
        console.error('No game state found or game not in progress for user:', username);
        return res.status(400).json({ error: 'Game not started or game state not found' });
    }

    try {
        const row = await dbGet('SELECT balance FROM users WHERE username = ?', [username]);
        const currentBalance = row.balance;
        let betAmount = gameState.betAmount;

        // Double the bet amount
        const doubleBetAmount = betAmount * 2;

        if (currentBalance < betAmount) {
            return res.status(400).json({ error: 'Insufficient balance to double the bet' });
        }

        // Deduct the additional bet amount from the user's balance
        const newBalance = currentBalance - betAmount;
        await dbRun('UPDATE users SET balance = ? WHERE username = ?', [newBalance, username]);

        // Update the game state with the new doubled bet amount
        gameState.betAmount = doubleBetAmount;

        // Draw one more card for the player and update the player's hand
        const playerHand = gameState.playerHand;
        playerHand.push(drawCard());
        gameState.playerHand = playerHand;

        console.log('Updated game state after double:', gameStates[username]);

        const playerHandValue = calculateHandValue(playerHand);
        if (playerHandValue > 21) {
            gameState.gameStatus = 'finished';
            res.json({
                playerHand,
                dealerHand: gameState.dealerHand,
                result: 'Player Busts!',
                gameStatus: 'finished',
                newBalance
            });
        } else {
            // Dealer plays their hand
            const dealerHand = gameState.dealerHand;
            while (calculateHandValue(dealerHand) < 17) {
                dealerHand.push(drawCard());
            }
            gameState.dealerHand = dealerHand;

            console.log('Updated game state after double:', gameStates[username]);

            const dealerHandValue = calculateHandValue(dealerHand);

            let result;
            let finalBalance;

            if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
                result = 'Player Wins!';
                finalBalance = newBalance + doubleBetAmount * 2; // Double the bet winnings
            } else if (playerHandValue < dealerHandValue) {
                result = 'Dealer Wins!';
                finalBalance = newBalance; // No change
            } else {
                result = 'Push!';
                finalBalance = newBalance + doubleBetAmount; // Return the doubled bet
            }

            console.log(`New balance for ${username}: ${finalBalance}`);

            await dbRun('UPDATE users SET balance = ? WHERE username = ?', [finalBalance, username]);

            gameState.gameStatus = 'finished';
            console.log('Game status set to finished:', gameState);
            console.log(`Updated balance for ${username}: ${finalBalance}`);
            res.json({
                playerHand,
                dealerHand: gameState.dealerHand,
                result,
                newBalance: finalBalance
            });
        }
    } catch (err) {
        console.error('Error in double:', err.message);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});


router.post('/stand', authenticateJWT, async (req, res) => {
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

    try {
        const row = await dbGet('SELECT balance FROM users WHERE username = ?', [username]);
        const currentBalance = row.balance;
        const betAmount = gameState.betAmount;

        console.log(`Current balance for ${username}: ${currentBalance}`);
        console.log(`Bet amount for ${username}: ${betAmount}`);

        if (playerHandValue > 21) {
            result = 'Player Busts!';
            newBalance = currentBalance; // No change
        } else if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
            result = 'Player Wins!';
            newBalance = currentBalance + betAmount * 2; // Player wins the bet (winning includes the original bet)
        } else if (playerHandValue < dealerHandValue) {
            result = 'Dealer Wins!';
            newBalance = currentBalance; // No change
        } else {
            result = 'Push!';
            newBalance = currentBalance + betAmount; // Return the bet (only the original bet, no extra winnings)
        }

        console.log(`New balance for ${username}: ${newBalance}`);

        await dbRun('UPDATE users SET balance = ? WHERE username = ?', [newBalance, username]);

        gameState.gameStatus = 'finished';
        console.log('Game status set to finished:', gameState);
        console.log(`Updated balance for ${username}: ${newBalance}`);
        res.json({
            playerHand,
            dealerHand: gameState.dealerHand,
            result,
            newBalance
        });
    } catch (err) {
        console.error('Error in stand:', err.message);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

router.get('/current-hand', authenticateJWT, (req, res) => {
    const username = req.user.username;
    const gameState = gameStates[username];

    if (!gameState) {
        return res.status(404).json({ error: 'No game in progress' });
    }

    const dealerHand = gameState.gameStatus === 'finished' ? gameState.dealerHand : [gameState.dealerHand[0], { suit: 'hidden', value: 'hidden' }];

    res.json({
        playerHand: gameState.playerHand,
        dealerHand: dealerHand,
        betAmount: gameState.betAmount,
        gameStatus: gameState.gameStatus
    });
});

module.exports = router;
