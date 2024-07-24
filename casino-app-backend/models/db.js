const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the directory for the database file exists
const dbDirectory = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory);
}

const dbPath = path.join(dbDirectory, 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (username TEXT UNIQUE, password TEXT, balance INTEGER)', (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created or already exists.');
        }
    });
});

module.exports = { db };
