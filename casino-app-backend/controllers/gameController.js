const express = require('express');
const { drawCard, calculateHandValue } = require('../utils/handUtils');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.post('/start-game', authenticateJWT, (req, res) => {
    const { playerHand, dealerHand } = dealInitialCards();
    req.session.playerHand = playerHand;
    req.session.dealerHand = dealerHand;
    req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ error: 'Failed to save session' });
        }
        console.log('Game started: ', req.session); // Log session data
        res.json({ playerHand, dealerHand: [dealerHand[0], { suit: 'hidden', value: 'hidden' }] });
    });
});

router.post('/hit', authenticateJWT, (req, res) => {
    console.log('Session data on hit:', req.session); // Log session data
    if (!req.session.playerHand || !Array.isArray(req.session.playerHand)) {
        console.error('No playerHand in session or invalid data');
        return res.status(400).json({ error: 'Game not started or session data corrupted' });
    }
    const playerHand = req.session.playerHand;
    playerHand.push(drawCard());
    req.session.playerHand = playerHand;
    req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ error: 'Failed to save session' });
        }
        const playerHandValue = calculateHandValue(playerHand);
        if (playerHandValue > 21) {
            res.json({ playerHand, result: 'Player Busts!' });
        } else {
            res.json({ playerHand });
        }
    });
});

router.post('/stand', authenticateJWT, (req, res) => {
    console.log('Session data on stand:', req.session); // Log session data
    if (!req.session.playerHand || !req.session.dealerHand || !Array.isArray(req.session.playerHand) || !Array.isArray(req.session.dealerHand)) {
        console.error('No playerHand or dealerHand in session or invalid data');
        return res.status(400).json({ error: 'Game not started or session data corrupted' });
    }
    const playerHand = req.session.playerHand;
    const dealerHand = req.session.dealerHand;
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }
    req.session.dealerHand = dealerHand;
    req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ error: 'Failed to save session' });
        }
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
        console.log('Stand result:', { playerHand, dealerHand, result }); // Debugging line
        res.json({ playerHand, dealerHand, result });
    });
});

module.exports = router;
