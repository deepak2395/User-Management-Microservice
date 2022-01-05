const userController = require('./user.controller')
const validator = require('./user.validators')

const routes = [
  {
    method: 'POST',
    path: '/createuser',
    config: {
      auth: false,
      description:
        "To update the user's password by giving current & new password",
      // notes: 'Returns a test response',
      // validate: validator('createUser'),
      tags: ['api', 'User']
      // pre: [{ method: validateSession }]
    },
    handler: userController.createUser
  },
  {
    method: 'POST',
    path: '/getuser',
    config: {
      auth: false,
      description:
        "To update the user's password by giving current & new password",
      // notes: 'Returns a test response',
      // validate: validator('createUser'),
      tags: ['api', 'User']
      // pre: [{ method: validateSession }]
    },
    handler: userController.getuser
  }
]

module.exports = {
  plugin: {
    register(server) {
      server.dependency('hapi-auth-jwt2')
      server.dependency('hapi-swagger')
      server.route(routes)
    },
    name: 'user-routes'
  },
  routes: {
    prefix: '/v1/user'
  }
}
