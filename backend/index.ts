import express from "express";
import mongoose from "mongoose";
import { Types } from "mongoose";
import { ClassIdSchema, ClassSchema, LoginSchema, SignUpSchema, StudentIdSchema } from "./utils/types";
import dotenv from 'dotenv'
import { Class, User } from "./utils/db";
import bcrypt from 'bcrypt'
import Jwt from "jsonwebtoken";
import { Auth, ClassAuth, SessionClass, TeacherAuth } from "./middleware/auth";

const app = express()
app.use(express.json())
const saltRounds = 10

type ClassPopulated = {
    _id: Types.ObjectId;
    className: string;
    teacherId: null | { _id: Types.ObjectId; name: string; email: string };
    studentIds: Array<{ _id: Types.ObjectId; name: string; email: string }>;
}

const secret = process.env.JWT_SECRET
if (!secret) throw new Error("JWT_SECRET is not set")

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
        //database call
        const user = await User.create({
            name: parseData.data.name,
            email: parseData.data.email,
            password: hashedPassword,
            role: parseData.data.role
        })
        const token = Jwt.sign({ userId: user._id, role: user.role }, secret, {
            expiresIn: '12h'
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

app.post('/auth/login', async (req, res) => {
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
            email: parseData.data.email
        })

        if (!user) {
            res.status(400).json({
                'success': false,
                'error': 'Invalid email or password'
            })
            return
        }
        const comparePassword = await bcrypt.compare(parseData.data.password, user.password as string)
        if (!comparePassword) {
            res.status(400).json({
                'success': false,
                'error': 'Invalid email or password'
            })
            return
        }
        const token = Jwt.sign({ userId: user._id, role: user.role }, secret, {
            expiresIn: '12h'
        })

        res.status(201).json({
            'success': true,
            'data': {
                'token': token
            }
        })
    } catch (e) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }


})

app.get('/auth/me', Auth, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.userId
        })
        if (!user) {
            res.status(404).json({
                "success": false,
                "error": "User not found"
            })
        }
        res.status(200).json({
            'success': true,
            'data': {
                'id': user?._id,
                'name': user?.name,
                'email': user?.email,
                'role': user?.role
            }
        })
    }
    catch (e) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }

})

app.post('/class', TeacherAuth, async (req, res) => {
    //middleware  auth teacher only
    const parseData = ClassSchema.safeParse(req.body)

    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }

    try {
        const classes = await Class.create({
            className: parseData.data.className,
            teacherId: req.userId
        })
        res.status(201).json({
            'success': true,
            'data': {
                'id': classes._id,
                'className': classes.className,
                'teacherId': classes.teacherId,
                'studentIds': []
            }
        })

    } catch (e) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }


})

app.post('/class/:id/add-student', TeacherAuth, ClassAuth, async (req, res) => {
    //middleware auth teacher only
    const { id } = req.params
    const parseData = StudentIdSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(400).json({
            'success': false,
            'error': 'Invalid request schema'
        })
        return
    }
    try {

        const updateClass = await Class.updateOne(
            { _id: id }, {
            $push: {
                studentIds: parseData.data.studentId
            }
        }
        )
        if (!updateClass.acknowledged) {
            return
        }
        const updatedClass = await Class.findOne({
            _id: id
        })
        res.status(201).json({
            'success': true,
            'data': {
                'id': updatedClass?._id,
                'className': updatedClass?.className,
                'teacherId': updatedClass?.teacherId,
                'studentIds': updatedClass?.studentIds
            }
        })
    } catch (e) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }

})

app.get('/class/:id', Auth, SessionClass, async (req, res) => {
    //middleware auth
    const { id } = req.params
    try {

        const classes = await Class.findOne({
            _id: id
        }).populate('teacherId', 'name email').populate('studentIds', '_id name email').lean<ClassPopulated | null>() 

        res.status(200).json({
            'success': true,
            'data': {
                'id': classes?._id,
                'className': classes?.className,
                'teacherId': classes?.teacherId ? {
                    'name': classes?.teacherId.name,
                    'email': classes?.teacherId.email
                } : {},
                'students': [
                    classes?.studentIds.map((s) => {
                        return { 'id': s._id, 'name': s.name, 'email': s.email }

                    })
                ]
            }
        })
    } catch (error) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }

})

//teacher only
app.get('/students',TeacherAuth, async(req, res) => {
    //middleware auth teacher only
    try {
        const students = await User.find({
            role:'student'
        })
        res.status(201).json({
        'success': true,
        'data': [
            students.map((s)=>{
                return { 'id': s._id, 'name': s.name, 'email': s.email }
            })
        ]
    })
    } catch (error) {
        res.status(500).json({
            'success': false,
            'error': 'An internal error occurred.'
        })
    }

})

app.get('/class/:id/my-attendance', Auth,SessionClass, (req, res) => {
    //middleware auth
    const {id} = req.params
    //attendance persisted
    res.status(200).json({
        'success': true,
        'data': {
            'classId': id,
            'status': 'present'
        }
    })


    //attendance non-persisted
    res.status(200).json({
        'success': true,
        'data': {
            'classId': id,
            'status': null
        }
    })
})

//teacher only
app.post('/attendance/start',TeacherAuth, (req, res) => {
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
