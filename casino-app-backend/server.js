const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const { db } = require('./models/db');

const authRoutes = require('./controllers/authController');
const gameRoutes = require('./controllers/gameController');
const userRoutes = require('./controllers/userController');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY || 'defaultsecretkey';

app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/account', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
