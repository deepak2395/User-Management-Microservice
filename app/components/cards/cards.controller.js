const { executeAPICalls } = require('../../../globalUtils/utils')
const { addCardsAPI, removeCardsAPI, removeAllCardsAPI, listCardsAPI } = require('./helper/index').cards


/* let options = {
    method: 'GET',
    uri: 'https://s3-ap-southeast-1.amazonaws.com/he-public-data/books8f8fe52.json',
    body: null
}
let apiData = await executeAPICalls(req, h, options)
if (!apiData.respStatus) {
    h.json({
        respStatus: false,
        msg: 'server down....!'
    })
} */
module.exports = {
    addCardsHandler(req, h) {
        return new Promise(async resolve => {
            console.log('hi')
            let finalData = await addCardsAPI(req, h)
            resolve(finalData)
        })
    },
    removeCardsHandler(req, h) {
        return new Promise(async resolve => {
            let finalData = await removeCardsAPI(req, h)
            resolve(finalData)
        })
    },
    removeAllCardsHandler(req, h) {
        return new Promise(async resolve => {
            let finalData = await removeAllCardsAPI(req, h)
            resolve(finalData)
        })
    },
    listCardsHandler(req, h) {
        return new Promise(async resolve => {
            let finalData = await listCardsAPI(req, h)
            resolve(finalData)
        })
    }
}