const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'defaultsecretkey';

// Initialize SQLite database
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

router.post('/register', (req, res) => {
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
        console.log('User registered:', username);
        res.status(201).json({ message: 'User registered successfully' });
    });
});

router.post('/login', (req, res) => {
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

module.exports = router;
