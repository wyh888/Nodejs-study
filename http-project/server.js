const http = require('http')

let server = http.createServer(function(req, res) {
  // res.writeHead(200, {
  //   'Content-Type': 'text/html'
  // })
  res.end('hello world')
})

server.listen(3000)