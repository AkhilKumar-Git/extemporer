import { Router } from 'express'
// import { z } from 'zod' // Commented out if only used by register/login schemas
// import bcrypt from 'bcryptjs' // Commented out
// import jwt from 'jsonwebtoken' // Commented out
// import { prisma } from '../lib/prisma' // Commented out if only used by register/login
// import { config } from '../config' // Commented out if only jwtSecret was used here
// import { validateRequest } from '../middleware/validate' // Commented out if only used by register/login

const router = Router()

// const registerSchema = z.object({ // Commented out
//   email: z.string().email(), // Commented out
//   password: z.string().min(8), // Commented out
//   name: z.string().min(2), // Commented out
//   role: z.enum(['user', 'coach']).default('user'), // Commented out
// }) // Commented out

// const loginSchema = z.object({ // Commented out
//   email: z.string().email(), // Commented out
//   password: z.string(), // Commented out
// }) // Commented out

/* // Commenting out entire register route
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
    config.jwtSecret!,
    { expiresIn: '1d' }
  )

  res.status(201).json({ token })
})
*/

/* // Commenting out entire login route
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
    config.jwtSecret!,
    { expiresIn: '1d' }
  )

  res.json({ token })
})
*/

// Add a placeholder route to ensure the router is still functional
router.get('/status', (req, res) => {
  res.json({ status: 'Auth service is running, Firebase Auth is primary.' });
});

export const authRouter = router 