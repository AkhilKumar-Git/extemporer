import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { errorHandler } from './middleware/error'
import { config } from './config'

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)

// Error handling
app.use(errorHandler)

const PORT = config.port || 3001

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`)
}) 