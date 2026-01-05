import express from "express";
import mongoose from "mongoose";
import { ClassIdSchema, ClassSchema, LoginSchema, SignUpSchema, StudentIdSchema } from "./types";
import dotenv from 'dotenv'
import { Class, User } from "./db";
import bcrypt from 'bcrypt'
import  Jwt  from "jsonwebtoken";
import Auth from "./middleware/auth";



const app = express()
app.use(express.json())
const saltRounds = 10

app.post('/auth/signup', async (req, res) => {
    const parseData = SignUpSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }

    try {
        //bcrypt hashing
        const hashedPassword = await bcrypt.hash(parseData.data.password, saltRounds)
        //datanaase call
        const user = await User.create({
            name: parseData.data.name,
            email: parseData.data.email,
            password: hashedPassword,
            role: parseData.data.role
        })
        const token = Jwt.sign({userId:user._id},process.env.jwt_secret || '',{
            expiresIn:'12h'
        })
        res.status(201).json({
            'success': true,
            'data': {
                'id': user._id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })

    } catch (err: unknown) {
        const e = err as { code?: 11000 }
        if (e?.code === 11000) {
            res.status(400).json({
                'success': false,
                'error': 'Email already exists'
            })
            return
        }

        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }


})

app.post('/auth/login', async(req, res) => {
    const parseData = LoginSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }
    //database call
    try {
        const user = await User.findOne({
        email:parseData.data.email
    })
    
    if (!user) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid email or password'
        })
        return
    }
    const comparePassword = await bcrypt.compare(parseData.data.password, user.password as string)
    if(!comparePassword){
        res.status(400).json({
            'success': false,
            'error': 'Invalid email or password'
        })
        return
    }
    const token = Jwt.sign({userId:user._id},process.env.jwt_secret || '',{
        expiresIn:'12h'
    })

    res.status(201).json({
        'success': true,
        'data': {
            'token': token
        }
    })
    }catch (e){
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }

    
})

app.get('/auth/me',Auth, (req, res) => {
    //middleware auth
    res.status(201).json({
        'success': true,
        'data': {
            'id': '',
            'name': '',
            'email': '',
            'role': ''
        }
    })
})

app.post('/class',Auth, async(req, res) => {
    //middleware  auth
    const parseData = ClassSchema.safeParse(req.body)

    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }

    try {
        const classes = await Class.find()

    }catch(e){

    }

    res.status(201).json({
        'success': true,
        'data': {
            'id': '',
            'className': '',
            'teacherId': '',
            'studentIds': []
        }
    })
})

app.post('/class/:id/add-student', (req, res) => {
    //middleware auth

    const parseData = StudentIdSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }

    res.status(201).json({
        'success': true,
        'data': {
            'id': '',
            'className': '',
            'teacherId': '',
            'studentIds': ['']
        }
    })
})

app.get('/class/:id', (req, res) => {
    //middleware auth

    res.status(201).json({
        'success': true,
        'data': {
            'id': '',
            'className': '',
            'teacherId': '',
            'students': [
                {
                    'id': '',
                    'name': '',
                    'email': ''
                }
            ]
        }
    })
})

//teacher only
app.get('/students', (req, res) => {
    //middleware auth teacher only
    res.status(201).json({
        'success': true,
        'data': [
            {
                'id': '',
                'name': '',
                'email': ''
            }
        ]
    })
})

app.get('/class/:id/my-attendance', (req, res) => {
    //middleware auth

    //attendance persisted
    res.status(201).json({
        'success': true,
        'data': {
            'classId': '',
            'status': 'present'
        }
    })


    //attendance non-persisted
    res.status(201).json({
        'success': true,
        'data': {
            'classId': '',
            'status': null
        }
    })
})

//teacher only
app.post('/attendance/start', (req, res) => {
    //middleware auth
    const parseData = ClassIdSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }

    res.status(201).json({
        'success': true,
        'data': {
            'classId': '',
            'startedAt': ''
        }
    })
})


app.listen(3000, () => {
    mongoose.connect(process.env.mongodb_URL || ''
    ).then(() => console.log('connected to DB'))
    console.log('server running in port 3000')
})
