const joi = require('@hapi/joi')

function authValidators(route) {
  const validators = {
    createUser: {
      payload: {
        email: joi.string().required()
      }
    },
    forgotPassword: {
      payload: {
        email: joi.string().required()
      }
    },
    validateLogin: {
      payload: {
        email: joi.string().required()
      }
    }
  }

  if (!validators[route]) throw new Error('Invalid route passed to validator')

  return validators[route]
}

module.exports = authValidators
