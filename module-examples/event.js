const events = require('events')
const net = require('net')

let channel = new events.EventEmitter()
channel.clients = {}
channel.subscriptions = {}

channel.on('join', function(id, client) { // 添加 join 事件的监听器，保存用户的 client 对象，以便程序可以将数据发送给用户
  this.clients[id] = client
  this.subscriptions[id] = function(senderId, message) {
    if (id != senderId) {
      this.clients[id].write(message)
    }
  }
  this.on('broadcast', this.subscriptions[id])
})

channel.on('leave', function(id) {
  channel.removeListener('broadcast', this.subscriptions[id])
  channel.emit('broadcast', id, id + ' has left the chat.\n')
})

channel.on('shutdown', function() {
  channel.emit('broadcast', '', 'Chat has shut down.\n')
  channel.removeAllListeners('broadcast')
})

let server = net.createServer(function(client) {
  let id = client.remoteAddress + ': ' + client.remotePort
  client.on('connect', function() {
    channel.emit('join', id, client)
  })
  client.on('data', function(data) {
    data = data.toString()
    if (data == 'shutdown\r\n') {
      channel.emit('shutdown')
    }
    channel.emit('broadcast', id, data)
  })
  client.on('close', function() {
    channel.emit('leave', id)
  })
})

server.listen(3000)
