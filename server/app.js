const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
let players = []

app.get('/', function(req, res){
  res.sendfile('index.html')
})

io.on('connection', function(socket){
  socket.on('login', function(player){
    players.push(player)
    console.log(players)
    io.emit('response', players)
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000')
})
