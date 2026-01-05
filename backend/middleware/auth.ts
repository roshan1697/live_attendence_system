import type { NextFunction, Request, Response } from 'express'
import Jwt from 'jsonwebtoken'

const Auth = (req:Request,res:Response,next:NextFunction) => {
    const token = req.body('Authorization')
    if(!token){
        res.status(401).json({
            'success': false,
            'error': 'Access denied'
        })
        return
    }
    try{
        const decodedId = Jwt.verify(token,process.env.jwt_secret || '') as string
        req.userId = decodedId
        next()
    }catch (e){
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }
}

export default Auth