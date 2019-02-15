const net = require('net')

// 追踪连接数
let count = 0
let users = {}

let server = net.createServer(function(conn) {
  count++
  let nickname

  conn.setEncoding('utf8')

  conn.write(
    '\n > welcome to \033[92mnode-chat\033[39m!'
    + '\n > ' + count + ' other people are connected at this time.'
    + '\n > please write your name and press enter: '
  )

  conn.on('data', function(data) {
    console.log(data)
    // data = data.replace('\r\n', '')
    // 接收到的第一份数据视为用户
    if (!nickname) {
      if (users[data]) {
        conn.write('\033[93m> nickname already in use. try again: \033[39m')
        return
      } else {
        nickname = data
        users[nickname] = conn

        for (var i in users) {
          broadcast('\033[90m > ' + nickname + ' joined the room\033[39m\n')
        }
      }
    } else { // 否则视为聊天消息
      for (let i in users) {
        if (i != nickname) {
          broadcast('\033[96m > ' + nickname + ':\033[39m ' + data + '\n', true)
        }
      }
    }
  })

  conn.on('close', function() {
    count--
    delete users[nickname]
    broadcast('\033[90m > ' + nickname + ' left the room\033[39m\n')
  })

  // 广播通知
  function broadcast(msg, exceptMyself) {
    for (var i in users) {
      if (!exceptMyself || i != nickname) {
        users[i].write(msg)
      }
    }
  }
})

server.listen(3000, function() {
  console.log('\033[96m   server listening on *:3000\033[39m')
})

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(3000);
    }, 1000);
  }
});
