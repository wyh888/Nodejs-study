const connect = require('connect')
const logger = require('./logger')

let app = connect()

app.use(logger(':method :url'))
app.use(hello)
app.listen(3000, function() {
  console.log('listening...')
})

// function logger(req, res, next) {
//   console.log('%s %s', req.method, req.url)
//   next()
// }

function hello(req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.end('hello world')
}

// function restrict(req, res, next) {
//   let authorization = req.headers.authorization
//   if (!authorization) return next(new Error('Unauthorized'))

//   let parts = authorization.split(' ')
//   let scheme = parts[0]
//   let auth = new Buffer(parts[i], 'base64').toString().split(':')
//   let user = auth[0]
//   let pass = auth[1]

//   authenticateWithDatabase(user, pass, function(err) { // 根据数据库中的记录检查认证信息的函数
//     if (err) return next(err) // 告诉分派器出错了

//     next() // 如果认证信息有效，不带参数调用 next()
//   })
// }

// function admin(req, res, next) {
//   switch(req.url) {
//     case '/':
//       res.end('try /users')
//       break
//     case '/users':
//       res.setHeader('Content-Type', 'application/json')
//       res.end(JSON.stringify(['tobi', 'loki', 'jane']))
//       break
//   }
// }

