const { executeAPICalls } = require('../../../globalUtils/utils')
const { addUserAPI, getUserAPI } = require('./helper/index').userHelper

/*  */
module.exports = {
  createUser(req, h) {
    return new Promise(async resolve => {
      let finalData = await addUserAPI(req, h)
      resolve(finalData)
    })
  },
  getuser(req, h) {
    return new Promise(async resolve => {
      let finalData = await getUserAPI(req, h)
      resolve(finalData)
    })
  }
}