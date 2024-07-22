const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY || 'defaultsecretkey';

const db = new sqlite3.Database('./users.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (username TEXT UNIQUE, password TEXT, balance INTEGER)', (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created or already exists.');
        }
    });
});

app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    db.run('INSERT INTO users (username, password, balance) VALUES (?, ?, ?)', [username, hashedPassword, 1000], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            console.error('Error inserting user:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('User registered:', username, hashedPassword);
        res.status(201).json({ message: 'User registered successfully' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (row && bcrypt.compareSync(password, row.password)) {
            const token = jwt.sign({ username: row.username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token, balance: row.balance });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

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

app.post('/start-game', authenticateJWT, (req, res) => {
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

app.post('/hit', authenticateJWT, (req, res) => {
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

app.post('/stand', authenticateJWT, (req, res) => {
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

app.get('/account/:username', authenticateJWT, (req, res) => {
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

app.put('/account/:username/balance', authenticateJWT, (req, res) => {
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
