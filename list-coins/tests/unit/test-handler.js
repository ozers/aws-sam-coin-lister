'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const coinService = require('../../services/coinService');
const dynamodbUtils = require('../../utils/dynamodbUtils');
const app = require('../../app.js');

describe('API Tests', function () {
    let event;
    let context;

    beforeEach(function () {
        event = {
            httpMethod: 'GET',
            path: '',
            queryStringParameters: {},
        };
        context = {};

        // Stub DynamoDB cache — always miss, never write
        sinon.stub(dynamodbUtils, 'getCache').resolves(null);
        sinon.stub(dynamodbUtils, 'setCache').resolves();
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('GET /coins/list', function () {
        it('should return list of coins', async function () {
            const mockCoins = [
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
            ];
            sinon.stub(coinService, 'listCoins').resolves(mockCoins);

            event.path = '/coins/list';
            event.queryStringParameters = { page: '1', per_page: '10' };
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data).to.deep.equal(mockCoins);
        });

        it('should handle invalid pagination parameters', async function () {
            event.path = '/coins/list';
            event.queryStringParameters = { page: 'invalid', per_page: 'invalid' };
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(400);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.equal('Invalid pagination parameters');
        });

        it('should reject per_page > 250', async function () {
            event.path = '/coins/list';
            event.queryStringParameters = { page: '1', per_page: '500' };
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(400);
        });

        it('should reject page < 1', async function () {
            event.path = '/coins/list';
            event.queryStringParameters = { page: '0', per_page: '10' };
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(400);
        });
    });

    describe('GET /coins/:coinId', function () {
        it('should return coin details', async function () {
            const mockCoin = { id: 'bitcoin', name: 'Bitcoin', market_data: {} };
            sinon.stub(coinService, 'getCoinById').resolves(mockCoin);

            event.path = '/coins/bitcoin';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data.id).to.equal('bitcoin');
        });

        it('should handle non-existent coin', async function () {
            sinon.stub(coinService, 'getCoinById').rejects(new Error('Failed to fetch data for nonexistent'));

            event.path = '/coins/nonexistent';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(404);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
        });
    });

    describe('GET /coins/:coinId/history', function () {
        it('should return coin history', async function () {
            const mockHistory = {
                id: 'bitcoin',
                date: '20-02-2026',
                prices: [{ currency: 'usd', price: 50000 }],
            };
            sinon.stub(coinService, 'getCoinHistory').resolves(mockHistory);

            event.path = '/coins/bitcoin/history';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data.prices).to.be.an('array');
        });

        it('should handle invalid date format', async function () {
            event.path = '/coins/bitcoin/history';
            event.queryStringParameters = { date: 'invalid-date' };
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(400);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.contain('Invalid date format');
        });
    });

    describe('GET /ping', function () {
        it('should return pong', async function () {
            event.path = '/ping';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data.gecko_says).to.equal('pong');
        });
    });

    describe('HTTP Method Validation', function () {
        it('should return 405 for POST requests', async function () {
            event.path = '/coins/list';
            event.httpMethod = 'POST';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(405);
        });

        it('should return 405 for PUT requests', async function () {
            event.path = '/coins/bitcoin';
            event.httpMethod = 'PUT';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(405);
        });

        it('should return 405 for DELETE requests', async function () {
            event.path = '/coins/bitcoin';
            event.httpMethod = 'DELETE';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(405);
        });
    });

    describe('Unknown Path', function () {
        it('should return 404 for unknown paths', async function () {
            event.path = '/unknown';
            const result = await app.handler(event, context);

            expect(result.statusCode).to.equal(404);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.equal('Not found');
        });
    });
});
