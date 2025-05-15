import express from 'express'
import cors from 'cors'
import { recordingRouter } from './routes/recording'
// import { errorHandler } from './middleware/error' // Commented out: middleware directory does not exist
import { config } from './config'

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/recordings', recordingRouter)

// Error handling
// app.use(errorHandler) // Commented out: middleware directory does not exist

const PORT = config.port || 3002

app.listen(PORT, () => {
  console.log(`Recording service running on port ${PORT}`)
}) 