import { SpeechClient } from '@google-cloud/speech'
import { prisma } from '../lib/prisma'
import { config } from '../config'

const speechClient = new SpeechClient({
  keyFilename: config.googleCloudKeyFile,
})

interface AnalysisResult {
  transcription: string
  fillerWords: {
    word: string
    count: number
  }[]
  paceWpm: number
  confidence: number
  sentimentScore: number
  actionableItems: string[]
}

export async function analyzeRecording(
  recordingId: string,
  audioBuffer: Buffer
): Promise<AnalysisResult> {
  // Convert audio to base64
  const audioBytes = audioBuffer.toString('base64')

  // Configure the speech recognition request
  const audio = {
    content: audioBytes,
  }
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
  }

  // Perform speech recognition
  const [response] = await speechClient.recognize({ audio, config })
  const transcription = response.results
    ?.map((result) => result.alternatives?.[0]?.transcript)
    .join(' ')

  if (!transcription) {
    throw new Error('Failed to transcribe audio')
  }

  // Analyze filler words
  const fillerWords = analyzeFillerWords(transcription)

  // Calculate pace (words per minute)
  const words = transcription.split(' ').length
  const durationMinutes = audioBuffer.length / (16000 * 60) // Assuming 16kHz sample rate
  const paceWpm = Math.round(words / durationMinutes)

  // Calculate confidence
  const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0

  // Perform sentiment analysis (simplified)
  const sentimentScore = analyzeSentiment(transcription)

  // Generate actionable items
  const actionableItems = generateActionableItems({
    fillerWords,
    paceWpm,
    confidence,
    sentimentScore,
  })

  // Save analysis results
  await prisma.analysis.create({
    data: {
      recordingId,
      transcription,
      fillerWordsCount: fillerWords.reduce((acc, fw) => acc + fw.count, 0),
      paceWpm,
      confidence,
      sentimentScore,
      actionableItems,
    },
  })

  return {
    transcription,
    fillerWords,
    paceWpm,
    confidence,
    sentimentScore,
    actionableItems,
  }
}

function analyzeFillerWords(text: string): { word: string; count: number }[] {
  const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically']
  const results: { word: string; count: number }[] = []

  for (const word of fillerWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = text.match(regex)
    if (matches) {
      results.push({ word, count: matches.length })
    }
  }

  return results
}

function analyzeSentiment(text: string): number {
  // Simplified sentiment analysis
  // In a production environment, use a proper NLP service
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful']
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible']

  const words = text.toLowerCase().split(' ')
  let score = 0

  for (const word of words) {
    if (positiveWords.includes(word)) score += 1
    if (negativeWords.includes(word)) score -= 1
  }

  return score / words.length
}

function generateActionableItems(analysis: {
  fillerWords: { word: string; count: number }[]
  paceWpm: number
  confidence: number
  sentimentScore: number
}): string[] {
  const items: string[] = []

  // Filler words feedback
  const totalFillerWords = analysis.fillerWords.reduce((acc, fw) => acc + fw.count, 0)
  if (totalFillerWords > 5) {
    items.push(
      `Try to reduce filler words (${analysis.fillerWords
        .map((fw) => `"${fw.word}": ${fw.count}x`)
        .join(', ')})`
    )
  }

  // Pace feedback
  if (analysis.paceWpm < 120) {
    items.push('Try speaking a bit faster to maintain audience engagement')
  } else if (analysis.paceWpm > 160) {
    items.push('Consider slowing down slightly for better clarity')
  }

  // Confidence feedback
  if (analysis.confidence < 0.8) {
    items.push('Work on speaking more clearly and confidently')
  }

  // Sentiment feedback
  if (analysis.sentimentScore < -0.2) {
    items.push('Consider using more positive language when appropriate')
  }

  return items
} 