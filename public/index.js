const PORT = process.env.PORT || 3000;

// socket io
const socket = io(`http://localhost:${PORT}`, {
    path: "/socket.io",
    transports: ["websocket"],
});

// 캔버스 설정
const canvas = document.getElementById("canvasJs");
var ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 700;

let painting = false;

// 그리기 취소
function stopPainting() {
    socket.emit("upPen");
}

// 그리기 시작
function startPainting() {
    socket.emit("downPen");
}

// 마우스 움직일 때 (캔버스 위에서)
function onMouseMove(event) {

    const x = event.offsetX;
    const y = event.offsetY;

    if (painting) {
        socket.emit("paint", { x, y });
    }
}

// 지우기 버튼을 눌렀을 때
function onClickEraseButton() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// 캔버스 이벤트 리스너
if (canvas) {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
}

// 지우기 버튼 이벤트 리스너
const eraseBtn = document.getElementById("eraseBtn");
if (eraseBtn) {
    eraseBtn.addEventListener("click", onClickEraseButton)
}

// 다른 클라에서 서버로 보낸 x, y좌표를 서버에서 받음
socket.on("paintAll", (data) => {
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
})

// 펜 다운 업을 socket에서 주는 데이터로 컨트롤
socket.on("upPenAll", () => {
    painting = false;
    console.log("펜 업");
})

socket.on("downPenAll", () => {
    painting = true;
    console.log("펜 다운");
    ctx.beginPath();
})

