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

let users = [];
let messages = [];

// 랜덤 닉네임 생성 함수
function getRandomNickname() {
    return 'User' + Math.floor(Math.random() * 1000);
}

const MESSAGE_LIFETIME = 1000 * 60 * 60 * 24; // 24 hours

// Socket.IO 이벤트 설정
io.on('connection', (socket) => {
    // console.log('a user connected');
	let nickname = socket.handshake.query.nickname || getRandomNickname();
    users.push(nickname);

	socket.emit('loadMessages', messages);

    io.emit('userUpdate', { users, userCount: users.length });
    socket.emit('nicknameAssigned', nickname);

	socket.on('chatting', (data) => { // From Client Data
		// console.log(data);

		const {sender, msg} = data

		const message = {
            sender: sender,
            msg: msg,
            time: moment(new Date()).format("h:mm A"),
			timestamp: Date.now()
        };
        messages.push(message);

		io.emit('chatting', message); // Send Data To Client
	})

    // 입장 메시지 생성 및 저장
    socket.on('userEntered', (nickname) => {
        const entryMessage = {
            sender: 'System',
            msg: `${nickname} 님이 입장하셨습니다`,
            time: moment(new Date()).format("h:mm A"),
            timestamp: Date.now()
        };
        messages.push(entryMessage);
        io.emit('chatting', entryMessage); // 모든 클라이언트에게 전송
    });

	socket.on('disconnect', () => {
        users = users.filter(user => user !== nickname);
        io.emit('userUpdate', users);
    });
});

// 주기적으로 오래된 메시지 삭제
setInterval(() => {
    const now = Date.now();
    messages = messages.filter(message => now - message.timestamp < MESSAGE_LIFETIME);
}, 1000*60); // 1분 간격으로 검사

// Listening on 3000 port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is Running... Listening on ${PORT}`)
})