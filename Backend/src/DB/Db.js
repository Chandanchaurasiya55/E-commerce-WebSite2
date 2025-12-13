const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connects = await mongoose.connect(process.env.MONGODB_URI, {
        });
        console.log('MongoDB Connected');
    }
    catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }   
};


module.exports = connectDB;   // Export the connectDB function