'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;

describe('API Tests', function () {
    let event;
    let context;

    beforeEach(function () {
        event = {
            httpMethod: 'GET',
            path: '',
            queryStringParameters: {}
        };
        context = {};
    });

    describe('GET /coins/list', function () {
        it('should return list of coins', async function () {
            event.path = '/coins/list';
            event.queryStringParameters = { page: '1', per_page: '10' };
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data).to.be.an('array');
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
    });

    describe('GET /coins/bitcoin', function () {
        it('should return bitcoin details', async function () {
            event.path = '/coins/bitcoin';
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data).to.be.an('object');
            expect(response.data.id).to.equal('bitcoin');
        });

        it('should handle non-existent coin', async function () {
            event.path = '/coins/nonexistentcoin123456';
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(404);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.contain('Failed to fetch data');
        });
    });

    describe('GET /coins/bitcoin/history', function () {
        it('should return bitcoin history', async function () {
            event.path = '/coins/bitcoin/history';
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(200);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('success');
            expect(response.data).to.be.an('object');
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
            expect(response.data).to.be.an('object');
            expect(response.data.gecko_says).to.be.a('string');
        });
    });

    describe('HTTP Method Tests', function () {
        it('should return 405 for POST requests', async function () {
            event.path = '/coins/list';
            event.httpMethod = 'POST';
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(405);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.equal('Method not allowed');
        });

        it('should return 405 for PUT requests', async function () {
            event.path = '/coins/bitcoin';
            event.httpMethod = 'PUT';
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(405);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.equal('Method not allowed');
        });

        it('should return 405 for DELETE requests', async function () {
            event.path = '/coins/bitcoin';
            event.httpMethod = 'DELETE';
            const result = await app.handler(event, context);
            
            expect(result.statusCode).to.equal(405);
            const response = JSON.parse(result.body);
            expect(response.status).to.equal('error');
            expect(response.message).to.equal('Method not allowed');
        });
    });

    describe('Unknown Path Tests', function () {
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
