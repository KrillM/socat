const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const cors = require("cors")
const port = 8000;

app.use(cors())

const crewTable = {};
const updateTableCrew = () => {
    io.emit("crewList", crewTable)
}

const io = require("socket.io")(server, {
    cors: {origin: "http://localhost:3000"}
})

io.on("connection", (socket) => {
    socket.on("entry", (res) => {

        if(Object.values(crewTable).includes(res.crewName)) {
            socket.emit("error", {message: '이미 사용 중인 닉네임이라 다른 닉네임으로 입장해주시길 바랍니다.'})
        }
        else{
            io.emit("notice", {message: `${res.crewName}님이 입장하였습니다.`})
            socket.emit("entried", {crewName: res.crewName})
            crewTable[socket.id] = res.crewName;
            updateTableCrew();
        }
    })

    socket.on("disconnect", () => {
        io.emit("notice", {message: `${crewTable[socket.id]}님이 나갔습니다.`})
        delete crewTable[socket.id];
        updateTableCrew();
    })

    socket.on("sendMessage", (res) => {
        if(res.dm === "all") io.emit("chat", {crewName: res.crewName, message: res.message})
        else{
            io.to(res.dm).emit("chat", {crewName: res.crewName, message: res.message, dm: true})
            socket.emit("chat", {crewName: res.crewName, message: res.message, dm: true})
        }
    })
})

server.listen(port, () => {
    console.log(`주소는 localhost:${port} 입니다.`);
})
