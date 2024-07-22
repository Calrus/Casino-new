const express = require('express');
const { db } = require('../models/db');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/:username', authenticateJWT, (req, res) => {
    const { username } = req.params;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error fetching user account:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ username: row.username, balance: row.balance });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

router.put('/:username/balance', authenticateJWT, (req, res) => {
    const { username } = req.params;
    const { balance } = req.body;

    db.run('UPDATE users SET balance = ? WHERE username = ?', [balance, username], function (err) {
        if (err) {
            console.error('Error updating balance:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Balance updated successfully' });
    });
});

module.exports = router;
