const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const moment = require('moment');

const chatRoutes = require('./routes/chat.routes');

const app = express();


// EJS & Public
// app.set('view engine', 'ejs'); // Template engine 중 view engine 사용 및 해당 엔진으로 ejs 사용.
// app.set('views', path.join(__dirname, 'views')); // ejs엔진을 사용해 rendering 될 템플릿 파일은 ./views/ 에 존재.

app.use(express.static(path.join(__dirname, 'public')));

// Routes
// app.use(chatRoutes);


// HTTP 서버 생성 및 Socket.IO와 통합
const server = http.createServer(app);
const io = socketIO(server);

// Socket.IO 이벤트 설정
io.on('connection', (socket) => {
    // console.log('a user connected');

	socket.on('chatting', (data) => { // From Client Data
		// console.log(data);

		const {nickname, msg} = data

		io.emit('chatting', {
			nickname: nickname,
			msg: msg,
			time: moment(new Date()).format("h:ss A")
		}); // Send Data To Client
	})
});

// Listening on 3000 port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is Running... Listening on ${PORT}`)
})