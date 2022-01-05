const booksController = require('./books.controller')
const validator = require('./books.validators')

const routes = [

  {
    method: 'GET',
    path: '/getBooks',
    config: {
      auth: false,
      description: "To get the user's profile details",
      // notes: 'Returns a test response',
      tags: ['api', 'User'],
      // pre: [{ method: validateSession }],
      timeout: {
        // server: 120000,
        socket: false // 180000
      }
    },
    handler: booksController.bookListAPI
  },
  {
    method: 'POST',
    path: '/conditionbooks',
    config: {
      auth: false,
      description:
        "To update the user's password by giving current & new password",
      // notes: 'Returns a test response',
      //validate: validator('removecard'),
      tags: ['api', 'User']
      // pre: [{ method: validateSession }]
    },
    handler: booksController.conditionalBookListAPI
  }
]

module.exports = {
  plugin: {
    register(server) {
      server.dependency('hapi-auth-jwt2')
      server.dependency('hapi-swagger')
      server.route(routes)
    },
    name: 'books-routes'
  },
  routes: {
    prefix: '/v1/books'
  }
}
