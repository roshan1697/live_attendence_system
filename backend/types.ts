import { password } from "bun";
import z from "zod";

export const SignUpSchema = z.object({
    name:z.string(),
    email:z.email(),
    password: z.string().min(6),
    role: z.enum(['student','teacher'])
})

export const LoginSchema = z.object({
    email:z.email(),
    password:z.string()
})

export const ClassSchema = z.object({
    className: z.string()
})

export const StudentIdSchema = z.object({
    studentId:z.string()
})

export const ClassIdSchema = z.object({
    classId:z.string()
})