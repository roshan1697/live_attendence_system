import type { User } from "./user";

export class RoomManager {
    rooms:Map<string,Map<string,User>> = new Map()
    static instance:RoomManager
    private constructor(){

    }
    static getInstance = () =>{
        if(!this.instance){
            this.instance = new RoomManager()
        }
        return this.instance
    }


    public addUSer = (user:User,classId:string) =>{
        if(!this.rooms.has(classId)){
            this.rooms.set(classId, new Map())
        }

        this.rooms.get(classId)?.set(user.id,user)
    }

    public removeUser = (userId:string,classId:string) =>{
        if(!this.rooms.has(classId)){
            return
        }
        this.rooms.get(classId)?.delete(userId)
    
    }

    public broadcastMessage = (userId:string,classId:string,payload:any) =>{
        if(!this.rooms.has(classId)){
            return
        }
        this.rooms.get(classId)?.forEach((u,id)=>{
            
            if(userId !== id){
                u.onMessage(payload)
            }
        }
        
        )
    }

    public getRoomSize = (classId:string) =>{
        if(!this.rooms.has(classId)){
            return
        }
        return this.rooms.get(classId)?.size
    }

    public deleteClass = (classId:string) => {
        if(!this.rooms.has(classId)){
            return
        }
        this.rooms.delete(classId)
    }
    
}