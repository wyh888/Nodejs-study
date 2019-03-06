const connect = require('connect')
const router = require('./router/router')
let server = connect()

// 定义路由对象，其中每一项都是对请求 URL 的映射，并包含要调用的回调函数
let routes = {
  GET: {
    '/users': function(req, res) {
      res.end('tobi, loki, ferret')
    },
    '/user/:id': function(req, res, id) {
      res.end(`user ${id}`)
    }
  },
  DELETE: {
    '/user/:id': function(req, res, id) {
      res.end('deleted user ' + id)
    }
  }
}

server.use(router(routes)) // 将路由对象传给路由器的 setup 函数
server.listen(3000)
