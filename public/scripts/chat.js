"use strict";

const socket = io();

const nickNameElem = document.getElementById('nickname');
const chatListElem = document.querySelector('.chat-list');
const chatInputElem = document.querySelector('.chat-input');
const sendButton = document.querySelector('.send-btn');
const displayContainer = document.querySelector('.display-container');


function LiModel(name, msg, time) {
	this.name = name;
	this.msg = msg;
	this.time = time;

	this.makeLi = ()=>{
		const li = document.createElement('li');

		if(this.name === nickNameElem.value) {
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
		nickname: nickNameElem.value,
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
	const {nickname, msg, time} = data
	const item = new LiModel(nickname, msg, time);
	
	item.makeLi();

	displayContainer.scrollTo(0, displayContainer.scrollHeight)
})