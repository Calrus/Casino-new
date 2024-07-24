const logSession = (req, res, next) => {
    console.log('Session data:', req.session);
    next();
};

module.exports = logSession;
