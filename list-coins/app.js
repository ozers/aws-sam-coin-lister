const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const { v4: uuidv4 } = require('uuid');

const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

const listCoins = async () => {
    try {
        const response = await CoinGeckoClient.coins.all();
        if (!response.success) {
            throw new Error('There is an error about to getting coins', response)
        }

        return response.data.map(item => {
            return { "id": item.id, "symbol": item.symbol, "name": item.name }
        })
        
    } catch (error) {
        console.log(error);
        return error
    }

}

exports.lambdaHandler = async (event, context) => {
    try {
        const getCoinList = await listCoins();

        var params = {
            TableName: 'coinsListTable',
            Item: {
                'id': uuidv4(),
                'coinList': getCoinList,
                'dateRequested': Date.now()
            }
        };


        const result = await docClient.put(params).promise()
        console.log('RESULT IS >>>>>', getCoinList)

        return {
            'statusCode': 200,
            'body': JSON.stringify(getCoinList)
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}