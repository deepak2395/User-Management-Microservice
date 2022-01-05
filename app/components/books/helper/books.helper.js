const _ = require('ramda')
module.exports = {
    async bookListHelper(req, h, booksDetails) {
        return new Promise(resolve => {
            let booksInfo = booksDetails
            resolve(booksInfo)
        })
    },
    async conditionalBookListHelper(req, h, booksDetails) {
        return new Promise(resolve => {

            let { page, rating } = req.payload
            if (!page) {
                page = 1
            }
            if (page && rating) {

                booksDetails.sort(function (a, b) { return b.average_rating - a.average_rating });
                let booksInfo = _.splitEvery(100, booksDetails)
                booksInfo = booksInfo[parseInt(page) - 1]
                resolve(booksInfo)
            } else {
                let booksInfo = _.R.splitEvery(100, booksDetails)
                booksInfo = booksInfo[page - 1]
                resolve(booksInfo)
            }

        })
    }
}