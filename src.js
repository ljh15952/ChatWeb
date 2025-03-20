const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// MySQL 연결 설정
const db = mysql.createConnection({
    host: "RDS_ENDPOINT",
    user: "admin",
    password: "비밀번호",
    database: "chat",
});

db.connect((err) => {
    if (err) {
        console.error("MySQL 연결 오류:", err);
    } else {
        console.log("MySQL 연결 성공!");
    }
});

// 클라이언트에서 메시지 전송 시 저장
io.on("connection", (socket) => {
    console.log("사용자 연결됨:", socket.id);

    // 이전 채팅 기록 전송
    db.query("SELECT * FROM messages ORDER BY created_at ASC", (err, results) => {
        if (!err) {
            results.forEach((row) => {
                socket.emit("chat message", `${row.username}: ${row.message}`);
            });
        }
    });

    socket.on("chat message", (data) => {
        const { username, message } = data;

        // DB에 메시지 저장
        db.query("INSERT INTO messages (username, message) VALUES (?, ?)", [username, message], (err) => {
            if (!err) {
                io.emit("chat message", `${username}: ${message}`);
            } else {
                console.error("메시지 저장 오류:", err);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("사용자 연결 종료:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("서버 실행 중: http://EC2_PUBLIC_IP:3000");
});
