const { cards } = require('../models/index')

const { user } = require('../../user/models')

module.exports = {
    async listCardsAPI(req, h) {
        return new Promise(resolve => {
            let booksInfo = booksDetails
            resolve(booksInfo)
        })
    },
    async addCardsAPI(req, h) {
        return new Promise(async resolve => {
            let user_id

            let { bookID, title, price } = req.payload
            var cardObject = {
                bookID: bookID,
                title: title,
                price: price,
                owner: user_id
            }

            const addedCard = await cards.create(cardObject)
            console.log('addedCard', addedCard)
            let card_id = addedCard._id
            let update_card = { cards: card_id }

            let userDetails = await user.findOneAndUpdate({ email: req.payload.email }, { "$push": update_card }, function (error, user) {
                user_id = user._id
                console.log('user_id', user)// prints "Ian Fleming"
            })
            resolve(addedCard);
        })
    },
    async removeCardsAPI(req, h) {
        return new Promise(resolve => {
            let booksInfo = booksDetails
            resolve(booksInfo)
        })
    },
    async removeAllCardsAPI(req, h) {
        return new Promise(resolve => {
            let booksInfo = booksDetails
            resolve(booksInfo)
        })
    }
}