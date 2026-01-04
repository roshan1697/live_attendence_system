import mongoose from "mongoose";

const UserSchema = new  mongoose.Schema({
        name:String,
        email:{
            type:String,    
            unique:true
        },
        password:String, //hashed password  
        role: {
            type:String,
            enum: ['student', 'teacher']
        }

})
const ClassSchema = new mongoose.Schema({
    className:String,
    teacherId:{
        type: mongoose.Schema.ObjectId,
        ref: UserSchema
    },
    studentIds: [{ 
        type:mongoose.Schema.ObjectId,
        ref:UserSchema
    }]
}) 

const AttendanceSchema = new mongoose.Schema({
    classId:mongoose.Schema.ObjectId,
    studentId:mongoose.Schema.ObjectId,
    status: {
        type:String,
        enum:['present','absent']
    }
})


export const User = mongoose.model('User', UserSchema)
export const  Class = mongoose.model('Class', ClassSchema)
export const Attendance = mongoose.model('Attendance', AttendanceSchema)

