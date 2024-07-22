const sqlite3 = require('sqlite3').verbose();

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

module.exports = { db };
