import{ WebSocket } from "ws"
import { randomUUIDv7 } from "bun"
import { RoomManager } from "./roomManager"
import Jwt, { type JwtPayload } from "jsonwebtoken"
import { User } from "./db"
export class UserSession {
    public id:string
    public userId:string
    public classId:string

    constructor(private ws:WebSocket ) {
        this.id = randomUUIDv7()
        this.initHandler()
    }
    initHandler = () => {
        this.ws.on('message', async(data)=>{
            const parse = JSON.parse(data.toString())
            switch (parse.event) {
                case 'JOIN':
                    // const token = parse.payload.token
                    // const userId = (Jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload).userId
                    // if(!userId){
                    //     this.ws.close()
                    //     return
                    // }
                    this.userId = this.ws.user.userId
                    const user = await User.findOne({
                        _id:this.userId
                    })
                    
                    break;
                    case 'ATTENDANCE_MARKED':
                        if(this.ws.user.role != 'teacher'){
                            this.ws.close()
                            return
                        }

                    break;   
                    
                    case 'TODAY_SUMMARY':
                        if(this.ws.user.role != 'teacher'){
                            this.ws.close()
                            return
                        }
                    break;

                    case 'MY_ATTENDANCE':
                        if(this.ws.user.role != 'student'){
                            this.ws.close()
                            return
                        }
                    break;
                    case 'DONE':
                        if(this.ws.user.role != 'teacher'){
                            this.ws.close()
                            return
                        }
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