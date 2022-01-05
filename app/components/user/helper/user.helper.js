const { user } = require('../models/index')

module.exports = {
    async addUserAPI(req, h) {
        return new Promise(async resolve => {
            var userObj = req.payload
            const newUser = await user.create(userObj)
            resolve(newUser);
        })
    },
    async getUserAPI(req, h) {
        return new Promise(async resolve => {
            var userObj = req.payload
            const newUser = await user.find({ email: userObj.email }).populate('cards')
            resolve(newUser);
        })
    }
}