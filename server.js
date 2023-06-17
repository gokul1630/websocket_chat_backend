const { createServer } = require("http");
const { Server } = require("socket.io");
const Chat = require('./src/model/chat');
const mongoose = require('mongoose');
const configs = { useUnifiedTopology: true, useNewUrlParser: true }

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: '*'
	}
});


io.on("connection", (socket) => {
	socket.on('chat',async (events) => {
		const { users, message } = events
		if(users.length){
			users?.map(user=>{
				const {from, to} = user
				io.sockets.emit(to, {message, user: from})
			})
		}
	})

	socket.on('movement',(event)=>{
		io.sockets.emit('movement',event)
	})

	socket.on('video',(event)=>{
		// io.sockets.emit('movement',event)
		console.log(event)
	})
});

httpServer.listen(8081);
