const socketio = require('socket.io')
let io
let guestNumber = 1
let nickNames = {}
let namesUsed = []
let currentRoom = {}

exports.listen = function(server) {
  io = socketio.listen(server) // 启动 Socket IO 服务器，允许它搭载在已有的 HTTP 服务器上
  io.set('log level', 1)
  io.sockets.on('connection', function(socket) { // 定义每个用户连接的处理逻辑
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed); // 在用户连接上来时赋予其一个访客名
    joinRoom(socket, 'Lobby');
    handleMessageBroadcasting(socket, nickNames); // 处理用户的消息，更名，以及聊天室的创建和变更
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    socket.on('rooms', function () { // 用户发出请求时，向其提供已经被占用的聊天室的列表
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    handleClientDisconnection(socket, nickNames, namesUsed); // 定义用户断开连接后的清除逻辑
  })
}

/**
 * 分配用户昵称
 * @param {*} socket 
 * @param {*} guestNumber 
 * @param {*} nickNames 
 * @param {*} namesUsed 
 */
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  let name = 'Guest' + guestNumber
  nickNames[socket.id] = name // 用户昵称关联客户端连接 ID
  socket.emit('nameResult', {
    success: true,
    name,
  })
  namesUsed.push(name)
  return guestNumber + 1
}

/**
 * 进入聊天室
 * @param {*} socket 
 * @param {*} room 
 */
function joinRoom(socket, room) {
  socket.join(room) // 让用户进入房间
  currentRoom[socket.id] = room // 记录用户的当前房间
  socket.emit('joinResult', { room }) // 让用户知道他们进入了新的房间
  socket.broadcast.to(room).emit('message', { // 通知其他用户
    text: `${nickNames[socket.id]} has joined ${room}.`
  })
  let usersInRoom = io.sockets.clients(room)
  if (usersInRoom.length > 1) { //汇总所有用户
    let usersInRoomSummary = `Users currently in ${room}: `
    for (let index in usersInRoom) {
      let userSocketId = usersInRoom[index].id
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', '
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', { // 将房间其他用户的汇总发送给当前用户
      text: usersInRoomSummary
    });
  }
}

/**
 * 昵称变更
 * @param {*} socket 
 * @param {*} nickNames 
 * @param {*} namesUsed 
 */
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', function (name) { // 添加 nameAttempt 事件监听器
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        let previousName = nickNames[socket.id];
        let previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name,
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: `${previousName} is now known as ${name}.`
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

/**
 * 发送聊天消息
 * @param {*} socket 
 */
function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: `${nickNames[socket.id]}: ${message.text}`
    });
  });
}

/**
 * 创建房间
 * @param {*} socket 
 */
function handleRoomJoining(socket) {
  socket.on('join', function (room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

/**
 * 用户断开连接
 * @param {*} socket 
 */
function handleClientDisconnection(socket) {
  socket.on('disconnect', function () {
    let nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
    guestNumber--
  });
}
