const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime') // 根据文件扩展名得出 MIME 类型
let cache = {}

let server = http.createServer(function (req, res) {
  let filePath = false

  if (req.url == '/') {
    filePath = 'client/dist/index.html'
  } else {
    filePath = 'client/dist' + req.url
  }
  let absPath = './' + filePath
  serveStatic(res, cache, absPath)
})

server.listen(3000, function () {
  console.log('Server listening on port 3000.')
})

let chatServer = require('./lib/chat_server')
chatServer.listen(server) // 跟 HTTP 服务器共享同一个 TCP/IP 端口

/**
 * 发送 404 错误
 * @param {*} res 
 */
function send404(res) {
  res.writeHead(404, { 
    'Content-Type': 'text/plain' 
  })
  res.write('Error 404: resource not found')
  res.end()
}

/**
 * 发送文件内容
 * @param {*} res 
 * @param {*} filePath 
 * @param {*} fileContents 
 */
function sendFile(res, filePath, fileContents) {
  res.writeHead(200, {
    'Content-Type': mime.lookup(path.basename(filePath))
  })
  res.end(fileContents)
}

/**
 * 缓存静态资源
 * @param {*} res 
 * @param {*} cache 
 * @param {*} absPath 
 */
function serveStatic(res, cache, absPath) {
  if (cache[absPath]) { // 检查文件是否缓存在内存中
    sendFile(res, absPath, cache[absPath]) // 从内存中返回文件
  } else {
    fs.exists(absPath, function (exists) { // 检查文件是否存在
      if (exists) {
        fs.readFile(absPath, function (err, data) { // 从磁盘中读取文件
          if (err) {
            send404(res)
          } else {
            cache[absPath] = data
            sendFile(res, absPath, data) // 从硬盘中读取文件并返回
          }
        })
      } else {
        send404(res) // 发送 HTTP 404 响应
      }
    })
  }
}
