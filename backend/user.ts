import{ WebSocket } from "ws"
import { randomUUIDv7 } from "bun"
export class User {
    public id:string
    public userId:string

    constructor(private ws:WebSocket) {
        this.id = randomUUIDv7()
    }
    initHandler = () => {
        this.ws.on('message', async(data)=>{

        })
    }

    onMessage = (payload:string) =>{

    }

    ondestroy = () => {

    }
}