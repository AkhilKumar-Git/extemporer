// Entire content commented out for now as it's related to Google Cloud Speech
/*
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
  const config_req = { // renamed from config to avoid conflict with imported config
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
  }

  // Perform speech recognition
  const [response] = await speechClient.recognize({ audio, config: config_req })
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
  // const durationMinutes = audioBuffer.length / (16000 * 60) // Assuming 16kHz sample rate, and 1 byte per sample with LINEAR16. This might need adjustment based on actual audio properties (e.g., bytes per sample if not 1)
  // To avoid NaN if audioBuffer.length is 0 or sampleRateHertz is not as expected, let's add a check or ensure duration is meaningful.
  // A more robust way might be to get duration from metadata if possible, or ensure audioBuffer properties are correctly used.
  // For now, let's assume a placeholder or a simplified calculation if needed, or ensure this is handled before calling.
  // Placeholder for duration calculation, as the original could lead to issues if audioBuffer is not as expected for LINEAR16 mono.
  const DUMMY_DURATION_MINUTES = 1; // Replace with actual duration logic if needed
  const paceWpm = Math.round(words / DUMMY_DURATION_MINUTES) 

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
  const commonFillerWords = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'actually', 'basically', 'literally'
    // Add more specific filler words if needed
  ]
  const words = text.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/)
  const fillerCounts: Record<string, number> = {}

  for (const word of words) {
    if (commonFillerWords.includes(word)) {
      fillerCounts[word] = (fillerCounts[word] || 0) + 1
    }
  }
  return Object.entries(fillerCounts).map(([word, count]) => ({ word, count }))
}

function generateActionableItems(analysis: Omit<AnalysisResult, 'transcription' | 'actionableItems'>): string[] {
  const items: string[] = []
  if (analysis.paceWpm < 120) items.push('Try speaking a bit faster.')
  if (analysis.paceWpm > 170) items.push('Try speaking a bit slower.')
  if (analysis.confidence < 0.8) items.push('Practice enunciating more clearly for better transcription confidence.')
  if (analysis.sentimentScore < 0) items.push('Consider using more positive language.')
  if (analysis.fillerWords.some(fw => fw.count > 5)) items.push('Be mindful of filler words.')
  if (items.length === 0) items.push('Good job! Your speech metrics look balanced.')
  return items
}

function analyzeSentiment(text: string): number {
  // Simplified sentiment analysis
  // In a production environment, use a proper NLP service
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'awesome', 'fantastic', 'pleased', 'happy']
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible', 'unfortunately', 'sad', 'difficult']

  const words = text.toLowerCase().split(' ')
  let score = 0

  for (const word of words) {
    if (positiveWords.includes(word)) score += 1
    if (negativeWords.includes(word)) score -= 1
  }

  return score / words.length || 0 // Avoid NaN for empty string
}
*/ 