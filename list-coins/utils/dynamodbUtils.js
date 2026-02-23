const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize AWS DynamoDB
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'CoinGeckoCache';

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds

const getCache = async (key) => {
    try {
        const result = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id: key },
        }));

        if (!result.Item) return null;

        const { data, timestamp } = result.Item;
        const now = Math.floor(Date.now() / 1000);

        if (now - timestamp > CACHE_TTL) {
            await dynamodb.send(new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { id: key },
            }));
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
        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id: key,
                data,
                timestamp: Math.floor(Date.now() / 1000),
            },
        }));
    } catch (error) {
        console.error('Cache write error:', error);
    }
};

module.exports = {
    getCache,
    setCache,
    CACHE_TTL,
};
