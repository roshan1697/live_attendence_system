import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port:3000
})

wss.on('connection',(ws)=>{
    ws.on('message',(msg)=>{
        console.log(msg)
    })
})