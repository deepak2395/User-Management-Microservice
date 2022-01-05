const { executeAPICalls } = require('../../../globalUtils/utils')
const { bookListHelper, conditionalBookListHelper } = require('./helper/books.helper')
module.exports = {
    bookListAPI(req, h) {
        return new Promise(async resolve => {

            let options = {
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
            }
            let finalData = await bookListHelper(req, h, apiData.body)
            resolve(finalData)
        })
    },
    conditionalBookListAPI(req, h) {
        return new Promise(async resolve => {

            let options = {
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
            }
            let finalData = await conditionalBookListHelper(req, h, apiData.body)
            resolve(finalData)
        })
    }

}