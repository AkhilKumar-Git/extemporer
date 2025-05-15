import React from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Video, Mic, UploadCloud, Play, StopCircle } from 'lucide-react';

interface RecordingInterfaceProps {
  extemporeTopic: string;
  onRecordingComplete: (blobUrl: string, blob: Blob) => void;
  isSubmitting?: boolean; // Optional: to show a global submitting state if parent handles it
}

const MIN_RECORDING_TIME_SECONDS = 60;

export function RecordingInterface({ extemporeTopic, onRecordingComplete, isSubmitting }: RecordingInterfaceProps) {
  const [timeLeft, setTimeLeft] = React.useState(MIN_RECORDING_TIME_SECONDS);
  const [canStopRecording, setCanStopRecording] = React.useState(false);
  const [permissionError, setPermissionError] = React.useState(false);
  const [currentMediaBlobUrl, setCurrentMediaBlobUrl] = React.useState<string | null>(null);

  const {
    status,
    startRecording: libStartRecording,
    stopRecording: libStopRecording,
    mediaBlobUrl,
    previewStream,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    askPermissionOnMount: false,
    onStop: (blobUrl, blob) => {
      setCurrentMediaBlobUrl(blobUrl); // Keep a local copy
      onRecordingComplete(blobUrl, blob);
    },
    onStart: () => {
      setCanStopRecording(false);
      setTimeLeft(MIN_RECORDING_TIME_SECONDS);
      setPermissionError(false);
      setCurrentMediaBlobUrl(null); // Clear previous blob url
    },
  });

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'recording' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (status === 'recording' && timeLeft === 0) {
      setCanStopRecording(true);
    }
    return () => clearTimeout(timer);
  }, [status, timeLeft]);

  const handleStart = async () => {
    setPermissionError(false);
    setCurrentMediaBlobUrl(null);
    try {
      // Check permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(track => track.stop()); // Release tracks
      libStartRecording();
    } catch (error: any) {
      console.error("Permissions error:", error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.name === 'NotFoundError') {
        setPermissionError(true);
      }
    }
  };

  const handleStop = () => {
    libStopRecording();
  };

  // If isSubmitting is true (passed from parent), show a global loading state.
  // This component itself doesn't know about the submission to Firebase, only recording completion.
  if (isSubmitting) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary animate-pulse" /> Submitting...</CardTitle>
          <CardDescription>Your recording is being uploaded and processed.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <div role="status" className="flex justify-center items-center">
            <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <p className="mt-3 text-sm text-muted-foreground">Please wait...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show video player if recording is stopped and blob URL is available
  if (status === 'stopped' && currentMediaBlobUrl) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Review Your Recording</CardTitle>
          <CardDescription>Topic: {extemporeTopic}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <video src={currentMediaBlobUrl} controls playsInline className="w-full rounded-lg aspect-video" />
          <div className="flex gap-3">
            <Button onClick={handleStart} variant="outline" className="w-full"> <Play className="mr-2 h-4 w-4"/> Record Again</Button>
            {/* The parent component will handle the actual submission using onRecordingComplete */}
            {/* This UI assumes the parent shows a global loading/submitting state if needed */}
          </div>
           <p className="text-xs text-muted-foreground text-center">Your recording is ready. The analysis will begin after it's submitted (handled by the page).</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" suppressHydrationWarning>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Extempore Topic</CardTitle>
        <CardDescription className="mt-2 text-lg p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30 dark:border-primary/40 shadow-sm">
          {extemporeTopic}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionError && (
            <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md" role="alert">
                <p className="font-bold flex items-center"><AlertCircle className="mr-2 h-5 w-5" /> Permission Required</p>
                <p className="text-sm mt-1">This app needs access to your camera and microphone. Please grant permissions and try again.</p>
            </div>
        )}

        <div className="aspect-video bg-slate-800 dark:bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center shadow-inner">
          {(status === 'idle' || status === 'acquiring_media' || (!previewStream && status !== 'recording')) && (
            <div className="text-center text-slate-500 dark:text-slate-400 p-4">
              <Video className="mx-auto h-16 w-16 mb-2 opacity-70" />
              <p className="font-medium">Video Preview Area</p>
              {status === 'acquiring_media' && <p className="text-sm mt-1">Accessing camera...</p>}
            </div>
          )}
          {previewStream && status !== 'stopped' && (
            <video
              ref={(instance) => { if (instance && previewStream) instance.srcObject = previewStream; }}
              autoPlay playsInline muted className="w-full h-full object-cover"
            />
          )}
          {status === 'recording' && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2.5 py-1 rounded-full flex items-center shadow font-medium">
              <Mic className="h-3.5 w-3.5 mr-1.5" /> REC
            </div>
          )}
        </div>

        {status === 'recording' && (
          <div className="text-center p-3 bg-secondary dark:bg-secondary/70 rounded-lg">
            <p className={`text-3xl font-bold tabular-nums ${timeLeft === 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {timeLeft > 0 ? "Minimum recording time: ends in " : "You can now stop the recording."}
              {timeLeft > 0 && <span className="font-semibold">{timeLeft}s</span>}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          {(status === 'idle' || status === 'stopped' || status === 'acquiring_media' || permissionError) && (
            <Button onClick={handleStart} size="lg" className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" disabled={status === 'acquiring_media'}>
              <Play className="mr-2 h-5 w-5" /> {status === 'acquiring_media' ? "Initializing..." : "Start Recording"}
            </Button>
          )}

          {status === 'recording' && (
            <Button 
              onClick={handleStop} 
              disabled={timeLeft > 0 && !canStopRecording} 
              variant={timeLeft === 0 || canStopRecording ? "destructive" : "secondary"}
              size="lg"
              className="w-full sm:flex-1"
            >
             <StopCircle className="mr-2 h-5 w-5" /> 
             {timeLeft > 0 && !canStopRecording ? `Stop (in ${timeLeft}s)` : "Stop Recording"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 