const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const CheckConnection = require('./database/check.connection');
dotenv.config();
const router = require('./routes/user.router')
const app = express();
const cookieParser = require('cookie-parser');
const passport = require('passport')
const session = require('express-session')
require('./configs/config.passport')


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))


app.use(passport.initialize())

/*
* config cookie 
*/
app.use(cookieParser())

/*
 * config Json
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * config PORT
 */
const PORT =  process.env.PORT || 3000;

/*
 * config Connection MongoDB
 */
CheckConnection()
/*
 * config Cors
 */
// Cấu hình CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, 
    optionsSuccessStatus: 200, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
  };
  
  app.use(cors(corsOptions));
/*
 * config Routes
 */
app.use('/auth',router)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


