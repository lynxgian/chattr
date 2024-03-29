import express from 'express'
import http from 'http'

import {Server} from 'socket.io'
const app = express()


const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)
    socket.on("chat-message", function (data)  {
     io.emit("chat-message", data)

    })
    socket.on("friend-request", function (data) {
        io.emit("friend-request", data)
    })
    socket.on("create-conversation", function (data) {
        io.emit("create-conversation", data)
    })
    socket.on("friends", function (data) {
        io.emit("friends", data)
    })
    socket.on('error', (data) => {
        console.log(data)
    })

})
io.on('error', (error) => {
    console.log(error)
})
server.listen(8080, () => {
    console.log('Server running on port 8080');
});

