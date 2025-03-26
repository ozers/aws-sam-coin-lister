const { listCoins, getCoinById, getCoinHistory } = require('./services/coinService');
const { createSuccessResponse, createErrorResponse } = require('./utils/responseUtils');

// Lambda handler
exports.handler = async (event) => {
    try {
        // Handle different paths
        const path = event.path;
        const method = event.httpMethod;

        if (method !== 'GET') {
            return createErrorResponse(405, 'Method not allowed');
        }

        // Handle /coins/list with pagination
        if (path === '/coins/list') {
            const page = parseInt(event.queryStringParameters?.page || '1');
            const perPage = parseInt(event.queryStringParameters?.per_page || '100');
            
            // Validate pagination parameters
            if (isNaN(page) || page < 1 || isNaN(perPage) || perPage < 1 || perPage > 250) {
                return createErrorResponse(400, 'Invalid pagination parameters');
            }
            
            const coins = await listCoins(page, perPage);
            return createSuccessResponse(coins);
        }

        // Handle /coins/{coinId}
        const coinIdMatch = path.match(/^\/coins\/([^\/]+)$/);
        if (coinIdMatch) {
            const coinId = coinIdMatch[1];
            try {
                const coin = await getCoinById(coinId);
                return createSuccessResponse(coin);
            } catch (error) {
                if (error.message.includes('Failed to fetch data')) {
                    return createErrorResponse(404, 'Failed to fetch data');
                }
                throw error;
            }
        }

        // Handle /coins/{coinId}/history
        const historyMatch = path.match(/^\/coins\/([^\/]+)\/history$/);
        if (historyMatch) {
            const coinId = historyMatch[1];
            const dateStr = event.queryStringParameters?.date;
            
            // Validate date format if provided
            if (dateStr && isNaN(Date.parse(dateStr))) {
                return createErrorResponse(400, 'Invalid date format');
            }
            
            const date = dateStr ? new Date(dateStr) : new Date();
            try {
                const history = await getCoinHistory(coinId, date);
                return createSuccessResponse(history);
            } catch (error) {
                if (error.message.includes('Failed to get history data')) {
                    return createErrorResponse(404, `Failed to fetch history data for ${coinId}`);
                }
                throw error;
            }
        }

        // Handle /ping
        if (path === '/ping') {
            return createSuccessResponse({ gecko_says: 'pong' });
        }

        return createErrorResponse(404, 'Not found');
    } catch (error) {
        console.error('Handler error:', error);
        return createErrorResponse(500, error.message);
    }
};