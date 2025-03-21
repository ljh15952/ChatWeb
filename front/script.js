document.getElementById("theme-toggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});

document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();  // 기본 제출 동작 막기

    const username = document.getElementById('username').value;
    const message = document.getElementById('message').value;

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
            alert(data.message);  // 성공 메시지 표시
            document.getElementById('message-form').reset();  // 폼 초기화
        })
        .catch(error => {
            console.error("데이터 전송 실패:", error);
            alert("메시지 전송 실패");
        });
});


function fetchData() {
    fetch("http://3.35.204.105:3000/getmessages")  // 백엔드 서버에 요청
        .then(response => response.json())
        .then(data => {

            const list = document.getElementById("user-list");
            list.innerHTML = "";  // 기존 리스트 초기화

            data.forEach(message => {
                const li = document.createElement("li");
                li.textContent = `${message.username}: ${message.message} (${new Date(message.created_at).toLocaleString()})`;
                list.appendChild(li);
            });
        })
        .catch(error => console.error("데이터 가져오기 오류:", error));
}