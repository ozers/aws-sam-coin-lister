const { CoinGeckoClient } = require('coingecko-api-v3');

// Initialize CoinGecko client with increased timeout
const client = new CoinGeckoClient({
    timeout: 30000, // 30 seconds
    autoRetry: true,
});

const ping = async () => {
    try {
        const response = await client.ping();
        return response;
    } catch (error) {
        console.error('Ping error:', error);
        throw new Error('Failed to ping CoinGecko API');
    }
};

module.exports = {
    ping
}; 