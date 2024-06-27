"use strict";

const socket = io({
    query: {
        nickname: sessionStorage.getItem('nickname') || ''
    }
});

const senderElem = document.getElementById('sender');
const chatListElem = document.querySelector('.chat-list');
const chatInputElem = document.querySelector('.chat-input');
const sendButton = document.querySelector('.send-btn');
const displayContainer = document.querySelector('.display-container');
const userListElem = document.querySelector('.user-list');
const userListContainer = document.querySelector('.user-list-container');
const toggleUsersBtn = document.querySelector('.toggle-users-btn');
const userCountElems = document.querySelectorAll('.user-count')


function LiModel(name, msg, time) {
	this.name = name;
	this.msg = msg;
	this.time = time;

	this.makeLi = ()=>{
		const li = document.createElement('li');

		if(this.name === senderElem.innerText) { // 수신자 발신자 일치
			li.classList.add('sent');
		} else if (this.name === 'System') { // 입장 메시지
            li.classList.add('system');
        } else { // 수신자 발신자 불일치
            li.classList.add('received');
        }

		const dom = `
		<span class="profile">
		<span class="user">${this.name}</span>
			<img src="images/Default_pfp.svg" alt="Image...">
		</span>
		<span class="message">${this.msg}</span>
		<span class="time">${this.time}</span>
		`;

		li.innerHTML = dom;

		chatListElem.append(li);
	}
}

function sendMessageToServer() {
	const data = {
		sender: senderElem.innerText,
		msg: chatInputElem.value,
	};

	socket.emit('chatting', data); // Send Data To Server

}

sendButton.addEventListener('click', sendMessageToServer);

chatInputElem.addEventListener('keypress', (event)=>{
	if(event.keyCode === 13) {
		sendMessageToServer();
	}
});


socket.on('chatting', (data) => {
	const {sender, msg, time} = data
	const item = new LiModel(sender, msg, time);
	
	item.makeLi();

	displayContainer.scrollTo(0, displayContainer.scrollHeight)
})

socket.on('nicknameAssigned', (nickname) => {
    const isNewSession = !sessionStorage.getItem('nickname');
    senderElem.innerText = nickname;
    sessionStorage.setItem('nickname', nickname);

    if (isNewSession) {
        socket.emit('userEntered', nickname);
    }
});

socket.on('userUpdate', (data) => {
    const { users, userCount } = data;
    userListElem.innerHTML = users.map(user => `<li>${user}</li>`).join('');
	for(const userCountElem of userCountElems) {
		userCountElem.innerText = userCount;
	}
});

socket.on('loadMessages', (messages) => {
    messages.forEach((message) => {
        const item = new LiModel(message.sender, message.msg, message.time);
        item.makeLi();
    });
    displayContainer.scrollTo(0, displayContainer.scrollHeight);
});

// 토글 버튼 클릭 이벤트
toggleUsersBtn.addEventListener('click', () => {
    userListContainer.classList.toggle('visible');
});