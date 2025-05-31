const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");

const app = express();
app.use(express.json());
app.use(cors());  // CORS 허용
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// MySQL 연결
const db = mysql.createConnection({
    host: "15.164.134.227",
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


// 이미지 업로드 + DB 저장
app.post("/uploadImage", upload.single("image"), (req, res) => {
    const username = req.body.username;
    if (!req.file || !username) {
        return res.status(400).json({ error: "이미지와 username 필수" });
    }
    const imagePath = "/uploads/" + req.file.filename;
    const query = "INSERT INTO messages (username, type, message) VALUES (?, 'image', ?)";
    db.query(query, [username, imagePath], (err) => {
        if (err) return res.status(500).json({ error: "DB 오류" });
        res.json({ success: true, path: imagePath });
    });
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

// 메시지 추가 API
app.post("/messages", (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) {
        return res.status(400).json({ error: "username과 message는 필수입니다." });
    }

    const sql = "INSERT INTO messages (username, type, message) VALUES (?, 'text', ?)";

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
    console.log("서버 실행 중: http://15.164.134.227:3000");
});