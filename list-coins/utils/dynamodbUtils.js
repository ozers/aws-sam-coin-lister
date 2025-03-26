const AWS = require('aws-sdk');

// Initialize AWS DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'CoinGeckoCache';

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds

const getCache = async (key) => {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: { id: key }
        };
        const result = await dynamodb.get(params).promise();
        
        if (!result.Item) return null;
        
        const { data, timestamp } = result.Item;
        const now = Math.floor(Date.now() / 1000);
        
        if (now - timestamp > CACHE_TTL) {
            await dynamodb.delete(params).promise();
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
};

const setCache = async (key, data) => {
    try {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                id: key,
                data,
                timestamp: Math.floor(Date.now() / 1000)
            }
        };
        await dynamodb.put(params).promise();
    } catch (error) {
        console.error('Cache write error:', error);
    }
};

module.exports = {
    getCache,
    setCache,
    CACHE_TTL
}; 