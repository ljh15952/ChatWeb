let me = "익명" + Math.random().toString(36).substring(2, 8);  // 36진법을 사용하여 짧은 문자열을 생성
document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight

document.getElementById('message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 Enter 동작(줄 바꿈)을 방지
        sendMessage(); // 메시지 전송 함수 호출
    }
});

document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});

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

function fetchData() {
    fetch("http://3.35.204.105:3000/getmessages")  // 백엔드 서버에 요청
        .then(response => response.json())
        .then(data => {
            const chatBox = document.getElementById("chat-box");
            chatBox.innerHTML = "";  // 기존 리스트 초기화

            data.reverse().forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${message.username} : ${message.message} ---- (${new Date(message.created_at).toLocaleString()})`;
                chatBox.appendChild(messageDiv);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => console.error("데이터 가져오기 오류:", error));
}
setInterval(fetchData, 1000);
