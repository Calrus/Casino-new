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
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT;
