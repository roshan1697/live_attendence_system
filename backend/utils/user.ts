import{ WebSocket } from "ws"
import { randomUUIDv7 } from "bun"
import { RoomManager } from "./roomManager"
import Jwt, { type JwtPayload } from "jsonwebtoken"
export class User {
    public id:string
    public userId:string
    public classId:string

    constructor(private ws:WebSocket) {
        this.id = randomUUIDv7()
        this.initHandler()
    }
    initHandler = () => {
        this.ws.on('message', async(data)=>{
            const parse = JSON.parse(data.toString())
            switch (parse.type) {
                case 'join':
                    const token = parse.payload.token
                    const userId = (Jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload).userId
                    if(!userId){
                        this.ws.close()
                        return
                    }
                    this.userId = userId
                    break;
            
                default:
                    break;
            }

        })
    }

    onMessage = (payload:string) =>{
        const parse = JSON.parse(payload)
    }

    onLeft = () => {
        RoomManager.getInstance().removeUser(this.id ,this.classId)
    }
}