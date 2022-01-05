const joi = require('@hapi/joi')

function userValidators(route) {
  console.log('hi')
  const validators = {

    createUser: {
      payload: {
        email: joi.string().required()
      }
    }
  }

  if (!validators[route]) throw new Error('Invalid route passed to validator')

  return validators[route]
}

module.exports = userValidators