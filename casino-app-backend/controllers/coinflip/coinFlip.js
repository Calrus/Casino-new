const express = require('express');
const authenticateJWT = require('../../middleware/authenticateJWT');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// In-memory storage for game states
const coinFlipGameStates = {};

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

const flipCoin = () => (Math.random() < 0.5 ? 'heads' : 'tails');

router.post('/flip', authenticateJWT, async (req, res) => {
    const username = req.user.username;
    const { betAmount, chosenSide } = req.body;

    if (!betAmount || !chosenSide) {
        return res.status(400).json({ error: 'Bet amount and chosen side are required' });
    }

    try {
        const row = await dbGet('SELECT balance FROM users WHERE username = ?', [username]);
        const currentBalance = row.balance;

        if (currentBalance < betAmount) {
            return res.status(400).json({ error: 'Insufficient balance to place the bet' });
        }

        const newBalance = currentBalance - betAmount;
        await dbRun('UPDATE users SET balance = ? WHERE username = ?', [newBalance, username]);

        const flipResult = flipCoin();
        let result;
        let finalBalance;

        if (flipResult === chosenSide) {
            result = 'Player Wins!';
            finalBalance = newBalance + betAmount * 2;
        } else {
            result = 'Player Loses!';
            finalBalance = newBalance;
        }

        await dbRun('UPDATE users SET balance = ? WHERE username = ?', [finalBalance, username]);

        console.log('Coin flip game finished:', { betAmount, chosenSide, flipResult, result, finalBalance });
        res.json({
            gameStatus: 'finished',
            flipResult,
            result,
            newBalance: finalBalance
        });
    } catch (err) {
        console.error('Error in flip:', err.message);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

module.exports = router;
