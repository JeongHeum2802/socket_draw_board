const PORT = 3000;

// socket io
const socket = io("/", {
    path: "/socket.io",
    transports: ["websocket"],
});

// 캔버스 설정
const canvas = document.getElementById("canvasJs");
var ctx = canvas.getContext("2d");

// 색상 input DOM 객체
const colorInput = document.getElementById("colorInput");

canvas.width = 700;
canvas.height = 700;

// 클라이언트Id마다 마지막 offset을 저장
const lastOffset = {}

// 그리는 여부
let painting = false;

// 그리기 취소
function stopPainting(event) {
    painting = false;
}

// 그리기 시작
function startPainting(event) {
    painting = true;

    const color = colorInput.value;
    const x = event.offsetX;
    const y = event.offsetY;
    socket.emit("stroke:start", { x, y, color });
}

// 마우스 움직일 때 (캔버스 위에서)
function onMouseMove(event) {
    if (painting) {
        const color = colorInput.value;
        const x = event.offsetX;
        const y = event.offsetY;
        socket.emit("stroke:draw", { x, y, color });
    }
}

// 지우기 버튼을 눌렀을 때
function onClickEraseButton() {
    socket.emit("stroke:erase");
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
    eraseBtn.addEventListener("click", onClickEraseButton);
}

// socket 

// 그리기 시작 (lastOffset을 갱신)
socket.on("stroke:start", (data) => {
    const { id, x, y } = data;
    lastOffset[id] = { x, y };
});

// 그리기
socket.on("stroke:draw", (data) => {
    const { id, x, y, color } = data;
    
    ctx.beginPath();
    ctx.moveTo(lastOffset[id].x, lastOffset[id].y);
    ctx.strokeStyle = color
    ctx.lineTo(x, y);
    ctx.stroke();
    lastOffset[id] = { x, y };
});

// 지우기
socket.on("stroke:erase", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

// 접속 시 서버 좌표 데이터 받아서 그리기
socket.on("serverOffset", (data) => {
    Object.keys(data).forEach(id => {
        data[id].forEach(offsetData => {
            const { state, x, y, color } = offsetData;

            if (state == 'start') {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.strokeStyle = color;
            }
            else if(offsetData.state == 'draw') {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            else if(offsetData.state == 'end') {
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
            }
        });
    });
});