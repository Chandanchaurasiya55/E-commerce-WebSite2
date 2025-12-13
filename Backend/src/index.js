const express = require('express');
const app = express();
const cors = require('cors');
const userRoute = require('../src/Routes/user.route')
const adminRoute = require('../src/Routes/admin.route')
const productRoute = require('../src/Routes/product.route')
const cartRoute = require('../src/Routes/cart.route')
const orderRoute = require('../src/Routes/order.route')
const notificationRoute = require('../src/Routes/notification.route')


app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));

// Allow larger JSON bodies (images as base64 dataURLs) — increase safely to 20mb
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));


app.use('/api/auth', adminRoute);
app.use('/api', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/order', orderRoute);
app.use('/api/notifications', notificationRoute);




module.exports = app;

// Error handling middleware
app.use((err, req, res, next) => {
    if (!err) return next();
    // body-parser sets status code 413 and message in some cases
    const isPayloadTooLarge = err.status === 413 || err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE';
    if (isPayloadTooLarge) {
        return res.status(413).json({ message: 'Payload too large — please upload smaller images or use image URLs (limit 20MB).' });
    }
    // default
    console.error('Unhandled server error', err);
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
});