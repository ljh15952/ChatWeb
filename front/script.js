// 기본 설정
//let me = "익명" + Math.random().toString(36).substring(2, 8);  // 36진법을 사용하여 짧은 문자열을 생성
let me = "empty!!"
fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
        me = data.ip;
    })
    .catch(err => {
        console.error("IP 가져오기 실패:", err);
    });

// PC환경에서 엔터로 메세지 입력
document.getElementById('message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// 초기화 버튼
document.getElementById("reset-chat").addEventListener("click", () => {
    if (!confirm("정말 모든 채팅을 초기화하시겠습니까?")) return;

    fetch("http://15.164.134.227:3000/reset", {
        method: "DELETE"
    })
        .then((res) => {
            if (!res.ok) throw new Error("서버 응답 오류");
            return res.json();
        })
        .then((data) => {
            alert("채팅이 초기화되었습니다.");
            // 프론트에서 일단 다 없에고 서버에도 DB날리니 새로고침해도 초기화처럼
            document.getElementById("chat-box").innerHTML = "";
        })
        .catch((err) => {
            console.error("초기화 실패:", err);
            alert("초기화 중 오류가 발생했습니다.");
        });
});


// 다크모드 전환
document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});


// 스크롤 제일 밑으로
function updateChatBoxLine() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 이미지 클릭 확대
document.addEventListener("click", function (e) {
    if (e.target.tagName === "IMG" && e.target.closest("#chat-box")) {
        const modal = document.getElementById("image-modal");
        const modalImg = document.getElementById("modal-img");
        modalImg.src = e.target.src;
        modal.style.display = "flex";
    }
});

document.getElementById("image-modal").addEventListener("click", function () {
    this.style.display = "none";
});

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

// 타임 스탬프 써서 처음부터 다 가져오기 추가되는것도 함수 하나로만
let lastFetchedTime = null;
function fetchMessages() {
    const afterParam = lastFetchedTime ? lastFetchedTime.toISOString() : "";
    const url = lastFetchedTime
        ? `http://15.164.134.227:3000/getmessagesafter?after=${encodeURIComponent(afterParam)}`
        : `http://15.164.134.227:3000/getmessages`;

    fetch(url)
        .then(response => response.json())
        .then(messages => {
            if (!messages || messages.length === 0) 
                return;

            const chatBox = document.getElementById("chat-box");

            messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            messages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.innerHTML = `<b>${message.username}</b> : `;

                if (message.type === 'image') {
                    const img = document.createElement("img");
                    img.src = `http://15.164.134.227:3000${message.message}`;
                    messageDiv.appendChild(img);
                }
                if (message.type === 'text') {
                    messageDiv.innerHTML += message.message;
                }

                messageDiv.innerHTML += ` ---- (${new Date(message.created_at).toLocaleString()})`;
                chatBox.appendChild(messageDiv);
            });

            // 가장 마지막 메시지 시간 갱신
            lastFetchedTime = new Date(messages[messages.length - 1].created_at);

            updateChatBoxLine();
        })
        .catch(error => console.error("데이터 가져오기 오류:", error));
}

fetchMessages();

// 0.5초마다 새 메시지 확인
setInterval(fetchMessages, 500);