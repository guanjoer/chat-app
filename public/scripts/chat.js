"use strict";

const socket = io();

console.log(socket);


socket.emit('chatting', 'Hello Server');

socket.on('chatting', (data) => {
	console.log(data)
})