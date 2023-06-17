const mongoose = require('mongoose')

const chat = new mongoose.Schema({
	user: { type: String },
	toUser: { type: String },
	message: { type: String },
});

const ChatSchema = mongoose.model('chat', chat)

module.exports = ChatSchema;
