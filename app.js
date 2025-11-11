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

    socket.on("disconnect", () => {
        console.log("연결 끊김");
    });

    // 그림 좌표를 받으면 모든 socket에 리턴
    socket.on("paint", (data) => {
        io.emit("paintAll", data);
    });

    // 펜을 up했을 때
    socket.on("upPen", () => {
        io.emit("upPenAll");
    });

    // 펜을 다운했을 때
    socket.on("downPen", () => {
        io.emit("downPenAll");
    });
});

