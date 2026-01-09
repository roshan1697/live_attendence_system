import type { User } from "./user";

export class RoomManager {
    rooms:Map<string,User[]> = new Map()
    static instance:RoomManager
    private constructor(){

    }
    static getInstance = () =>{
        if(!this.instance){
            this.instance = new RoomManager()
        }
        return this.instance
    }

    public addUser = (user:User,classId:string) => {
        if(!this.rooms.has(classId)){
            this.rooms.set(classId,[user])
            return
        }
        this.rooms.set(classId,[...(this.rooms.get(classId) ?? []),user])

    }
    public removeUser = (user:User,classId:string) => {
        if(!this.rooms.has(classId)){
            return
        }
        this.rooms.set(classId,(this.rooms.get(classId)?.filter((u)=> u.id !== user.id) ?? []))
        if(this.rooms.get(classId)?.length === null){
            this.rooms.delete(classId)
        }
    }
    public broadcastMessage = (user:User ,classId:string , payload:string) => {
        if(!this.rooms.has(classId)){
            return
        }
        this.rooms.get(classId)?.forEach((u) =>
        {
            if(u.id !== user.id){
                u.onMessage(payload)
            }
        })
    }
}