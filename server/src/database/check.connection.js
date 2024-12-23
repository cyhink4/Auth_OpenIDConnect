const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const uri = process.env.MONGODB_URI;
const CheckConnection = async () => {
    try {
        const checkConnect = await mongoose.connect(uri);
        if(checkConnect) {
            console.log('Connection to MongoDB success');
        }
    } catch (error) {
        console.log('Connection to MongoDB failed');
    }
}

module.exports = CheckConnection;