const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer();
const redis = require("redis")

const io = new Server(httpServer, {
	cors: {
		origin: '*'
	}
});

const client = redis.createClient({
	url:''
})

client.on("error", (err) => console.log("Redis Client Error", err))

io.on("connection", async (socket) => {

	socket.on('chat', async (events) => {
		const { users, message } = events
		if (users.length) {
			users?.map(user => {
				const { from, to } = user
				io.sockets.emit(to, { message, user: from })
			})
		}
	})

	socket.on('movement',async (moves) => {
		const { player } = moves
		io.sockets.emit('movement', moves)
		await client.hset('movement', player, JSON.stringify(moves))
	})

	socket.on('peer-id', (event) => {
		io.sockets.emit("peer-id", event)
	})


	socket.on('newUser', async (event) => {
		await client.hset(`users`, event, event)
		await client.hgetall('users', (_, users) => {
			Object.keys(users).forEach(user => {
				io.sockets.emit('newUser', user)
			})
		})
	})

});

httpServer.listen(8081);
