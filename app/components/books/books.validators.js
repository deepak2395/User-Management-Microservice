const joi = require('@hapi/joi')

function userValidators(route) {

  const validators = {

    changePassword: {
      payload: {
        oldPin: joi.string().required(),
        newPin: joi.string().required()
      }
    }
  }

  if (!validators[route]) throw new Error('Invalid route passed to validator')

  return validators[route]
}

module.exports = userValidators