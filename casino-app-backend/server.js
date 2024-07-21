const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Set up the SQLite database
const db = new sqlite3.Database('./users.db'); // Use a file-based database

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, balance INTEGER)', (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created or already exists.');
        }
    });
});

// Register a new user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    db.run('INSERT INTO users (username, password, balance) VALUES (?, ?, ?)', [username, hashedPassword, 1000], function (err) {
        if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('User registered:', username, hashedPassword); // Log registration
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// Login a user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('User found:', row); // Log user data
        if (row && bcrypt.compareSync(password, row.password)) {
            res.json({ message: 'Login successful', balance: row.balance });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

// Get account details
app.get('/account/:username', (req, res) => {
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

// Update account balance
app.put('/account/:username/balance', (req, res) => {
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
