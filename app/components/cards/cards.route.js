const cardsController = require('./cards.controller')
const validator = require('./cards.validators')

const routes = [

  {
    method: 'GET',
    path: '/getcards',
    config: {
      auth: 'jwt',
      description: "To get the user's profile details",
      // notes: 'Returns a test response',
      tags: ['api', 'User'],
      // pre: [{ method: validateSession }],
      timeout: {
        // server: 120000,
        socket: false // 180000
      }
    },
    handler: cardsController.listCardsHandler
  },
  {
    method: 'POST',
    path: '/addcard',
    config: {
      auth: false,
      description:
        "To update the user's password by giving current & new password",
      // notes: 'Returns a test response',
      //  validate: validator('addcard'),
      tags: ['api', 'User']
      // pre: [{ method: validateSession }]
    },
    handler: cardsController.addCardsHandler
  },
  {
    method: 'POST',
    path: '/removecard',
    config: {
      auth: 'jwt',
      description:
        "To update the user's password by giving current & new password",
      // notes: 'Returns a test response',
      validate: validator('removecard'),
      tags: ['api', 'User']
      // pre: [{ method: validateSession }]
    },
    handler: cardsController.removeCardsHandler
  },
  {
    method: 'POST',
    path: '/removeallcard',
    config: {
      auth: 'jwt',
      description:
        "To update the user's password by giving current & new password",
      // notes: 'Returns a test response',
      validate: validator('removeallcards'),
      tags: ['api', 'User']
      // pre: [{ method: validateSession }]
    },
    handler: cardsController.removeAllCardsHandler
  }
]

module.exports = {
  plugin: {
    register(server) {
      server.dependency('hapi-auth-jwt2')
      server.dependency('hapi-swagger')
      server.route(routes)
    },
    name: 'cards-routes'
  },
  routes: {
    prefix: '/v1/cards'
  }
}
