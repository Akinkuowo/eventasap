// PayPal configuration
const paypal = require('@paypal/paypal-server-sdk');

// Configure PayPal client
const paypalClient = paypal.client({
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.PAYPAL_MODE === 'live' ? 'production' : 'sandbox'
});

module.exports = { paypalClient };
