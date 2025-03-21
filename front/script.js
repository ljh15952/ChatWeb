let me = "익명" + Math.random().toString(36).substring(2, 8);  // 36진법을 사용하여 짧은 문자열을 생성

document.getElementById('message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 Enter 동작(줄 바꿈)을 방지
        sendMessage(); // 메시지 전송 함수 호출
    }
});

document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});

function updateChatBoxLine() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    const username = me;
    const message = document.getElementById('message-input').value;

    // 서버로 데이터 전송
    fetch("http://3.35.204.105:3000/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, message })
    })
        .then(response => response.json())
        .then(data => {
            console.log("SEND MSG")
        })
        .catch(error => {
            console.error("데이터 전송 실패:", error);
            alert("메시지 전송 실패");
        });
    document.getElementById('message-input').value = '';
}

function initChatBox() {
    fetch("http://3.35.204.105:3000/getmessages")  // 백엔드 서버에 요청
        .then(response => response.json())
        .then(data => {
            const chatBox = document.getElementById("chat-box");
            data.reverse().forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${message.username} : ${message.message} ---- (${new Date(message.created_at).toLocaleString()})`;
                chatBox.appendChild(messageDiv);
            });
        })
        .catch(error => console.error("데이터 가져오기 오류:", error));
    fetch("http://3.35.204.105:3000/getlatestmessage")
        .then(response => response.json())
        .then(message => {
            lastFetchedTime = new Date(message.created_at);
        })
}

let lastFetchedTime = null;
function fetchLatestMessage() {
    fetch("http://3.35.204.105:3000/getlatestmessage")  // 서버에서 최신 메시지 한 개를 요청
        .then(response => response.json())
        .then(message => {
            const chatBox = document.getElementById('chat-box');
            const messageTime = new Date(message.created_at);
            if (!lastFetchedTime || messageTime > lastFetchedTime) {
                // 새로운 메시지를 화면에 추가
                const messageDiv = document.createElement('div');
                messageDiv.textContent = `${message.username} : ${message.message} ---- (${messageTime.toLocaleString()})`;
                chatBox.appendChild(messageDiv);

                updateChatBoxLine();
                lastFetchedTime = messageTime;
            }
        })
        .catch(error => console.error("데이터 가져오기 오류:", error));
}
setInterval(fetchLatestMessage, 500);

initChatBox();
setTimeout(() => {
    updateChatBoxLine();  // 1초 후에 최신 메시지를 가져오는 함수 실행
}, 100);