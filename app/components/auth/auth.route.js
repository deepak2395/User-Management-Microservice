const { handlers, helpers } = require('./auth.controller')
const CryptoJS = require('crypto-js')
const validator = require('./auth.validators')

let routes = [
  /* GET - /user */
  {
    method: 'POST',
    path: '/createUser',
    config: {
      auth: false,
      description: 'First time login api for sending otp to the given msisdn',
      // notes: 'Returns a test response',
      validate: validator('createUser'),
      tags: ['api', 'Authentication']
    },
    handler: handlers.createUser
  },
  {
    method: 'POST',
    path: '/forgotPassword',
    config: {
      auth: false,
      description: 'Forgot password api for sending otp to the given msisdn',
      // notes: 'Returns a test response',
      validate: validator('forgotPassword'),
      tags: ['api', 'Authentication']
    },
    handler: handlers.forgotPassword
  },
  {
    method: 'POST',
    path: '/validateLogin',
    config: {
      auth: false,
      description: 'Login api to validate the user by msisdn & pin',
      // notes: 'Returns a test response',
      validate: validator('validateLogin'),
      tags: ['api', 'Authentication'],
      timeout: {
        server: 120000,
        socket: 180000
      }
    },
    handler: handlers.validateLogin
  },
  {
    method: 'GET',
    path: '/logout',
    config: {
      auth: 'jwt',
      description: 'To clear the user session by invaliding auth token',
      // notes: 'Returns a test response',
      tags: ['api', 'Authentication']
    },
    handler: handlers.logout
  },
  {
    method: 'GET',
    path: '/check-valid-user',
    config: {
      auth: 'jwt',
      description:
        'To check the user is valid or not by using the login functionality internally',
      // notes: 'Returns a test response',
      tags: ['api', 'Authentication']
    },
    handler: handlers.checkValidUser
  }
]

module.exports = {
  plugin: {
    register(server) {
      server.dependency('hapi-auth-jwt2')
      server.dependency('hapi-swagger')
      server.route(routes)
    },
    name: 'auth-routes'
  },
  routes: {
    prefix: '/v1/auth'
  }
}
