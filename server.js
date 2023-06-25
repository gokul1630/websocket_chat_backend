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
	url: ''
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

	socket.on('movement', async (moves) => {
		const { player } = moves
		io.sockets.emit('movement', moves)
		client.hset('movement', player, JSON.stringify(moves))
	})

	socket.on('peer-id', (event) => {
		io.sockets.emit("peer-id", event)
	})


	await socket.on('newUser', async (event) => {
		await client.hset(`users`, socket.id, event)
		await client.hgetall('users', (_, users) => {
			Object.values(users ?? {}).forEach(async (user) => {
				client.hget('movement', user, (_, e) => io.sockets.emit('newUser', {user,moves:JSON.parse(e)}))
			})
		})
	})

	socket.on('disconnect', async () => {
		await client.hdel('movement', socket.id)
		await client.hdel('users', socket.id)
		io.sockets.emit('removeUser','')
	})

});

httpServer.listen(8081);
