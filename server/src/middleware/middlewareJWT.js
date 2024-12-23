const jwt = require('jsonwebtoken');

const middlewareJWT = {
    verifyToken: (req, res, next) => {

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const accessToken = authHeader.split(" ")[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    return res.status(401).json({ message: "Invalid or expired token" });
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json({ message: "Authentication token missing" });
        }
    },

    // verifyToken : (req, res, next) => {
    //     const authHeader = req.headers['authorization'];
    //     const token = authHeader && authHeader.split(' ')[1];
      
    //     if (!token) {
    //       return res.status(401).json({ message: 'Access token is required' });
    //     }
      
    //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //       if (err) {
    //         return res.status(403).json({ message: 'Invalid or expired token' });
    //       }
    //       req.user = user;
    //       next();
    //     });
    //   }
};

module.exports = middlewareJWT;
