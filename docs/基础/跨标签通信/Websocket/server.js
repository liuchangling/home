// npm i -D ws

// 创建一个 WebSocket 服务器
const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8080 })
// 监听来自客户端的连接
wss.on('connection', function (socket) {
  // 监听来自客户端的消息
  socket.on('message', function (message) {
    console.log('Received message:', message)

    // 向所有客户端发送消息
    wss.clients.forEach(function (client) {
      client.send(message)
    })
  })
})

