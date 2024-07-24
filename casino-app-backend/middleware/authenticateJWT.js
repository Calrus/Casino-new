const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || 'defaultsecretkey';

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        console.error('No authorization header found');
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT;
