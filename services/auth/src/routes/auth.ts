import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { config } from '../config'
import { validateRequest } from '../middleware/validate'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['user', 'coach']).default('user'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  const { email, password, name, role } = req.body

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  })

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  )

  res.status(201).json({ token })
})

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }

  const validPassword = await bcrypt.compare(password, user.password)

  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  )

  res.json({ token })
})

export const authRouter = router 