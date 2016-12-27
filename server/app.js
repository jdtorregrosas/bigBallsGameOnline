const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
let players = []

app.get('/', function (req, res) {
  res.sendfile('index.html')
})

io.on('connection', function (socket) {
  socket.on('login', function (player) {
    if (player.isLogged) {
      io.emit('response', players)
    } else {
      let randomHexaColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
      player.color = randomHexaColor
      player.isLogged = true
      players.push(player)
      console.log(players)
      io.emit('response', players)
    }
  })
  socket.on('updatePosition', function (player) {
    for (let i in players) {
      if (players[i].username === player.username) {
        players[i].posX = player.posX
        players[i].posY = player.posY
      }
    }
    console.log(players)
    io.emit('response', players)
  })
  socket.on('sendMessage', function (messageObject) {
    var message = messageObject
    for (let i in players) {
      if (players[i].username === messageObject.username) {
        message.color = players[i].color
      }
    }
    console.log(message)
    io.emit('messageResponse', message)
  })
  socket.on('logout', function (username) {
    for (let i in players) {
      if (players[i].username === username) {
        players.splice(i, 1)
      }
    }
    io.emit('response', players)
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
