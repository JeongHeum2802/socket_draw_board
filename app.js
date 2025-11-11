const PORT = process.env.PORT || 3000;
const path = require("path");
const express = require("express");

const { Server } = require("socket.io");
const { clearInterval } = require("timers");

const app = express();

// public 폴더 정적 서빙
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
    console.log(`${PORT} 포트에서 실행 중`);
});

const io = new Server(server, {
    path: "/socket.io",
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("클라이언트 접속 : ", socket.id);
    clearInterval(socket.interval);

    // 그리기 시작 (down) (시작 좌표를 보냄)
    socket.on("stroke:start", (data) => {
        const formatData = {
            id : socket.id, 
            x : data.x,
            y : data.y, 
        }
        io.emit("stroke:start", formatData);
    });

    // 그리기 (그리는 좌표를 보냄)
    socket.on("stroke:draw", (data) => {
        const formatData = {
            id :socket.id,
            x : data.x,
            y : data.y,
        }
        io.emit("stroke:draw", formatData);
    });
});

