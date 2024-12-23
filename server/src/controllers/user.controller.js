const User = require('../models/model.user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
let refreshTokens = [];
const UserController = {
    generateAccessToken : (user) => {
        return jwt.sign({id:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '5m'})
    },
    generateRefreshToken : (user) => {
        return jwt.sign({id:user._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn: '365d'})
    },
    registerUser: async (req, res) => {
        try{
            const {name, email, password} = req.body;
            console.log(name,email,password);
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                name,
                email,
                password: hashPassword,
            });

            const user = await newUser.save();
            res.status(200).json(user);
        }catch(err){
            return res.status(500).json({
                message: err.message
            });
        }
    },

    loginUser: async (req, res) => {
        try{
            const user = await User.findOne({name:req.body.name});
            if(!user) return res.status(400).json({
                message: "User not found"
            });
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if(!validPassword) return res.status(400).json({
                message: "Wrong password"
            });
            if(user && validPassword){
                const accessToken = UserController.generateAccessToken(user);
                const refreshToken = UserController.generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken",refreshToken,{httpOnly:true,path:"/",sameSite:"strict",secure:process.env.NODE_ENV === 'production'});
                const {password, ...info} = user._doc;
                return res.status(200).json({...info,accessToken});
            }
        }catch(e){
            return res.status(500).json({
                message: e.message
            });
        }
    },
    getAllUsers: async (req, res) => {
        try{
            const users = await User.find();
            res.status(200).json(users);
        }catch(err){
            return res.status(500).json({
                message: err.message
            })
        }
    },
    reqReFreshToken: async (req, res) => {
        try{
            const refreshToken = req.cookies.refreshToken;
            console.log(req.cookies);
            if(!refreshToken) return res.status(401).json({
                message: "You're not authenticated"
            });
            if(!refreshTokens.includes(refreshToken)) return res.status(403).json({
                message: "Refresh token is not valid"
            });
            jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user) => {
                if(err) return res.status(403).json({
                    message: "Token is not valid"
                });
                refreshTokens = refreshTokens.filter(token => token !== refreshToken);
                const newAccessToken = UserController.generateAccessToken(user);
                const newRefreshToken = UserController.generateRefreshToken(user);
                refreshTokens.push(newRefreshToken);
                res.cookie("refreshToken",newRefreshToken,{httpOnly:true,path:"/",sameSite:"strict",secure:process.env.NODE_ENV === 'production'});
                return res.status(200).json({
                    newAccessToken
                });
            });
        }catch(e){
            return res.status(500).json({
                message: e.message
            });
        }
    },

    userLogout: async (req, res) => {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        res.status(200).json("Logout success");
    }
}

module.exports = UserController;