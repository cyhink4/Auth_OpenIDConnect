const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/model.user');
const UserController = require('../controllers/user.controller');
const middlewareJWT = require('../middleware/middlewareJWT');




router.post('/login', UserController.loginUser);
router.post('/register', UserController.registerUser);

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});


router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);


router.get('/google/redirect', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {

      const accessToken = UserController.generateAccessToken(req.user);
      const refreshToken = UserController.generateRefreshToken(req.user);

      await User.findByIdAndUpdate(req.user._id, {
        'google.refreshToken': refreshToken
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });


      res.redirect(`${process.env.FRONTEND_URL}/login?accessToken=${accessToken}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=true`);
    }
  }
);



router.get('/users', middlewareJWT.verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});


router.post('/logout', middlewareJWT.verifyToken, async (req, res) => {
  try {
    res.clearCookie('refreshToken');
    res.status(200).json({ 
      message: 'Logged out successfully',
      clearTokens: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout' });
  }
});

module.exports = router;
