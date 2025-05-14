import { Router } from 'express'
import multer from 'multer'
import { Storage } from '@google-cloud/storage'
import { SpeechClient } from '@google-cloud/speech'
import { prisma } from '../lib/prisma'
import { config } from '../config'
import { analyzeRecording } from '../services/analysis'
import { validateRequest } from '../middleware/validate'
import { z } from 'zod'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

const storage = new Storage({
  keyFilename: config.googleCloudKeyFile,
})

const speechClient = new SpeechClient({
  keyFilename: config.googleCloudKeyFile,
})

const bucket = storage.bucket(config.storageBucket)

const uploadSchema = z.object({
  topic: z.string().min(1),
  userId: z.string().uuid(),
})

router.post(
  '/',
  upload.single('recording'),
  validateRequest(uploadSchema),
  async (req, res) => {
    const { topic, userId } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    try {
      // Upload to Google Cloud Storage
      const fileName = `${userId}/${Date.now()}-${file.originalname}`
      const blob = bucket.file(fileName)
      const blobStream = blob.createWriteStream()

      await new Promise((resolve, reject) => {
        blobStream.on('error', reject)
        blobStream.on('finish', resolve)
        blobStream.end(file.buffer)
      })

      // Create recording record
      const recording = await prisma.recording.create({
        data: {
          userId,
          topic,
          videoUrl: `https://storage.googleapis.com/${config.storageBucket}/${fileName}`,
        },
      })

      // Start analysis
      const analysis = await analyzeRecording(recording.id, file.buffer)

      res.status(201).json({ recordingId: recording.id, analysis })
    } catch (error) {
      console.error('Error processing recording:', error)
      res.status(500).json({ message: 'Error processing recording' })
    }
  }
)

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params

  const recordings = await prisma.recording.findMany({
    where: { userId },
    include: { analysis: true },
    orderBy: { createdAt: 'desc' },
  })

  res.json(recordings)
})

export const recordingRouter = router 