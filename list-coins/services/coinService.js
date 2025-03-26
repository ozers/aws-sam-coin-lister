const { CoinGeckoClient } = require('coingecko-api-v3');
const { getCache, setCache } = require('../utils/dynamodbUtils');

// Initialize CoinGecko client with increased timeout
const client = new CoinGeckoClient({
    timeout: 30000, // 30 seconds
    autoRetry: true,
});

const listCoins = async (page = 1, perPage = 100) => {
    try {
        const cacheKey = `coins_list_page_${page}`;
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
            console.log('Returning cached coins list');
            return cachedData;
        }
        
        console.log('Fetching fresh coins list from API');
        const response = await client.coinList();
        console.log('API Response:', response);
        
        if (!response || !Array.isArray(response)) {
            console.error('Invalid response format:', response);
            throw new Error('Failed to get coins from API');
        }

        // Calculate pagination
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = response.slice(startIndex, endIndex);
        
        await setCache(cacheKey, paginatedData);
        console.log('Updated coins list cache');
        
        return paginatedData;
    } catch (error) {
        console.error('List coins error:', error.message, '\nStack:', error.stack);
        throw new Error('Failed to fetch coins list');
    }
};

const getCoinById = async (coinId) => {
    try {
        const cacheKey = `coin_${coinId}`;
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
            console.log(`Returning cached data for ${coinId}`);
            return cachedData;
        }
        
        console.log(`Fetching fresh data for ${coinId}`);
        const response = await client.coinId({
            id: coinId,
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
        });
        console.log('API Response:', response);
        
        if (!response || !response.id) {
            console.error('Invalid response format:', response);
            throw new Error(`Failed to get data for ${coinId}`);
        }
        
        await setCache(cacheKey, response);
        console.log(`Updated cache for ${coinId}`);
        
        return response;
    } catch (error) {
        console.error(`Get coin error for ${coinId}:`, error.message, '\nStack:', error.stack);
        throw new Error(`Failed to fetch data for ${coinId}`);
    }
};

const getCoinHistory = async (coinId, date) => {
    try {
        // Ensure date is a Date object
        const historyDate = date instanceof Date ? date : new Date(date);
        
        // Check cache first
        const cacheKey = `history_${coinId}_${historyDate.toISOString().split('T')[0]}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log('Returning cached history for:', cacheKey);
            return cachedData;
        }
        
        // Get yesterday's date since we can't get today's history
        const yesterday = new Date(historyDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Format date as dd-mm-yyyy (optimized)
        const formattedDate = yesterday.toISOString().split('T')[0].split('-').reverse().join('-');

        console.log('Fetching fresh history from API for:', coinId, 'on', formattedDate);
        const response = await client.coinIdHistory({
            id: coinId,
            date: formattedDate,
            localization: false
        });

        if (!response || !response.market_data || !response.market_data.current_price) {
            console.error('Invalid history response format:', response);
            throw new Error(`Failed to get history data for ${coinId}`);
        }

        // Format response with prices array
        const formattedResponse = {
            id: coinId,
            date: formattedDate,
            prices: Object.entries(response.market_data.current_price).map(([currency, price]) => ({
                currency,
                price
            }))
        };

        // Cache the response
        await setCache(cacheKey, formattedResponse);
        console.log('Cached history updated for:', cacheKey);
        
        return formattedResponse;
    } catch (error) {
        console.error('Error in getCoinHistory:', error);
        throw error;
    }
};

module.exports = {
    listCoins,
    getCoinById,
    getCoinHistory
}; 