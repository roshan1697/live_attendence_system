import type { NextFunction, Request, Response } from 'express'
import Jwt from 'jsonwebtoken'
import { Class } from '../utils/db'

export const Auth = (req:Request,res:Response,next:NextFunction) => {
    const token = req.body('Authorization')
    if(!token){
        res.status(401).json({
            'success': false,
            'error': "Unauthorized, token missing or invalid"
        })
        return
    }
    try{
        const decoded = Jwt.verify(token,process.env.jwt_secret || '') as {userId:string, role:string}
        req.userId = decoded.userId
        next()
    }catch (e){
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }
}

export const TeacherAuth = (req:Request,res:Response,next:NextFunction) =>{
    const token = req.body('Authorization')
    if(!token){
        res.status(401).json({
            'success': false,
            'error': "Unauthorized, token missing or invalid"
    }) 
    return 
    }
    try{
        const decoded = Jwt.verify(token,process.env.jwt_secret || '') as {userId:string, role:string}
        if(decoded.role !== 'teacher'){
            res.status(403).json({
                'success':false,
                'error':"Forbidden, teacher access required"
            })
        }
        req.userId = decoded.userId
        next()

    }catch(e){
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }
}

export const ClassAuth = async(req:Request,res:Response,next:NextFunction) =>{
    const {id} = req.params

    try {
        const classes = await Class.findOne({
                _id:id
            })
        if(!classes){
                res.status(404).json({
                    "success": false,
                    "error": "Class not found"
                })
                return
        }
        if(JSON.stringify(classes?.teacherId) !== req.userId){
                res.status(403).json({
                    'success':false,
                    'error': "Forbidden, not class teacher"
                })
                return
        }
        next()
        
    } catch (error) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }
}

export const SessionClass = async(req:Request,res:Response,next:NextFunction) =>{
        const {id} = req.params
        try {
            const classes = await Class.findOne({
                _id:id
            })
            if(!classes){
                res.status(404).json({
                    "success": false,
                    "error": "Class not found"
                })
                return
            }
            if(JSON.stringify(classes.teacherId) === req.userId){
                next()
            }
            const student = classes.studentIds.find((id)=> JSON.stringify(id) === req.userId)
            if(!student) { 
                res.status(403).json({
                    'success':false,
                    'error': "Forbidden, not your class"
                })
                return
            }
            next()
        } catch (error) {
            res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
        }
}