'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('Tests index', function () {
    it('Put item to DynamoDB Table', async () => {
        const result = await app.lambdaHandler(event, context)
        console.log(result)
        // expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('array');
        done()
    });

    it.skip('Pings to coingecko API', async () => {
        const result = await app.lambdaHandler(event, context)
        console.log(result)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.gecko_says).to.be.equal("(V3) To the Moon!");
    });
});
