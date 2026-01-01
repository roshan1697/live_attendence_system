import  express from "express";
import { ClassIdSchema, ClassSchema, LoginSchema, SignUpSchema, StudentIdSchema } from "./types";
const app = express()

app.post('/auth/signup',(req,res)=>{
    const parseData = SignUpSchema.safeParse(req.body)
    if(!parseData.success){
        res.status(400).json({
            'success': false,
            'error':'Invalid request schema'
        })
    }
    //datanaase call

    //check for duplicate email
    const duplicateEmail  = null
    if(duplicateEmail){
        res.status(400).json({
            'success':false,
            'error':'Email already exists'
        })
    }

    res.status(200).json({
        'success':'true',
        'data':{
            'id': '',
            'name':'',
            'email':'',
            'role':''
        }
    })
    
})

app.post('/auth/login',(req,res)=>{
    const parseData = LoginSchema.safeParse(req.body)
    if(!parseData.success){
        res.status(400).json({
            'success':false,
            'error':'Invalid request schema'
        })
    }
    //database call

    const validationFail = null
    if(validationFail){
        res.status(400).json({
            'success':false,
            'error': 'Invalid email or password'
        })
    }

    res.status(200).json({
        'success':true,
        'data':{
            'token':''
        }
    })
})

app.get('/auth/me',(req,res)=>{
    //middleware auth
    res.status(200).json({
        'success':true,
        'data': {
            'id': '',
            'name':'',
            'email':'',
            'role':''
        }
    })
})

app.post('/class',(req,res)=>{
    //middleware  auth
    const parseData = ClassSchema.safeParse(req.body)

    if(!parseData.success){
        res.status(400).json({
            'success':false,
            'error': 'Invalid request schema'
        })
    }

    //add to database

    res.status(200).json({
        'success':true,
        'data':{
            'id': '',
            'className':'',
            'teacherId':'',
            'studentIds':[]
        }
    })
})

app.post('/class/:id/add-student',(req,res)=>{
    //middleware auth

    const parseData = StudentIdSchema.safeParse(req.body)
    if(!parseData.success){
        res.status(400).json({
            'success':false,
            'error':'Invalid request schema'
        })
    }

    res.status(200).json({
        'success':true,
        'data':{
            'id':'',
            'className':'',
            'teacherId':'',
            'studentIds':['']
        }
    })
})

app.get('/class/:id',(req,res)=>{
    //middleware auth

    res.status(200).json({
        'success':true,
        'data':{
            'id':'',
            'className':'',
            'teacherId':'',
            'students':[
                {
                    'id':'',
                    'name':'',
                    'email':''
                }
            ]
        }
    })
})

//teacher only
app.get('/students',(req,res)=>{
    //middleware auth teacher only
    res.status(200).json({
        'success':true,
        'data':[
            {
                'id': '',
                'name':'',
                'email':''
            }
        ]
    })
})

app.get('/class/:id/my-attendance', (req,res)=>{
    //middleware auth

    //attendance persisted
    res.status(200).json({
        'success':true,
        'data': {
            'classId':'',
            'status':'present'
        }
    })


    //attendance non-persisted
    res.status(200).json({
        'success':true,
        'data':{
            'classId':'',
            'status':null
        }
    })
})

//teacher only
app.post('/attendance/start',(req,res)=>{
    //middleware auth
    const parseData = ClassIdSchema.safeParse(req.body)
    if(!parseData.success){
        res.status(400).json({
            'success':false,
            'error':'Invalid request schema'
        })
    }

    res.status(200).json({
        'success':true,
        'data':{
            'classId':'',
            'startedAt':''
        }
    })
})


app.listen(3000, ()=>{
    console.log('server running in port 3000')
})