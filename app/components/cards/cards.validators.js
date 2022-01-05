const joi = require('@hapi/joi')

function userValidators(route) {

  const validators = {
    getCards: {
      payload: {
        bookID: joi.string().required()
      }
    },
    addcard: {
      payload: {
        bookID: joi.string().required()
      }
    },
    removecard: {
      payload: {
        product_id: joi.string().required()
      }
    },
    removeallcards: {
      payload: {
        product_id: joi.string().required()
      }
    }
  }

  if (!validators[route]) throw new Error('Invalid route passed to validator')

  return validators[route]
}

module.exports = userValidators