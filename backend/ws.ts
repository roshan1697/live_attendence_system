import { WebSocketServer } from "ws";
import { UserSession } from "./utils/user";
import jwt from 'jsonwebtoken'
const wss = new WebSocketServer({
    port:3000
})

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET is not set")

const AuthMiddleware = (req) =>{
    const token = req.headers['Authentication'].split(' ')[1]
    if(!token){
        return null
    }
    try {
        
        return jwt.verify(token,secret)

    } catch (error) {
        return null
    }

    
}

wss.on('connection',(ws,req)=>{
    const userAuth = AuthMiddleware(req) as {userId:string,role?:'teacher'|'student'}
    if(!userAuth){
        ws.close(1008,'unauthorized')
        return
    }
    let user:UserSession | null
    ws.user = userAuth
    ws.on('error',console.error)
    ws.on('message',(msg)=>{
        console.log(msg)
        user = new UserSession(ws)
    })
    ws.on('close',()=>{
        user?.onLeft()
    })
})