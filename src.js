const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());  // CORS 허용

// MySQL 연결
const db = mysql.createConnection({
    host: "localhost",
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
app.get("/", (req, res) => {
    res.send("서버가 정상적으로 실행 중입니다!");
});


// 데이터 조회 API
app.get("/messages", (req, res) => {
    const sql = "SELECT * FROM messages ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: "데이터 조회 실패" });
        } else {
            res.json(results);
        }
    });
});


// 서버 실행
app.listen(3000, () => {
    console.log("서버 실행 중: http://localhost:3000");
});