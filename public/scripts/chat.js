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


function LiModel(name, msg, time) {
	this.name = name;
	this.msg = msg;
	this.time = time;

	this.makeLi = ()=>{
		const li = document.createElement('li');

		if(this.name === senderElem.innerText) {
			li.classList.add('sent');
		} else {
			li.classList.add('received');
		}

		const dom = `
		<span class="profile">
		<span class="user">${this.name}</span>
			<img src="images/cherry-blossoms.jpg" alt="Image...">
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
    senderElem.innerText = nickname;
	sessionStorage.setItem('nickname', nickname);
});

socket.on('userUpdate', (users) => {
    userListElem.innerHTML = users.map(user => `<li>${user}</li>`).join('');
});

socket.on('loadMessages', (messages) => {
    messages.forEach((message) => {
        const item = new LiModel(message.sender, message.msg, message.time);
        item.makeLi();
    });
    displayContainer.scrollTo(0, displayContainer.scrollHeight);
});