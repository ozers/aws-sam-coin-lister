const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
};

const createSuccessResponse = (data) => ({
    statusCode: 200,
    headers: {
        ...DEFAULT_HEADERS,
        'Cache-Control': 'public, max-age=3600',
    },
    body: JSON.stringify({
        status: 'success',
        data,
        timestamp: new Date().toISOString(),
    }),
});

const createErrorResponse = (statusCode, message) => ({
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({
        status: 'error',
        message,
        timestamp: new Date().toISOString(),
    }),
});

module.exports = {
    createSuccessResponse,
    createErrorResponse,
}; 