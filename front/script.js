//
// 기본 설정
let me = "익명" + Math.random().toString(36).substring(2, 8);  // 36진법을 사용하여 짧은 문자열을 생성

// PC환경에서 엔터로 메세지 입력
document.getElementById('message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 Enter 동작(줄 바꿈)을 방지
        sendMessage(); // 메시지 전송 함수 호출
    }
});

// 다크모드 전환
document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});
//

// 스크롤 제일 밑으로
function updateChatBoxLine() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

/*
메세지 전송
이미지 + 메세지 같이 전송 가능
서버 DB에 올리는 작업만 함
보낸 메세지를 프론트에 띄우는 작업X
*/
function sendMessage() {
    const username = me;
    const message = document.getElementById('message-input').value.trim();
    const imageInput = document.getElementById("image-input");
    const file = imageInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("username", username);

        fetch("http://15.164.134.227:3000/uploadImage", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.path) {
                    imageInput.value = ""; // 선택 초기화
                }
            })
            .catch((err) => {
                console.error("이미지 업로드 실패", err);
            });
    }

    if (message) {
        fetch("http://15.164.134.227:3000/messages", {
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

}
/*
initChatBox함수랑
fetchLatestMessage함수
서버에서 데이터 받아와서 프론트에 적용하는 부분이 같은데 최적화 귀찮
*/
function initChatBox() {
    updateChatBoxLine();
    fetch("http://15.164.134.227:3000/getmessages")  // 백엔드 서버에 요청
        .then(response => response.json())
        .then(data => {
            const chatBox = document.getElementById("chat-box");

            data.reverse().forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.innerHTML = `<b>${message.username}</b> : `;

                if (message.type === 'image') {
                    const img = document.createElement("img");
                    img.src = `http://15.164.134.227:3000${message.message}`;
                    messageDiv.appendChild(img);
                } else {
                    // 텍스트 메시지일 때
                    messageDiv.innerHTML += `${message.message}`;
                }

                messageDiv.innerHTML += ` ---- (${new Date(message.created_at).toLocaleString()})`;
                chatBox.appendChild(messageDiv);
            });
        })
        .catch(error => console.error("데이터 가져오기 오류:", error));

    fetch("http://15.164.134.227:3000/getlatestmessage")
        .then(response => response.json())
        .then(message => {
            lastFetchedTime = new Date(message.created_at);
        });
}

let lastFetchedTime = null;
function fetchLatestMessage() {
    fetch("http://15.164.134.227:3000/getlatestmessage")  // 서버에서 최신 메시지 한 개를 요청
        .then(response => response.json())
        .then(message => {
            const chatBox = document.getElementById('chat-box');
            const messageTime = new Date(message.created_at);
            
            if (!lastFetchedTime || messageTime > lastFetchedTime) {
                // 새로운 메시지를 화면에 추가
                const messageDiv = document.createElement("div");
                messageDiv.innerHTML = `<b>${message.username}</b> : `;

                if (message.type === 'image') {
                    const img = document.createElement("img");
                    img.src = `http://15.164.134.227:3000${message.message}`;
                    messageDiv.appendChild(img);
                } else {
                    // 텍스트 메시지일 때
                    messageDiv.innerHTML += `${message.message}`;
                }

                messageDiv.innerHTML += ` ---- (${new Date(message.created_at).toLocaleString()})`;
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