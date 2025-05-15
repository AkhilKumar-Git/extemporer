'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Mic, Square, Play, Pause, UploadCloud, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

export default function NewExtemporePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create a ref to store recording chunks
  const chunksRef = useRef<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null); // Ref for the playback video

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && videoRef.current) {
      console.log('[NewExtemporePage] Initial videoRef state - src:', videoRef.current.src, 'srcObject:', videoRef.current.srcObject);
    }
  }, [isClient]);

  // Effect for managing Object URL for the preview
  useEffect(() => {
    // This effect only cares about the previewUrl lifecycle for cleanup.
    if (!previewUrl) {
      // If there's no current previewUrl, there's nothing to revoke.
      return;
    }

    // Return a cleanup function that revokes the URL when previewUrl changes or component unmounts.
    return () => {
      console.log('[NewExtemporePage] useEffect (previewUrl): Revoking preview URL:', previewUrl);
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]); // Only re-run if previewUrl changes

  // Effect for cleaning up recorder and stream ONLY on component unmount
  useEffect(() => {
    // Capture the current refs at the time the effect is set up.
    // These values will be used in the cleanup function.
    const currentRecorder = mediaRecorderRef.current;
    const currentStream = stream; // Capture stream from state

    return () => { // This cleanup runs ONLY on component unmount
      console.log('[NewExtemporePage] Component UNMOUNT cleanup executing...');
      if (currentRecorder && currentRecorder.state === 'recording') {
        console.log('[NewExtemporePage] Unmount Cleanup: Stopping MediaRecorder.');
        currentRecorder.stop(); // This will trigger its onstop if still recording
      }
      if (currentStream && currentStream.active) {
        console.log('[NewExtemporePage] Unmount Cleanup: Stopping stream tracks.');
        currentStream.getTracks().forEach(track => track.stop());
      }
      // Note: previewUrl cleanup is handled by its own dedicated useEffect
    };
  }, [stream]); // Re-run if stream instance changes, so cleanup handles the *correct* stream.

  const handleStartRecording = async () => {
    if (!isClient || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Media devices API not available in this browser.");
      return;
    }
    setError(null);
    setRecordedBlob(null); // Clear previous recording
    if (previewUrl) { // If a previous recording's URL exists
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      console.log('[NewExtemporePage] Requesting media devices...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('[NewExtemporePage] Media stream obtained:', mediaStream);
      if (mediaStream.getVideoTracks().length > 0) {
        console.log('[NewExtemporePage] Video tracks found:', mediaStream.getVideoTracks());
      } else {
        console.warn('[NewExtemporePage] NO VIDEO TRACKS FOUND IN STREAM.');
        setError("No video input detected. Please check your camera.");
        mediaStream.getTracks().forEach(track => track.stop()); // Ensure all tracks are stopped
        setStream(null);
        setIsRecording(false);
        return;
      }
      if (mediaStream.getAudioTracks().length > 0) {
        console.log('[NewExtemporePage] Audio tracks found:', mediaStream.getAudioTracks());
      } else {
        console.warn('[NewExtemporePage] NO AUDIO TRACKS FOUND IN STREAM.');
        setError("No audio input detected. Please check your microphone.");
        mediaStream.getTracks().forEach(track => track.stop()); // Ensure all tracks are stopped
        setStream(null);
        setIsRecording(false);
        return;
      }
      setStream(mediaStream);

      if (videoRef.current) {
        console.log('[NewExtemporePage] videoRef.current BEFORE srcObject assignment - src:', videoRef.current.src, 'srcObject:', videoRef.current.srcObject);
        videoRef.current.src = ''; // Explicitly clear src attribute
        videoRef.current.srcObject = mediaStream;
        console.log('[NewExtemporePage] videoRef.current AFTER srcObject assignment - src:', videoRef.current.src, 'srcObject:', videoRef.current.srcObject);
        videoRef.current.onloadedmetadata = () => {
          console.log('[NewExtemporePage] onloadedmetadata fired for live preview video element.');
        };
        videoRef.current.onerror = (e) => {
          console.error('[NewExtemporePage] Video element error:', e);
          setError('An error occurred with the video preview element.');
        };
      } else {
        console.warn('[NewExtemporePage] videoRef.current is NOT available when trying to set srcObject.');
      }

      const mimeOptions = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4;codecs=avc1,mp4a'
      ];

      console.log('[NewExtemporePage] Browser MIME type support:');
      mimeOptions.forEach(type => {
        console.log(`  ${type}: ${MediaRecorder.isTypeSupported(type)}`);
      });

      let selectedMimeOption = '';
      let recorderOptions = {};

      for (const mimeType of mimeOptions) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeOption = mimeType;
          recorderOptions = { mimeType };
          console.log(`[NewExtemporePage] Selected MIME type for recording: ${mimeType}`);
          break;
        }
      }

      if (!selectedMimeOption) {
        console.warn('[NewExtemporePage] None of the specified MIME types are supported. Using browser default. This might lead to issues.');
        // No specific mimeType set, browser will use its default
        // setSelectedMimeType(''); // Or a sensible default like 'video/webm'
      }

      setSelectedMimeType(selectedMimeOption); // Store the actually selected one, or empty if none explicitly supported/chosen
      console.log('[NewExtemporePage] Effective MIME type for recording:', selectedMimeOption || 'browser default');
      // The selectedMimeType state is set here, but for onstop, we'll prefer mediaRecorderRef.current.mimeType
      // console.log('[NewExtemporePage] MIME type for blob creation will be:', selectedMimeType); // This log can be misleading due to state update timing

      const recorder = new MediaRecorder(mediaStream, recorderOptions);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        console.log(`[NewExtemporePage] ondataavailable: size=${event.data.size}, type=${event.data.type}, state=${mediaRecorderRef.current?.state}`);
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log(`[NewExtemporePage] Chunk pushed. Total chunks: ${chunksRef.current.length}`);
        } else {
          console.warn('[NewExtemporePage] ondataavailable: Received blob with size 0 or no data. Not adding to chunks.');
        }
      };

      recorder.onstop = () => {
        console.log(`[NewExtemporePage] onstop: state=${mediaRecorderRef.current?.state}, chunks collected: ${chunksRef.current.length}`);

        if (chunksRef.current.length === 0) {
          console.error('[NewExtemporePage] No chunks collected during recording. This means ondataavailable did not yield any data with size > 0.');
          setError('No data was captured during recording. Please check console for details and ensure your camera/mic are working correctly and not obscured/muted.');
          // Stop stream tracks here as well, as recording failed
          if (stream && stream.active) {
            console.log('[NewExtemporePage] Stopping stream tracks in onstop after failed recording.');
            stream.getTracks().forEach(track => track.stop());
          }
          return;
        }

        // Use the actual MIME type the recorder used.
        const actualMimeType = mediaRecorderRef.current?.mimeType || selectedMimeType || 'video/webm';
        console.log('[NewExtemporePage] Creating blob with MIME type:', actualMimeType);
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        console.log('[NewExtemporePage] recorder.onstop - final recordedBlob size:', blob.size, 'type:', blob.type);

        if (blob.size === 0) {
          console.error('[NewExtemporePage] Created blob has zero size, though chunks were reported.');
          setError('Recording failed to capture any data (blob size is 0). Please try again.');
          // Stop stream tracks here
          if (stream && stream.active) {
            console.log('[NewExtemporePage] Stopping stream tracks in onstop after zero-size blob.');
            stream.getTracks().forEach(track => track.stop());
          }
          return;
        }

        // Revoke previous URL if it exists (safety net, also handled by previewUrl effect)
        if (previewUrl) {
            console.log("[NewExtemporePage] onstop: Revoking old preview URL prior to setting new one.");
            URL.revokeObjectURL(previewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(blob);
        console.log('[NewExtemporePage] recorder.onstop - created blob URL:', newPreviewUrl);

        setRecordedBlob(blob);
        setPreviewUrl(newPreviewUrl);

        // Stream tracks are now stopped within the 'onstop' handler after successful recording or error in onstop.
      };

      // Log stream and track states before starting
      console.log('[NewExtemporePage] Before recorder.start() - Stream active:', mediaStream.active);
      mediaStream.getTracks().forEach(track => {
        console.log(`[NewExtemporePage] Track: kind=${track.kind}, label="${track.label}", enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
      });

      recorder.start(); // Try without timeslice first
      console.log('[NewExtemporePage] MediaRecorder started. State:', recorder.state);
      setIsRecording(true);

    } catch (err) {
      console.error("Error accessing media devices.", err);
      if (err instanceof Error) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No camera or microphone found. Please ensure they are connected and enabled.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Permission denied. Please allow access to your camera and microphone in browser settings.");
        } else {
          setError(`An error occurred: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred while accessing media devices.");
      }
      setIsRecording(false);
      setStream(null); // Clean up the stream on error
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log('[NewExtemporePage] Calling MediaRecorder.stop(). Current state:', mediaRecorderRef.current.state);
      mediaRecorderRef.current.stop(); // This will eventually trigger 'onstop'
      // Stream tracks are now stopped within the 'onstop' handler.
    } else {
      console.warn('[NewExtemporePage] handleStopRecording called but recorder not active or not in recording state. Current state:', mediaRecorderRef.current?.state);
      // If somehow tracks are still active and recorder isn't, clean them up as a fallback.
      if (stream && stream.active) {
        console.log("[NewExtemporePage] handleStopRecording: Fallback - stopping active stream tracks.");
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (!recordedBlob) {
      setError("No recording available to upload.");
      return;
    }
    setError(null);
    console.log("Uploading recording...", recordedBlob);
    // TODO: Implement Firebase Storage Upload (Step C)
    alert("Upload functionality not implemented yet.");
  };

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Record New Extempore</h1>

      {error && (
        <div className="w-full max-w-2xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-muted/40 p-6 rounded-lg shadow-lg mb-6">
        {isClient ? (
          <video
            ref={videoRef}
            className="w-full h-auto rounded aspect-video bg-black"
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => console.log('[NewExtemporePage] Video element onLoadedMetadata event fired')}
            onError={(e) => console.error('[NewExtemporePage] Video element error:', e)}
          />
        ) : (
          <div className="w-full aspect-video bg-black flex items-center justify-center text-white rounded">
            Loading camera...
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {!isRecording ? (
          <Button onClick={handleStartRecording} size="lg" className="bg-green-500 hover:bg-green-600" disabled={!isClient || isRecording}>
            <Mic className="mr-2 h-5 w-5" /> Start Recording
          </Button>
        ) : (
          <Button onClick={handleStopRecording} size="lg" variant="destructive" disabled={!isClient || !isRecording}>
            <Square className="mr-2 h-5 w-5" /> Stop Recording
          </Button>
        )}
      </div>

      {!isRecording && recordedBlob && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-4 p-4 border border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Preview Recording</h2>
          <video
            ref={previewVideoRef} // Use the new ref for the preview video
            src={previewUrl || ''} // Use the state variable for blob URL
            controls
            className="w-full rounded aspect-video bg-black"
            onLoadedMetadata={() => console.log('[NewExtemporePage] Preview video loaded metadata')}
            onError={(e) => {
              console.error('[NewExtemporePage] Preview video error:', e);
              setError('Error playing back the recording. The format may not be supported by your browser.');
            }}
          />
          <div className="text-sm text-gray-500">
            Recording size: {(recordedBlob.size / 1024).toFixed(2)} KB | Type: {recordedBlob.type}
          </div>
          <Button onClick={handleUpload} size="lg" className="bg-blue-500 hover:bg-blue-600">
            <UploadCloud className="mr-2 h-5 w-5" /> Upload to Cloud
          </Button>
        </div>
      )}
    </div>
  );
}