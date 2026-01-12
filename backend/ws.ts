import { WebSocketServer } from "ws";
import { User } from "./utils/user";

const wss = new WebSocketServer({
    port:3000
})

wss.on('connection',(ws)=>{
    let user:User | null
    ws.on('error',console.error)
    ws.on('message',(msg)=>{
        console.log(msg)
        user = new User(ws)
    })
    ws.on('close',()=>{

    })
})