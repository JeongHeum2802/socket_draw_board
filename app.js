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

// 서버에 저장되어 있는 좌표 데이터 (현재 보드의 그림)
const serverOffset = {};

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

    // 현재 서버에 있는 좌표 데이터를 넘김
    socket.emit("serverOffset", serverOffset);

    // 그리기 시작 (down) (시작 좌표를 보냄)
    socket.on("stroke:start", (data) => {

        // key가 없을 시 빈 배열 할당
        if (!serverOffset[socket.id]) {
            serverOffset[socket.id] = [];
        }

        // 서버 좌표에 데이터 추가
        serverOffset[socket.id].push({
            state: "start",
            x: data.x,
            y: data.y,
            color: data.color,
        });

        // 클라이언트들에 데이터 보냄
        const formatData = {
            id: socket.id,
            x: data.x,
            y: data.y,
            color: data.color,
        }
        io.emit("stroke:start", formatData);
    });

    // 그리기 (그리는 좌표를 보냄)
    socket.on("stroke:draw", (data) => {

        // key가 없을 시 빈 배열 할당
        if (!serverOffset[socket.id]) {
            serverOffset[socket.id] = [];
        }

        // 서버 좌표에 데이터 추가
        serverOffset[socket.id].push({
            state: "draw",
            x: data.x,
            y: data.y,
            color: data.color,
        });

        // 클라이언트들에 데이터 보냄
        const formatData = {
            id: socket.id,
            x: data.x,
            y: data.y,
            color: data.color,
        }
        io.emit("stroke:draw", formatData);
    });

    // 끝점 좌표
    socket.on("stroke:end", (data) => {

        // key가 없을 시 빈 배열 할당
        if (!serverOffset[socket.id]) {
            serverOffset[socket.id] = [];
        }
        
        // 서버 좌표에 데이터 추가
        serverOffset[socket.id].push({
            state: "end",
            x: data.x,
            y: data.y,
            color: data.color,
        })
    });

    // 지우기 명령 전송
    socket.on("stroke:erase", () => {
        // 서보 좌표를 모두 지움
        Object.keys(serverOffset).forEach(id => delete serverOffset[id]);

        // 지우기 명령을 보냄
        io.emit("stroke:erase");
    })
});

