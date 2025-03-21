const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());  // CORS 허용

// MySQL 연결
const db = mysql.createConnection({
    host: "3.35.204.105",
    user: "root",
    password: "1234",
    database: "chat",
});

db.connect((err) => {
    if (err) {
        console.error("MySQL 연결 실패:", err);
    } else {
        console.log("MySQL 연결 성공");
    }
});

// 루트 경로 추가
app.use(express.static(path.join(__dirname, '..', 'front')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'front', 'chat.html'));
});


// 데이터 조회 API
app.get("/getmessages", (req, res) => {
    const sql = "SELECT * FROM messages ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: "데이터 조회 실패" });
        } else {
            res.json(results);
        }
    });
});

// ✅ 메시지 추가 API
app.post("/messages", (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) {
        return res.status(400).json({ error: "username과 message는 필수입니다." });
    }

    const sql = "INSERT INTO messages (username, message) VALUES (?, ?)";
    db.query(sql, [username, message], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "데이터 삽입 실패" });
        }
        res.status(200).json({ message: "메시지가 성공적으로 추가되었습니다!" });
    });
});

// 데이터 조회 API (최신 메시지 1개만 가져오기)
app.get("/getlatestmessage", (req, res) => {
    const sql = "SELECT * FROM messages ORDER BY created_at DESC LIMIT 1";  // 최신 메시지 한 개만 조회
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: "데이터 조회 실패" });
        } else {
            res.json(results[0]);  // 가장 최신 메시지를 반환
        }
    });
});

// 서버 실행
app.listen(3000, () => {
    console.log("서버 실행 중: http://3.35.204.105:3000");
});