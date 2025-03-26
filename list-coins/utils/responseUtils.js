const createSuccessResponse = (data) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
        },
        body: JSON.stringify({
            status: 'success',
            data: data,
            timestamp: new Date().toISOString()
        })
    };
};

const createErrorResponse = (statusCode, message) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'error',
            message: message,
            timestamp: new Date().toISOString()
        })
    };
};

const createHttpResponse = (statusCode, body, headers = {}) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...headers
    },
    body: JSON.stringify(body)
});

module.exports = {
    createSuccessResponse,
    createErrorResponse,
    createHttpResponse
}; 