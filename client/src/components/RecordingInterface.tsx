import { useState, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'

const recordingSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
})

type RecordingFormData = z.infer<typeof recordingSchema>

export function RecordingInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordingFormData>({
    resolver: zodResolver(recordingSchema),
  })

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    video: true,
    audio: true,
    onStop: (blobUrl) => {
      setRecordingUrl(blobUrl)
    },
  })

  const onSubmit = useCallback(async (data: RecordingFormData) => {
    // Handle form submission and recording upload
    if (recordingUrl) {
      const formData = new FormData()
      formData.append('topic', data.topic)
      formData.append('recording', await fetch(recordingUrl).then((r) => r.blob()))

      // Upload to backend
      try {
        const response = await fetch('/api/recordings', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload recording')
        
        // Handle successful upload
      } catch (error) {
        console.error('Error uploading recording:', error)
      }
    }
  }, [recordingUrl])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            {...register('topic')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.topic && (
            <p className="mt-2 text-sm text-red-600">{errors.topic.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            {status !== 'recording' ? (
              <Button
                type="button"
                onClick={() => {
                  setIsRecording(true)
                  startRecording()
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Start Recording
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setIsRecording(false)
                  stopRecording()
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Stop Recording
              </Button>
            )}
          </div>

          {mediaBlobUrl && (
            <div className="mt-4">
              <video src={mediaBlobUrl} controls className="w-full rounded-lg shadow-lg" />
            </div>
          )}

          {recordingUrl && (
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Submit Recording
            </Button>
          )}
        </div>
      </form>
    </div>
  )
} 